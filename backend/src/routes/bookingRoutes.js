import express from "express";
import Stripe from "stripe";
import { authRequired, requireRole } from "../middleware/auth.js";
import { env } from "../config/env.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

/**
 * Returns the number of rental days between two Date objects.
 * Always returns at least 1 day.
 */
function daysBetween(startDate, endDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.max(Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY), 1);
}

/**
 * Validates and parses a start/end date pair.
 * Returns { start, end } on success or throws with a descriptive message.
 */
function parseDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw Object.assign(new Error("Invalid date format"), { status: 400 });
  }
  if (end <= start) {
    throw Object.assign(new Error("End date must be after start date"), { status: 400 });
  }

  return { start, end };
}

/**
 * GET /api/bookings/my
 * Returns the authenticated customer's bookings, newest first.
 */
router.get("/my", authRequired, requireRole("customer"), async (req, res) => {
  const items = await Booking.find({ userId: req.auth.sub })
    .populate("vehicleId")
    .sort({ createdAt: -1 });

  return res.json({ items });
});

/**
 * GET /api/bookings/payments/my
 * Returns payment history enriched with vehicle info for the current customer.
 */
router.get("/payments/my", authRequired, requireRole("customer"), async (req, res) => {
  const bookings = await Booking.find({ userId: req.auth.sub }).select("_id vehicleId");
  const bookingIds = bookings.map((b) => b._id);
  const vehicleIds = bookings.map((b) => b.vehicleId);

  const [payments, vehicles] = await Promise.all([
    Payment.find({ bookingId: { $in: bookingIds } }).sort({ createdAt: -1 }),
    Vehicle.find({ _id: { $in: vehicleIds } }).select("name type city")
  ]);

  const bookingMap = new Map(bookings.map((b) => [b._id.toString(), b]));
  const vehicleMap = new Map(vehicles.map((v) => [v._id.toString(), v]));

  const items = payments.map((payment) => {
    const booking = bookingMap.get(payment.bookingId.toString());
    const vehicle = booking ? vehicleMap.get(booking.vehicleId.toString()) : null;

    return {
      id: payment._id,
      amount: payment.amount,
      status: payment.status,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      cardholderName: payment.cardholderName,
      cardLast4: payment.cardLast4,
      createdAt: payment.createdAt,
      vehicle: vehicle ? { name: vehicle.name, type: vehicle.type, city: vehicle.city } : null
    };
  });

  return res.json({ items });
});

/**
 * POST /api/bookings/checkout/session
 * Creates a Stripe Checkout session and returns the redirect URL.
 */
router.post("/checkout/session", authRequired, requireRole("customer"), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured" });
  }

  const { vehicleId, startDate, endDate } = req.body;

  if (!vehicleId || !startDate || !endDate) {
    return res.status(400).json({ message: "vehicleId, startDate and endDate are required" });
  }

  let start, end;
  try {
    ({ start, end } = parseDates(startDate, endDate));
  } catch (err) {
    return res.status(err.status || 400).json({ message: err.message });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  if (!vehicle.available) {
    return res.status(409).json({ message: "Vehicle is currently unavailable" });
  }

  const rentalDays = daysBetween(start, end);
  const totalAmount = rentalDays * vehicle.pricePerDay;
  const user = await User.findById(req.auth.sub);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user?.email || undefined,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${vehicle.name} rental`,
            description: `${rentalDays} day(s) in ${vehicle.city}`
          },
          unit_amount: Math.round(totalAmount * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${env.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.frontendUrl}/checkout/${vehicle._id}`,
    metadata: {
      userId: req.auth.sub,
      vehicleId: vehicle._id.toString(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalAmount: String(totalAmount)
    }
  });

  return res.status(201).json({ url: session.url });
});

/**
 * POST /api/bookings/checkout/confirm
 * Called by the frontend after Stripe redirects back.
 * Idempotent — safe to call multiple times for the same session.
 */
router.post("/checkout/confirm", authRequired, requireRole("customer"), async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe is not configured" });
  }

  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== "paid") {
    return res.status(400).json({ message: "Stripe session is not paid" });
  }

  if (!session.metadata || session.metadata.userId !== req.auth.sub) {
    return res.status(403).json({ message: "Session does not belong to current user" });
  }

  // Use session.id as fallback idempotency key when payment_intent is absent
  // (e.g. payment_intent is null for some Stripe payment methods until finalised)
  const intentKey = String(session.payment_intent || session.id);

  const existingPayment = await Payment.findOne({ stripePaymentIntentId: intentKey });
  if (existingPayment) {
    return res.json({ message: "Checkout already confirmed" });
  }

  const vehicle = await Vehicle.findById(session.metadata.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  if (!vehicle.available) {
    return res.status(409).json({ message: "Vehicle became unavailable after payment — contact support" });
  }

  const booking = await Booking.create({
    userId: req.auth.sub,
    vehicleId: vehicle._id,
    status: "confirmed",
    startDate: new Date(session.metadata.startDate),
    endDate: new Date(session.metadata.endDate),
    totalAmount: Number(session.metadata.totalAmount)
  });

  await Payment.create({
    bookingId: booking._id,
    stripePaymentIntentId: intentKey,
    amount: Number(session.metadata.totalAmount),
    status: "succeeded",
    cardholderName: "Stripe Checkout",
    cardLast4: "N/A",
    billingAddress: ""
  });

  vehicle.available = false;
  await vehicle.save();

  const user = await User.findById(req.auth.sub);

  sendEventNotifications({
    user,
    eventType: "booking_confirmed",
    emailMessage: `Booking confirmed for ${vehicle.name}. Total: $${session.metadata.totalAmount}.`,
    smsMessage: `Booking confirmed: ${vehicle.name}. Total $${session.metadata.totalAmount}.`
  }).catch((err) => console.error("booking_confirmed notifications failed:", err.message));

  sendEventNotifications({
    user,
    eventType: "payment_success",
    emailMessage: `Payment of $${session.metadata.totalAmount} received for ${vehicle.name}.`,
    smsMessage: `Payment successful for ${vehicle.name}.`
  }).catch((err) => console.error("payment_success notifications failed:", err.message));

  return res.status(201).json({
    bookingId: booking._id,
    totalAmount: Number(session.metadata.totalAmount)
  });
});

/**
 * POST /api/bookings/:bookingId/return
 * Marks a booking as completed and makes the vehicle available again.
 */
router.post("/:bookingId/return", authRequired, requireRole("customer"), async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    userId: req.auth.sub
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.status === "completed") {
    return res.status(409).json({ message: "Vehicle already returned" });
  }

  booking.status = "completed";
  await booking.save();

  const vehicle = await Vehicle.findById(booking.vehicleId);
  if (vehicle) {
    vehicle.available = true;
    await vehicle.save();
  }

  const user = await User.findById(req.auth.sub);

  sendEventNotifications({
    user,
    eventType: "vehicle_returned",
    emailMessage: `Vehicle return confirmed. Thank you for using Mobility Rental.`,
    smsMessage: `Vehicle return completed. Thank you.`
  }).catch((err) => console.error("vehicle_returned notifications failed:", err.message));

  return res.json({ message: "Vehicle returned successfully" });
});

export default router;
