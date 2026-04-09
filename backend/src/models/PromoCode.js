import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9_-]{3,20}$/
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxUses: {
      type: Number,
      default: null // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0
    },
    expiresAt: {
      type: Date,
      default: null // null = never expires
    },
    active: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

/**
 * Returns true if the code is currently usable.
 */
promoCodeSchema.methods.isValid = function () {
  if (!this.active) return false;
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
  if (this.expiresAt !== null && new Date() > this.expiresAt) return false;
  return true;
};

/**
 * Calculates the discounted total for a given amount.
 * Always returns a value >= 0.
 */
promoCodeSchema.methods.applyTo = function (amount) {
  if (this.discountType === "percentage") {
    return Math.max(amount - (amount * this.discountValue) / 100, 0);
  }
  return Math.max(amount - this.discountValue, 0);
};

export const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
