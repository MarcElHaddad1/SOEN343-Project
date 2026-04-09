<<<<<<< HEAD
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);
const total = await Vehicle.countDocuments({});
const withImage = await Vehicle.countDocuments({ imageUrl: { $exists: true, $ne: "" } });
console.log(JSON.stringify({ total, withImage }));
=======
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);
const total = await Vehicle.countDocuments({});
const withImage = await Vehicle.countDocuments({ imageUrl: { $exists: true, $ne: "" } });
console.log(JSON.stringify({ total, withImage }));
>>>>>>> Testing
await mongoose.disconnect();
