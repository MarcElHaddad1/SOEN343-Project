import mongoose from "mongoose";

const parkingReservationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parkingSpotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot", required: true },
    city: { type: String, required: true, trim: true },
    stripeSessionId: { type: String, default: "" },
    stripePaymentIntentId: { type: String, default: "" },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["reserved", "completed", "cancelled"],
      default: "reserved"
    }
  },
  { timestamps: true }
);

parkingReservationSchema.index(
  { stripeSessionId: 1 },
  { unique: true, partialFilterExpression: { stripeSessionId: { $type: "string", $ne: "" } } }
);

export const ParkingReservation = mongoose.model("ParkingReservation", parkingReservationSchema);
