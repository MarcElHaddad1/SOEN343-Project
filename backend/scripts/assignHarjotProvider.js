import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash("provider123", 10);
let harjot = await User.findOne({ email: "harjot.provider@mobility.local" });

if (!harjot) {
  harjot = await User.create({
    name: "Harjot Singh",
    email: "harjot.provider@mobility.local",
    phone: "+15145550100",
    passwordHash,
    role: "provider",
    approved: true
  });
}

const updated = await Vehicle.updateMany({}, { $set: { providerId: harjot._id } });

console.log(JSON.stringify({
  harjotId: harjot._id.toString(),
  vehiclesUpdated: updated.modifiedCount
}));

await mongoose.disconnect();
