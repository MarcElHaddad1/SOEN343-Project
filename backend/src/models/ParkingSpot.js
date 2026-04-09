import mongoose from "mongoose";

const parkingSpotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    addressFormatted: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    pricePerHour: { type: Number, required: true, min: 0 },
    capacityTotal: { type: Number, required: true, min: 1 },
    capacityAvailable: { type: Number, required: true, min: 0 },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

parkingSpotSchema.index({ name: "text", city: "text", addressFormatted: "text" });

export const ParkingSpot = mongoose.model("ParkingSpot", parkingSpotSchema);
