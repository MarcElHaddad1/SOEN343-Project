import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const res = await Vehicle.deleteMany({ name: /Toyota Corolla/i });
console.log(JSON.stringify({ deleted: res.deletedCount }));
await mongoose.disconnect();
