<<<<<<< HEAD
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    status: {
      type: String,
      enum: ["pending_checkout", "confirmed", "completed", "cancelled"],
      default: "confirmed"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

=======
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    status: {
      type: String,
      enum: ["pending_checkout", "confirmed", "completed", "cancelled"],
      default: "confirmed"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true }
  },
  { timestamps: true }
);

>>>>>>> Testing
export const Booking = mongoose.model("Booking", bookingSchema);
