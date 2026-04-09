import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "provider", "admin"], default: "customer" },
    approved: { type: Boolean, default: true },
    rejected: { type: Boolean, default: false },
    addressFormatted: { type: String, default: "" },
    addressLat: { type: Number },
    addressLng: { type: Number },
    preferredCity: { type: String, default: "Montreal", trim: true },
    preferredMobilityType: { type: String, enum: ["bike", "scooter"], default: "scooter" }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
