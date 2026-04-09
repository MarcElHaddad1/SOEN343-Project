import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
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
  const [usersTotal, customersTotal, providersTotal, providersApproved, providersPending, providersRejected, vehiclesTotal, vehiclesAvailable, bookingsTotal, bookingsCompleted, paymentAgg] = await Promise.all([
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
    ])
  ]);

  const totals = paymentAgg[0] || { totalRevenue: 0, totalPayments: 0 };

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
      totalPayments: totals.totalPayments
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
