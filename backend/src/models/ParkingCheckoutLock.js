import mongoose from "mongoose";

const parkingCheckoutLockSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["processing", "completed"], default: "processing" },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingReservation", default: null }
  },
  { timestamps: true }
);

export const ParkingCheckoutLock = mongoose.model("ParkingCheckoutLock", parkingCheckoutLockSchema);
