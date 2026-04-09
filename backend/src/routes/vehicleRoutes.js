import express from "express";
import mongoose from "mongoose";
import { Vehicle } from "../models/Vehicle.js";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { getRandomVehicleImageUrl } from "../services/vehicleImagePool.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();

function buildSort(sortBy) {
  if (sortBy === "price_asc") return { pricePerDay: 1 };
  if (sortBy === "price_desc") return { pricePerDay: -1 };
  if (sortBy === "name_asc") return { name: 1 };
  if (sortBy === "newest") return { createdAt: -1 };
  return { createdAt: -1 };
}

router.get("/", async (req, res) => {
  const {
    q = "",
    city,
    type,
    minPrice,
    maxPrice,
    available,
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

router.post("/", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);

  if (!user || user.role !== "provider" || !user.approved) {
    return res.status(403).json({ message: "Only approved providers can add vehicles" });
  }

  const { name, type, mileageKm, pricePerDay, city, addressFormatted, lat, lng, available = true } = req.body;

  if (!name || !type || !pricePerDay || !city || !addressFormatted || lat === undefined || lng === undefined) {
    return res.status(400).json({ message: "Missing required vehicle fields" });
  }

  const imageUrl = getRandomVehicleImageUrl(type);

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
    imageUrl,
    providerId: user._id
  });

  sendEventNotifications({
    user,
    eventType: "vehicle_created",
    emailMessage: `Your vehicle ${vehicle.name} has been listed successfully.`,
    smsMessage: `Vehicle listed: ${vehicle.name} in ${vehicle.city}.`
  }).catch((err) => {
    console.error("vehicle_created notifications failed:", err.message);
  });

  return res.status(201).json({ vehicle });
});

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

  const fields = ["name", "type", "mileageKm", "pricePerDay", "city", "addressFormatted", "lat", "lng", "available"];
  for (const key of fields) {
    if (req.body[key] !== undefined) {
      vehicle[key] = key === "mileageKm" || key === "pricePerDay" || key === "lat" || key === "lng"
        ? Number(req.body[key])
        : req.body[key];
    }
  }

  await vehicle.save();

  sendEventNotifications({
    user,
    eventType: "vehicle_updated",
    emailMessage: `Your vehicle ${vehicle.name} has been updated.`,
    smsMessage: `Vehicle updated: ${vehicle.name}.`
  }).catch((err) => {
    console.error("vehicle_updated notifications failed:", err.message);
  });

  return res.json({ vehicle });
});

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
    emailMessage: `Your vehicle ${vehicle.name} has been removed.`,
    smsMessage: `Vehicle removed: ${vehicle.name}.`
  }).catch((err) => {
    console.error("vehicle_deleted notifications failed:", err.message);
  });

  return res.json({ message: "Vehicle deleted" });
});

export default router;
