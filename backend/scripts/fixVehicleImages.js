import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";
import { getRandomVehicleImageUrl } from "../src/services/vehicleImagePool.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const vehicles = await Vehicle.find({
  $or: [
    { imageUrl: { $exists: false } },
    { imageUrl: "" },
    { imageUrl: null },
    { imageUrl: { $regex: /^data:image\// } },
    { imageUrl: { $regex: /^https?:\/\// } },
    { imageUrl: "/pic1.webp" }
  ]
});

for (const vehicle of vehicles) {
  vehicle.imageUrl = getRandomVehicleImageUrl(vehicle.type);
  await vehicle.save();
}

console.log(JSON.stringify({ updated: vehicles.length }));
await mongoose.disconnect();
