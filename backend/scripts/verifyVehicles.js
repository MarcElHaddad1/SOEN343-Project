import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const total = await Vehicle.countDocuments({});
const numbered = await Vehicle.countDocuments({ name: /\s\d+$/ });
const sample = await Vehicle.find({}).select("name city addressFormatted lat lng").limit(5);
console.log(JSON.stringify({ total, numbered, sample }, null, 2));
await mongoose.disconnect();
