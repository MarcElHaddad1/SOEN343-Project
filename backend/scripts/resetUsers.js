import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Booking } from "../src/models/Booking.js";
import { Payment } from "../src/models/Payment.js";
import { Notification } from "../src/models/Notification.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);

const usersToDelete = await User.find({ role: { $ne: "admin" } }).select("_id");
const userIds = usersToDelete.map((u) => u._id);

const bookings = await Booking.find({ userId: { $in: userIds } }).select("_id");
const bookingIds = bookings.map((b) => b._id);

const result = {
  usersDeleted: (await User.deleteMany({ _id: { $in: userIds } })).deletedCount,
  bookingsDeleted: (await Booking.deleteMany({ _id: { $in: bookingIds } })).deletedCount,
  paymentsDeleted: (await Payment.deleteMany({ bookingId: { $in: bookingIds } })).deletedCount,
  notificationsDeleted: (await Notification.deleteMany({ userId: { $in: userIds } })).deletedCount
};

console.log(JSON.stringify(result));
await mongoose.disconnect();
