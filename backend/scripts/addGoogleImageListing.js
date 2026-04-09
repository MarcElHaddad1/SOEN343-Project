import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);

const admin = await User.findOne({ role: "admin" });
if (!admin) {
  throw new Error("Admin user not found");
}

const vehicle = await Vehicle.create({
  name: "2021 Toyota Corolla LE",
  type: "Car",
  mileageKm: 48700,
  pricePerDay: 69,
  city: "Toronto",
  addressFormatted: "100 Front St W, Toronto, ON M5J 1E3, Canada",
  lat: 43.6455,
  lng: -79.3807,
  available: true,
  imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/2019_Toyota_Corolla_Altis_%28front%29.jpg",
  providerId: admin._id
});

console.log(JSON.stringify({ id: vehicle._id.toString(), name: vehicle.name, imageUrl: vehicle.imageUrl }));
await mongoose.disconnect();
