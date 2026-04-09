import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);

const total = await Vehicle.countDocuments({});
const local = await Vehicle.countDocuments({ imageUrl: "/pic1.webp" });
console.log(JSON.stringify({ total, local }));

await mongoose.disconnect();
