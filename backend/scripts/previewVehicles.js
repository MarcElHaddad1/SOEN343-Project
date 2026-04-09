import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const sample = await Vehicle.find({}).select("name type mileageKm pricePerDay city").limit(8);
console.log(JSON.stringify(sample, null, 2));
await mongoose.disconnect();
