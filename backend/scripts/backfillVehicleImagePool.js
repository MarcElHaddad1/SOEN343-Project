import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";
import { getRandomVehicleImageUrl } from "../src/services/vehicleImagePool.js";

dotenv.config();

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const vehicles = await Vehicle.find({});

  for (const vehicle of vehicles) {
    vehicle.imageUrl = getRandomVehicleImageUrl(vehicle.type);
    await vehicle.save();
  }

  console.log(`Backfilled image pool URLs for ${vehicles.length} vehicles`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
