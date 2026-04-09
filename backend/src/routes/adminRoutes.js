import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { ParkingSpot } from "../models/ParkingSpot.js";
import { ParkingReservation } from "../models/ParkingReservation.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();

router.get("/pending-providers", authRequired, requireRole("admin"), async (_req, res) => {
  const providers = await User.find({ role: "provider", approved: false, rejected: { $ne: true } }).sort({ createdAt: -1 });
  return res.json({ providers });
});

router.get("/providers", authRequired, requireRole("admin"), async (_req, res) => {
  const providers = await User.find({ role: "provider" }).sort({ createdAt: -1 });
  return res.json({ providers });
});

router.get("/users", authRequired, requireRole("admin"), async (_req, res) => {
  const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });
  return res.json({ users });
});

router.get("/stats", authRequired, requireRole("admin"), async (_req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [usersTotal, customersTotal, providersTotal, providersApproved, providersPending, providersRejected, vehiclesTotal, vehiclesAvailable, bookingsTotal, bookingsCompleted, paymentAgg, parkingSpotsTotal, parkingSpotsAvailable, parkingReservationsTotal, parkingReservedByCity, scootersCurrentlyAvailable, tripsCompletedToday, bikesCurrentlyRentedAgg, mobilityUsageAgg, usagePerCityAgg, activeRentalsByCityAgg, parkingCapacityByCityAgg] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "provider" }),
    User.countDocuments({ role: "provider", approved: true }),
    User.countDocuments({ role: "provider", approved: false, rejected: { $ne: true } }),
    User.countDocuments({ role: "provider", rejected: true }),
    Vehicle.countDocuments({}),
    Vehicle.countDocuments({ available: true }),
    Booking.countDocuments({}),
    Booking.countDocuments({ status: "completed" }),
    Payment.aggregate([
      { $match: { status: "succeeded" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalPayments: { $sum: 1 } } }
    ]),
    ParkingSpot.countDocuments({}),
    ParkingSpot.countDocuments({ capacityAvailable: { $gt: 0 } }),
    ParkingReservation.countDocuments({}),
    ParkingReservation.aggregate([
      { $match: { status: "reserved" } },
      { $group: { _id: "$city", activeReservations: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Vehicle.countDocuments({ available: true, type: { $regex: "^scooter$", $options: "i" } }),
    Booking.countDocuments({ status: "completed", updatedAt: { $gte: startOfToday } }),
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      { $unwind: "$vehicle" },
      { $match: { "vehicle.type": { $regex: "^bike$", $options: "i" } } },
      { $count: "count" }
    ]),
    Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      { $unwind: "$vehicle" },
      {
        $group: {
          _id: { $toLower: "$vehicle.type" },
          trips: { $sum: 1 }
        }
      }
    ]),
    Booking.aggregate([
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      { $unwind: "$vehicle" },
      { $group: { _id: "$vehicle.city", trips: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Booking.aggregate([
      { $match: { status: "confirmed" } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      { $unwind: "$vehicle" },
      { $group: { _id: "$vehicle.city", activeRentals: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    ParkingSpot.aggregate([
      {
        $group: {
          _id: "$city",
          totalCapacity: { $sum: "$capacityTotal" },
          availableCapacity: { $sum: "$capacityAvailable" }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  const totals = paymentAgg[0] || { totalRevenue: 0, totalPayments: 0 };
  const bikesCurrentlyRented = bikesCurrentlyRentedAgg[0]?.count || 0;
  const bikeTrips = mobilityUsageAgg.find((item) => item._id === "bike")?.trips || 0;
  const scooterTrips = mobilityUsageAgg.find((item) => item._id === "scooter")?.trips || 0;
  const mostUsedMobilityOption = bikeTrips === scooterTrips
    ? "tie"
    : bikeTrips > scooterTrips
      ? "bike"
      : "scooter";

  return res.json({
    metrics: {
      usersTotal,
      customersTotal,
      providersTotal,
      providersApproved,
      providersPending,
      providersRejected,
      vehiclesTotal,
      vehiclesAvailable,
      bookingsTotal,
      bookingsCompleted,
      totalRevenue: totals.totalRevenue,
      totalPayments: totals.totalPayments,
      parkingSpotsTotal,
      parkingSpotsAvailable,
      parkingReservationsTotal,
      parkingReservedByCity: parkingReservedByCity.map((item) => ({
        city: item._id,
        activeReservations: item.activeReservations
      })),
      bikesCurrentlyRented,
      scootersCurrentlyAvailable,
      tripsCompletedToday,
      mobilityUsage: {
        bikeTrips,
        scooterTrips,
        mostUsedMobilityOption
      },
      usagePerCity: usagePerCityAgg.map((item) => ({
        city: item._id,
        trips: item.trips
      })),
      activeRentalsByCity: activeRentalsByCityAgg.map((item) => ({
        city: item._id,
        activeRentals: item.activeRentals
      })),
      parkingUtilizationByCity: parkingCapacityByCityAgg.map((item) => {
        const reservedCapacity = Math.max(item.totalCapacity - item.availableCapacity, 0);
        const utilizationPct = item.totalCapacity
          ? (reservedCapacity / item.totalCapacity) * 100
          : 0;
        return {
          city: item._id,
          totalCapacity: item.totalCapacity,
          reservedCapacity,
          availableCapacity: item.availableCapacity,
          utilizationPct
        };
      })
    }
  });
});

router.post("/providers/:userId/approve", authRequired, requireRole("admin"), async (req, res) => {
  const provider = await User.findById(req.params.userId);

  if (!provider || provider.role !== "provider") {
    return res.status(404).json({ message: "Provider not found" });
  }

  provider.approved = true;
  provider.rejected = false;
  await provider.save();

  sendEventNotifications({
    user: provider,
    eventType: "provider_approved",
    emailMessage: `Hi ${provider.name}, your provider account has been approved.`,
    smsMessage: `Your provider account is approved. You can now list vehicles.`
  }).catch((err) => {
    console.error("Provider approval notifications failed:", err.message);
  });

  return res.json({ provider });
});

router.post("/providers/:userId/reject", authRequired, requireRole("admin"), async (req, res) => {
  const provider = await User.findById(req.params.userId);

  if (!provider || provider.role !== "provider") {
    return res.status(404).json({ message: "Provider not found" });
  }

  provider.approved = false;
  provider.rejected = true;
  await provider.save();

  sendEventNotifications({
    user: provider,
    eventType: "provider_rejected",
    emailMessage: `Hi ${provider.name}, your provider account is currently rejected.`,
    smsMessage: `Your provider account was rejected. Contact support for details.`
  }).catch((err) => {
    console.error("Provider rejection notifications failed:", err.message);
  });

  return res.json({ provider });
});

export default router;
