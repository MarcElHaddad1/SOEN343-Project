import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { Booking } from "../models/Booking.js";
import { Payment } from "../models/Payment.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();

// All routes require admin role
router.use(authRequired, requireRole("admin"));

/**
 * GET /api/admin/pending-providers
 * Providers that have not yet been approved or rejected.
 * Used by the Approval Center UI.
 */
router.get("/pending-providers", async (_req, res) => {
  const providers = await User.find({
    role: "provider",
    approved: false,
    rejected: { $ne: true }
  }).sort({ createdAt: -1 });

  return res.json({ providers });
});

/**
 * GET /api/admin/providers
 * All providers regardless of status.
 * Used by the Stats page provider table.
 */
router.get("/providers", async (_req, res) => {
  const providers = await User.find({ role: "provider" }).sort({ createdAt: -1 });
  return res.json({ providers });
});

/**
 * GET /api/admin/users
 * All customer accounts.
 */
router.get("/users", async (_req, res) => {
  const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });
  return res.json({ users });
});

/**
 * GET /api/admin/stats
 * Platform-wide metrics for the stats dashboard.
 */
router.get("/stats", async (_req, res) => {
  const [
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
    paymentAgg
  ] = await Promise.all([
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

/**
 * POST /api/admin/providers/:userId/approve
 */
router.post("/providers/:userId/approve", async (req, res) => {
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
    emailMessage: `Hi ${provider.name}, your provider account has been approved. You can now list vehicles.`,
    smsMessage: `Your provider account is approved. You can now list vehicles.`
  }).catch((err) => {
    console.error("Provider approval notifications failed:", err.message);
  });

  return res.json({ provider });
});

/**
 * POST /api/admin/providers/:userId/reject
 */
router.post("/providers/:userId/reject", async (req, res) => {
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
    emailMessage: `Hi ${provider.name}, your provider account application was not approved. Please contact support for details.`,
    smsMessage: `Your provider account was rejected. Contact support for details.`
  }).catch((err) => {
    console.error("Provider rejection notifications failed:", err.message);
  });

  return res.json({ provider });
});

export default router;
