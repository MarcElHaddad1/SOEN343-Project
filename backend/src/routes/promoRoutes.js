import express from "express";
import { authRequired, requireRole } from "../middleware/auth.js";
import { PromoCode } from "../models/PromoCode.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Public / Customer endpoints
// ---------------------------------------------------------------------------

/**
 * POST /api/promos/validate
 * Validates a promo code and returns the discount details.
 * Does NOT consume a use — that happens at checkout confirm.
 *
 * Body: { code, amount }
 */
router.post("/validate", authRequired, async (req, res) => {
  const { code, amount } = req.body;

  if (!code || amount === undefined) {
    return res.status(400).json({ message: "code and amount are required" });
  }

  const promo = await PromoCode.findOne({ code: String(code).toUpperCase().trim() });

  if (!promo || !promo.isValid()) {
    return res.status(404).json({ message: "Promo code is invalid or expired" });
  }

  const originalAmount = Number(amount);
  const discountedAmount = promo.applyTo(originalAmount);
  const savings = +(originalAmount - discountedAmount).toFixed(2);

  return res.json({
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    originalAmount,
    discountedAmount: +discountedAmount.toFixed(2),
    savings
  });
});

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/promos
 * Admin — list all promo codes.
 */
router.get("/", authRequired, requireRole("admin"), async (_req, res) => {
  const promos = await PromoCode.find().sort({ createdAt: -1 });
  return res.json({ promos });
});

/**
 * POST /api/promos
 * Admin — create a new promo code.
 *
 * Body: { code, discountType, discountValue, maxUses?, expiresAt?, active? }
 */
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  const { code, discountType, discountValue, maxUses = null, expiresAt = null, active = true } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({ message: "code, discountType, and discountValue are required" });
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    return res.status(400).json({ message: "discountType must be 'percentage' or 'fixed'" });
  }

  if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
    return res.status(400).json({ message: "Percentage discount must be between 0 and 100" });
  }

  const existing = await PromoCode.findOne({ code: String(code).toUpperCase().trim() });
  if (existing) {
    return res.status(409).json({ message: "A promo code with this name already exists" });
  }

  const promo = await PromoCode.create({
    code,
    discountType,
    discountValue: Number(discountValue),
    maxUses: maxUses ? Number(maxUses) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    active,
    createdBy: req.auth.sub
  });

  return res.status(201).json({ promo });
});

/**
 * PATCH /api/promos/:promoId
 * Admin — update a promo code (active toggle, expiry, maxUses).
 */
router.patch("/:promoId", authRequired, requireRole("admin"), async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);
  if (!promo) {
    return res.status(404).json({ message: "Promo code not found" });
  }

  const { active, maxUses, expiresAt, discountValue, discountType } = req.body;

  if (active !== undefined) promo.active = Boolean(active);
  if (maxUses !== undefined) promo.maxUses = maxUses === null ? null : Number(maxUses);
  if (expiresAt !== undefined) promo.expiresAt = expiresAt === null ? null : new Date(expiresAt);
  if (discountValue !== undefined) promo.discountValue = Number(discountValue);
  if (discountType !== undefined) promo.discountType = discountType;

  await promo.save();
  return res.json({ promo });
});

/**
 * DELETE /api/promos/:promoId
 * Admin — permanently delete a promo code.
 */
router.delete("/:promoId", authRequired, requireRole("admin"), async (req, res) => {
  const promo = await PromoCode.findById(req.params.promoId);
  if (!promo) {
    return res.status(404).json({ message: "Promo code not found" });
  }
  await promo.deleteOne();
  return res.json({ message: "Promo code deleted" });
});

export default router;
