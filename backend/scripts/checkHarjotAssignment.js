import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";
import { User } from "../src/models/User.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const harjot = await User.findOne({ email: "harjot.provider@mobility.local" }).select("name email");
const count = await Vehicle.countDocuments({ providerId: harjot._id });
console.log(JSON.stringify({ harjot, vehiclesAssigned: count }, null, 2));
await mongoose.disconnect();
