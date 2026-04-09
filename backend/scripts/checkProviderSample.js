<<<<<<< HEAD
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const sample = await Vehicle.findOne({}).populate("providerId", "name email").select("name providerId");
console.log(JSON.stringify(sample, null, 2));
=======
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });
await mongoose.connect(process.env.MONGODB_URI);
const sample = await Vehicle.findOne({}).populate("providerId", "name email").select("name providerId");
console.log(JSON.stringify(sample, null, 2));
>>>>>>> Testing
await mongoose.disconnect();
