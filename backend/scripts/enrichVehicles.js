import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

const catalog = [
  { type: "Car", label: "Toyota Corolla LE", minKm: 12000, maxKm: 98000, minPrice: 40, maxPrice: 85 },
  { type: "Car", label: "Honda Civic EX", minKm: 10000, maxKm: 90000, minPrice: 42, maxPrice: 88 },
  { type: "SUV", label: "Mazda CX-5 GS", minKm: 15000, maxKm: 110000, minPrice: 58, maxPrice: 120 },
  { type: "SUV", label: "Hyundai Tucson Preferred", minKm: 9000, maxKm: 95000, minPrice: 55, maxPrice: 118 },
  { type: "Car", label: "Volkswagen Jetta Comfortline", minKm: 14000, maxKm: 100000, minPrice: 45, maxPrice: 92 },
  { type: "E-Bike", label: "Specialized Turbo Vado 4.0", minKm: 200, maxKm: 8500, minPrice: 28, maxPrice: 55 },
  { type: "Bike", label: "Trek FX 3 Disc", minKm: 150, maxKm: 6000, minPrice: 18, maxPrice: 35 },
  { type: "Scooter", label: "NIU KQi3 Pro", minKm: 80, maxKm: 4500, minPrice: 16, maxPrice: 32 },
  { type: "Scooter", label: "Segway Ninebot Max G2", minKm: 120, maxKm: 5000, minPrice: 18, maxPrice: 36 },
  { type: "E-Bike", label: "Rad Power RadCity 5 Plus", minKm: 220, maxKm: 9000, minPrice: 24, maxPrice: 50 }
];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

await mongoose.connect(process.env.MONGODB_URI);
const vehicles = await Vehicle.find({}).sort({ createdAt: 1 });

for (const vehicle of vehicles) {
  const item = pick(catalog);
  const year = Math.floor(rand(2018, 2025));
  const mileageKm = Math.round(rand(item.minKm, item.maxKm));
  vehicle.name = `${year} ${item.label}`;
  vehicle.type = item.type;
  vehicle.mileageKm = mileageKm;
  vehicle.pricePerDay = Math.round(rand(item.minPrice, item.maxPrice));
  await vehicle.save();
}

console.log(`Enriched ${vehicles.length} vehicles with realistic names and mileage`);
await mongoose.disconnect();
