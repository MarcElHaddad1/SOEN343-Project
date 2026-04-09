import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    mileageKm: { type: Number, default: 0 },
    pricePerDay: { type: Number, required: true },
    city: { type: String, required: true, trim: true },
    addressFormatted: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    avgRating: { type: Number, default: null },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

vehicleSchema.index({ name: "text", type: "text", city: "text", addressFormatted: "text" });

export const Vehicle = mongoose.model("Vehicle", vehicleSchema);
