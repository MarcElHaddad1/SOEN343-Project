import express from "express";
import mongoose from "mongoose";
import { Vehicle } from "../models/Vehicle.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();

function buildSort(sortBy) {
  if (sortBy === "price_asc") return { pricePerDay: 1 };
  if (sortBy === "price_desc") return { pricePerDay: -1 };
  if (sortBy === "name_asc") return { name: 1 };
  return { createdAt: -1 }; // default: newest
}

/**
 * GET /api/vehicles
 * Public search endpoint with filtering, sorting, and pagination.
 *
 * Query params:
 *   q          — full-text search across name, type, city, address
 *   city       — exact city match
 *   type       — exact type match (Car, Bike, Scooter, …)
 *   minPrice   — minimum pricePerDay
 *   maxPrice   — maximum pricePerDay
 *   available  — "true" | "false"
 *   providerId — filter to a single provider's listings (used by ProviderPage)
 *   sortBy     — newest | price_asc | price_desc | name_asc
 *   page       — 1-based page number (default 1)
 *   limit      — results per page (default 12, max 48)
 */
router.get("/", async (req, res) => {
  const {
    q = "",
    city,
    type,
    minPrice,
    maxPrice,
    available,
    providerId,
    sortBy = "newest",
    page = 1,
    limit = 12
  } = req.query;

  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { type: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { addressFormatted: { $regex: q, $options: "i" } }
    ];
  }

  if (city) filter.city = city;
  if (type) filter.type = type;
  if (available === "true") filter.available = true;
  if (available === "false") filter.available = false;

  // Fix: allow ProviderPage (and any caller) to filter by a specific provider
  // without fetching all vehicles and filtering client-side.
  if (providerId && mongoose.Types.ObjectId.isValid(providerId)) {
    filter.providerId = new mongoose.Types.ObjectId(providerId);
  }

  if (minPrice || maxPrice) {
    filter.pricePerDay = {};
    if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
  }

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 48);

  const [items, total] = await Promise.all([
    Vehicle.find(filter)
      .populate("providerId", "name email phone")
      .sort(buildSort(sortBy))
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Vehicle.countDocuments(filter)
  ]);

  return res.json({
    items,
    meta: {
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize)
    }
  });
});

/**
 * GET /api/vehicles/:vehicleId
 * Public — returns a single vehicle with populated provider info.
 */
router.get("/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    return res.status(400).json({ message: "Invalid vehicle id" });
  }

  const vehicle = await Vehicle.findById(vehicleId).populate("providerId", "name email phone");
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  return res.json({ vehicle });
});

/**
 * POST /api/vehicles
 * Approved providers only — create a new vehicle listing.
 */
router.post("/", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);

  if (!user || user.role !== "provider" || !user.approved) {
    return res.status(403).json({ message: "Only approved providers can add vehicles" });
  }

  const {
    name, type, mileageKm, pricePerDay, city,
    addressFormatted, lat, lng, available = true
  } = req.body;

  if (!name || !type || !pricePerDay || !city || !addressFormatted || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "Missing required vehicle fields" });
  }

  const vehicle = await Vehicle.create({
    name,
    type,
    mileageKm: Number(mileageKm || 0),
    pricePerDay: Number(pricePerDay),
    city,
    addressFormatted,
    lat: Number(lat),
    lng: Number(lng),
    available: Boolean(available),
    imageUrl: "/pic1.webp",
    providerId: user._id
  });

  sendEventNotifications({
    user,
    eventType: "vehicle_created",
    emailMessage: `Your vehicle "${vehicle.name}" has been listed successfully.`,
    smsMessage: `Vehicle listed: ${vehicle.name} in ${vehicle.city}.`
  }).catch((err) => console.error("vehicle_created notifications failed:", err.message));

  return res.status(201).json({ vehicle });
});

/**
 * PATCH /api/vehicles/:vehicleId
 * Approved providers only — update their own listing.
 */
router.patch("/:vehicleId", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);

  if (!user || user.role !== "provider" || !user.approved) {
    return res.status(403).json({ message: "Only approved providers can update vehicles" });
  }

  const vehicle = await Vehicle.findById(req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  if (vehicle.providerId.toString() !== user._id.toString()) {
    return res.status(403).json({ message: "You can only edit your own vehicles" });
  }

  const numericFields = new Set(["mileageKm", "pricePerDay", "lat", "lng"]);
  const allowedFields = ["name", "type", "mileageKm", "pricePerDay", "city", "addressFormatted", "lat", "lng", "available"];

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      vehicle[key] = numericFields.has(key) ? Number(req.body[key]) : req.body[key];
    }
  }

  await vehicle.save();

  sendEventNotifications({
    user,
    eventType: "vehicle_updated",
    emailMessage: `Your vehicle "${vehicle.name}" has been updated.`,
    smsMessage: `Vehicle updated: ${vehicle.name}.`
  }).catch((err) => console.error("vehicle_updated notifications failed:", err.message));

  return res.json({ vehicle });
});

/**
 * DELETE /api/vehicles/:vehicleId
 * Approved providers only — remove their own listing.
 */
router.delete("/:vehicleId", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);

  if (!user || user.role !== "provider" || !user.approved) {
    return res.status(403).json({ message: "Only approved providers can delete vehicles" });
  }

  const vehicle = await Vehicle.findById(req.params.vehicleId);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }
  if (vehicle.providerId.toString() !== user._id.toString()) {
    return res.status(403).json({ message: "You can only delete your own vehicles" });
  }

  await vehicle.deleteOne();

  sendEventNotifications({
    user,
    eventType: "vehicle_deleted",
    emailMessage: `Your vehicle "${vehicle.name}" has been removed from listings.`,
    smsMessage: `Vehicle removed: ${vehicle.name}.`
  }).catch((err) => console.error("vehicle_deleted notifications failed:", err.message));

  return res.json({ message: "Vehicle deleted" });
});

export default router;
