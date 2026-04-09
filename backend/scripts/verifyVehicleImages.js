import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";
import { env } from "../src/config/env.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

const total = await Vehicle.countDocuments({});
const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || `http://localhost:${env.port}`).replace(/\/+$/, "");
const pattern = `^${backendPublicUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\/vehicle-pool\\/`;
const localPool = await Vehicle.countDocuments({ imageUrl: { $regex: new RegExp(pattern) } });
console.log(JSON.stringify({ total, localPool, backendPublicUrl }));

await mongoose.disconnect();
