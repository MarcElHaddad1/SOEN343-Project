import express from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import { authRequired, requireRole } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ParkingSpot } from "../models/ParkingSpot.js";
import { ParkingReservation } from "../models/ParkingReservation.js";
import { ParkingCheckoutLock } from "../models/ParkingCheckoutLock.js";

const router = express.Router();
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

function parseDateOnly(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function daysBetweenInclusive(startDate, endDate) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((endDate.getTime() - startDate.getTime()) / oneDay);
  return Math.max(diff + 1, 1);
}

router.get("/spots", authRequired, async (req, res) => {
  const { city = "", available = "", q = "" } = req.query;
  const filter = {};

  if (city) filter.city = city;
  if (available === "true") filter.capacityAvailable = { $gt: 0 };
  if (available === "false") filter.capacityAvailable = { $lte: 0 };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { addressFormatted: { $regex: q, $options: "i" } }
    ];
  }

  const items = await ParkingSpot.find(filter)
    .populate("providerId", "name email")
    .sort({ createdAt: -1 });

  return res.json({ items });
});

router.get("/spots/my", authRequired, requireRole("provider"), async (req, res) => {
  const provider = await User.findById(req.auth.sub);
  if (!provider || !provider.approved) {
    return res.status(403).json({ message: "Only approved providers can manage parking spots" });
  }

  const items = await ParkingSpot.find({ providerId: req.auth.sub }).sort({ createdAt: -1 });
  return res.json({ items });
});

router.post("/spots", authRequired, requireRole("provider"), async (req, res) => {
  const provider = await User.findById(req.auth.sub);
  if (!provider || !provider.approved) {
    return res.status(403).json({ message: "Only approved providers can add parking spots" });
  }

  const { name, city, addressFormatted, lat, lng, pricePerHour, capacityTotal } = req.body;
  if (!name || !city || !addressFormatted || lat === undefined || lng === undefined || !pricePerHour || !capacityTotal) {
    return res.status(400).json({ message: "Missing required parking spot fields" });
  }

  const total = Number(capacityTotal);
  const spot = await ParkingSpot.create({
    name,
    city,
    addressFormatted,
    lat: Number(lat),
    lng: Number(lng),
    pricePerHour: Number(pricePerHour),
    capacityTotal: total,
    capacityAvailable: total,
    providerId: provider._id
  });

  return res.status(201).json({ spot });
});

router.patch("/spots/:spotId", authRequired, requireRole("provider"), async (req, res) => {
  const provider = await User.findById(req.auth.sub);
  if (!provider || !provider.approved) {
    return res.status(403).json({ message: "Only approved providers can update parking spots" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.spotId)) {
    return res.status(400).json({ message: "Invalid parking spot id" });
  }

  const spot = await ParkingSpot.findById(req.params.spotId);
  if (!spot) return res.status(404).json({ message: "Parking spot not found" });
  if (spot.providerId.toString() !== req.auth.sub) {
    return res.status(403).json({ message: "You can only edit your own parking spots" });
  }

  const fields = ["name", "city", "addressFormatted", "lat", "lng", "pricePerHour", "capacityTotal"];
  for (const key of fields) {
    if (req.body[key] !== undefined) {
      if (["lat", "lng", "pricePerHour", "capacityTotal"].includes(key)) {
        spot[key] = Number(req.body[key]);
      } else {
        spot[key] = req.body[key];
      }
    }
  }

  if (req.body.capacityTotal !== undefined) {
    const activeReservations = await ParkingReservation.countDocuments({
      parkingSpotId: spot._id,
      status: "reserved"
    });
    spot.capacityAvailable = Math.max(spot.capacityTotal - activeReservations, 0);
  }

  await spot.save();
  return res.json({ spot });
});

router.delete("/spots/:spotId", authRequired, requireRole("provider"), async (req, res) => {
  const provider = await User.findById(req.auth.sub);
  if (!provider || !provider.approved) {
    return res.status(403).json({ message: "Only approved providers can delete parking spots" });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.spotId)) {
    return res.status(400).json({ message: "Invalid parking spot id" });
  }

  const spot = await ParkingSpot.findById(req.params.spotId);
  if (!spot) return res.status(404).json({ message: "Parking spot not found" });
  if (spot.providerId.toString() !== req.auth.sub) {
    return res.status(403).json({ message: "You can only delete your own parking spots" });
  }

  const activeReservations = await ParkingReservation.countDocuments({
    parkingSpotId: spot._id,
    status: "reserved"
  });
  if (activeReservations > 0) {
    return res.status(409).json({ message: "Cannot delete spot with active reservations" });
  }

  await spot.deleteOne();
  return res.json({ message: "Parking spot deleted" });
});

router.get("/reservations/my", authRequired, requireRole("customer"), async (req, res) => {
  const items = await ParkingReservation.find({ userId: req.auth.sub })
    .populate("parkingSpotId")
    .sort({ createdAt: -1 });
  return res.json({ items });
});

router.post("/checkout/session", authRequired, requireRole("customer"), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured" });
  }

  const { parkingSpotId, startDate, endDate } = req.body;
  if (!parkingSpotId || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing checkout payload" });
  }

  if (!mongoose.Types.ObjectId.isValid(parkingSpotId)) {
    return res.status(400).json({ message: "Invalid parking spot id" });
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end < start) {
    return res.status(400).json({ message: "Invalid reservation date range" });
  }

  const spot = await ParkingSpot.findById(parkingSpotId);
  if (!spot) {
    return res.status(404).json({ message: "Parking spot not found" });
  }
  if (spot.capacityAvailable <= 0) {
    return res.status(409).json({ message: "Parking spot is currently full" });
  }

  const user = await User.findById(req.auth.sub);
  const totalAmount = daysBetweenInclusive(start, end) * spot.pricePerHour;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user?.email || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Parking: ${spot.name}`,
            description: `${spot.city} - ${startDate} to ${endDate}`
          },
          unit_amount: Math.round(totalAmount * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${env.frontendUrl}/parking/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/parking`,
    metadata: {
      userId: req.auth.sub,
      parkingSpotId: spot._id.toString(),
      city: spot.city,
      startDate,
      endDate,
      totalAmount: String(totalAmount)
    }
  });

  return res.status(201).json({ url: session.url });
});

router.post("/checkout/confirm", authRequired, requireRole("customer"), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured" });
  }

  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Missing session id" });
  }

  try {
    await ParkingCheckoutLock.create({ sessionId, status: "processing" });
  } catch (err) {
    if (err?.code === 11000) {
      const existingReservation = await ParkingReservation.findOne({ stripeSessionId: sessionId });
      if (existingReservation) {
        return res.json({ message: "Checkout already confirmed", reservationId: existingReservation._id });
      }
      return res.status(202).json({ message: "Checkout confirmation is already being processed" });
    }
    throw err;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== "paid") {
    await ParkingCheckoutLock.deleteOne({ sessionId });
    return res.status(400).json({ message: "Stripe session is not paid" });
  }
  if (!session.metadata || session.metadata.userId !== req.auth.sub) {
    await ParkingCheckoutLock.deleteOne({ sessionId });
    return res.status(403).json({ message: "Session does not belong to current user" });
  }

  const existing = await ParkingReservation.findOne({ stripeSessionId: session.id });
  if (existing) {
    await ParkingCheckoutLock.updateOne(
      { sessionId },
      { $set: { status: "completed", reservationId: existing._id } }
    );
    return res.json({ message: "Checkout already confirmed", reservationId: existing._id });
  }

  const startDate = session.metadata.startDate || "";
  const endDate = session.metadata.endDate || "";
  const parsedStart = parseDateOnly(startDate);
  const parsedEnd = parseDateOnly(endDate);
  if (!parsedStart || !parsedEnd) {
    await ParkingCheckoutLock.deleteOne({ sessionId });
    return res.status(400).json({ message: "Invalid parking reservation dates in checkout session" });
  }

  const spot = await ParkingSpot.findOneAndUpdate(
    { _id: session.metadata.parkingSpotId, capacityAvailable: { $gt: 0 } },
    { $inc: { capacityAvailable: -1 } },
    { new: true }
  );
  if (!spot) {
    await ParkingCheckoutLock.deleteOne({ sessionId });
    return res.status(409).json({ message: "Parking spot is currently full" });
  }

  let reservation;
  try {
    reservation = await ParkingReservation.create({
      userId: req.auth.sub,
      parkingSpotId: spot._id,
      city: session.metadata.city,
      stripeSessionId: session.id,
      stripePaymentIntentId: String(session.payment_intent || ""),
      startTime: parsedStart,
      endTime: parsedEnd,
      totalAmount: Number(session.metadata.totalAmount),
      status: "reserved"
    });
  } catch (err) {
    await ParkingSpot.updateOne({ _id: spot._id }, { $inc: { capacityAvailable: 1 } });
    if (err?.code === 11000) {
      const alreadyCreated = await ParkingReservation.findOne({ stripeSessionId: session.id });
      if (alreadyCreated) {
        await ParkingCheckoutLock.updateOne(
          { sessionId },
          { $set: { status: "completed", reservationId: alreadyCreated._id } }
        );
        return res.json({ message: "Checkout already confirmed", reservationId: alreadyCreated._id });
      }
    }
    await ParkingCheckoutLock.deleteOne({ sessionId });
    throw err;
  }

  await ParkingCheckoutLock.updateOne(
    { sessionId },
    { $set: { status: "completed", reservationId: reservation._id } }
  );

  return res.status(201).json({ reservationId: reservation._id });
});

export default router;
