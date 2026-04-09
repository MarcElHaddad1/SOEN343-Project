import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    channel: { type: String, enum: ["email", "sms"], required: true },
    eventType: { type: String, required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    message: { type: String, required: true },
    error: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
