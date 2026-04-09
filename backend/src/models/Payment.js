<<<<<<< HEAD
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    stripePaymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["succeeded", "failed"], required: true },
    cardholderName: { type: String, required: true },
    cardLast4: { type: String, required: true },
    billingAddress: { type: String, default: "" }
  },
  { timestamps: true }
);

=======
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    stripePaymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["succeeded", "failed"], required: true },
    cardholderName: { type: String, required: true },
    cardLast4: { type: String, required: true },
    billingAddress: { type: String, default: "" }
  },
  { timestamps: true }
);

>>>>>>> Testing
export const Payment = mongoose.model("Payment", paymentSchema);
