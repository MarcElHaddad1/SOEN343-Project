<<<<<<< HEAD
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";
import { generateVehicleImage } from "../src/services/imageService.js";

dotenv.config();

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
const realAddresses = [
  { city: "Montreal", addressFormatted: "1001 Rue du Square-Victoria, Montreal, QC H2Z 2A7, Canada", lat: 45.501944, lng: -73.5625 },
  { city: "Montreal", addressFormatted: "1500 Avenue McGill College, Montreal, QC H3A 3J5, Canada", lat: 45.5013, lng: -73.5706 },
  { city: "Montreal", addressFormatted: "1600 Boulevard René-Lévesque O, Montreal, QC H3H 1P9, Canada", lat: 45.4937, lng: -73.5772 },
  { city: "Toronto", addressFormatted: "100 Front St W, Toronto, ON M5J 1E3, Canada", lat: 43.6455, lng: -79.3807 },
  { city: "Toronto", addressFormatted: "200 Bay St, Toronto, ON M5J 2J2, Canada", lat: 43.6469, lng: -79.379 },
  { city: "Toronto", addressFormatted: "55 Bloor St W, Toronto, ON M4W 1A5, Canada", lat: 43.6698, lng: -79.3892 },
  { city: "Vancouver", addressFormatted: "1155 Georgia St W, Vancouver, BC V6E 0B3, Canada", lat: 49.2867, lng: -123.1234 },
  { city: "Vancouver", addressFormatted: "200 Burrard St, Vancouver, BC V6C 3L6, Canada", lat: 49.2878, lng: -123.1169 },
  { city: "Vancouver", addressFormatted: "601 W Cordova St, Vancouver, BC V6B 1G1, Canada", lat: 49.2853, lng: -123.1128 },
  { city: "Calgary", addressFormatted: "113 6 Ave SW, Calgary, AB T2P 0S5, Canada", lat: 51.047, lng: -114.0718 },
  { city: "Calgary", addressFormatted: "317 7 Ave SW, Calgary, AB T2P 2Y9, Canada", lat: 51.0465, lng: -114.0692 },
  { city: "Calgary", addressFormatted: "645 7 Ave SW, Calgary, AB T2P 4G8, Canada", lat: 51.0462, lng: -114.0789 },
  { city: "Ottawa", addressFormatted: "100 Queen St, Ottawa, ON K1P 1J9, Canada", lat: 45.4213, lng: -75.7009 },
  { city: "Ottawa", addressFormatted: "111 Wellington St, Ottawa, ON K1A 0A9, Canada", lat: 45.4236, lng: -75.7009 },
  { city: "Ottawa", addressFormatted: "90 Elgin St, Ottawa, ON K1P 5E9, Canada", lat: 45.4216, lng: -75.6959 }
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required for seed");
  }

  await mongoose.connect(mongoUri);

  await Promise.all([
    Vehicle.deleteMany({}),
    User.deleteMany({ role: { $in: ["provider", "customer"] } })
  ]);

  const passwordHash = await bcrypt.hash("provider123", 10);

  const providers = await User.insertMany([
    {
      name: "Harjot Singh",
      email: "harjot.provider@mobility.local",
      phone: "+15145550100",
      passwordHash,
      role: "provider",
      approved: true
    },
    ...Array.from({ length: 4 }).map((_, idx) => ({
      name: `Provider ${idx + 2}`,
      email: `provider${idx + 2}@mobility.local`,
      phone: `+15145550${String(101 + idx)}`,
      passwordHash,
      role: "provider",
      approved: true
    }))
  ]);

  const targetCount = Number(process.env.SEED_COUNT || 50);
  const vehicles = Array.from({ length: targetCount }).map((_, idx) => {
    const address = realAddresses[idx % realAddresses.length];
    const item = pick(catalog);
    const provider = pick(providers);
    const year = Math.floor(rand(2018, 2025));
    const mileageKm = Math.round(rand(item.minKm, item.maxKm));

    return {
      name: `${year} ${item.label}`,
      type: item.type,
      mileageKm,
      pricePerDay: Math.round(rand(item.minPrice, item.maxPrice)),
      city: address.city,
      addressFormatted: address.addressFormatted,
      lat: address.lat,
      lng: address.lng,
      available: Math.random() > 0.25,
      imageUrl: "",
      providerId: provider._id
    };
  });

  for (let i = 0; i < vehicles.length; i += 1) {
    const vehicle = vehicles[i];
    try {
      const imageUrl = await generateVehicleImage(vehicle);
      vehicle.imageUrl = imageUrl;
      console.log(`Generated image ${i + 1}/${vehicles.length}: ${vehicle.name}`);
    } catch (err) {
      console.error(`Image generation failed ${i + 1}/${vehicles.length}: ${vehicle.name}`, err.message);
    }

    await Vehicle.create(vehicle);
    console.log(`Saved vehicle ${i + 1}/${vehicles.length}: ${vehicle.name}`);
  }

  console.log(`Seed complete: ${vehicles.length} vehicles created`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
=======
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";
import { generateVehicleImage } from "../src/services/imageService.js";

dotenv.config();

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
const realAddresses = [
  { city: "Montreal", addressFormatted: "1001 Rue du Square-Victoria, Montreal, QC H2Z 2A7, Canada", lat: 45.501944, lng: -73.5625 },
  { city: "Montreal", addressFormatted: "1500 Avenue McGill College, Montreal, QC H3A 3J5, Canada", lat: 45.5013, lng: -73.5706 },
  { city: "Montreal", addressFormatted: "1600 Boulevard René-Lévesque O, Montreal, QC H3H 1P9, Canada", lat: 45.4937, lng: -73.5772 },
  { city: "Toronto", addressFormatted: "100 Front St W, Toronto, ON M5J 1E3, Canada", lat: 43.6455, lng: -79.3807 },
  { city: "Toronto", addressFormatted: "200 Bay St, Toronto, ON M5J 2J2, Canada", lat: 43.6469, lng: -79.379 },
  { city: "Toronto", addressFormatted: "55 Bloor St W, Toronto, ON M4W 1A5, Canada", lat: 43.6698, lng: -79.3892 },
  { city: "Vancouver", addressFormatted: "1155 Georgia St W, Vancouver, BC V6E 0B3, Canada", lat: 49.2867, lng: -123.1234 },
  { city: "Vancouver", addressFormatted: "200 Burrard St, Vancouver, BC V6C 3L6, Canada", lat: 49.2878, lng: -123.1169 },
  { city: "Vancouver", addressFormatted: "601 W Cordova St, Vancouver, BC V6B 1G1, Canada", lat: 49.2853, lng: -123.1128 },
  { city: "Calgary", addressFormatted: "113 6 Ave SW, Calgary, AB T2P 0S5, Canada", lat: 51.047, lng: -114.0718 },
  { city: "Calgary", addressFormatted: "317 7 Ave SW, Calgary, AB T2P 2Y9, Canada", lat: 51.0465, lng: -114.0692 },
  { city: "Calgary", addressFormatted: "645 7 Ave SW, Calgary, AB T2P 4G8, Canada", lat: 51.0462, lng: -114.0789 },
  { city: "Ottawa", addressFormatted: "100 Queen St, Ottawa, ON K1P 1J9, Canada", lat: 45.4213, lng: -75.7009 },
  { city: "Ottawa", addressFormatted: "111 Wellington St, Ottawa, ON K1A 0A9, Canada", lat: 45.4236, lng: -75.7009 },
  { city: "Ottawa", addressFormatted: "90 Elgin St, Ottawa, ON K1P 5E9, Canada", lat: 45.4216, lng: -75.6959 }
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required for seed");
  }

  await mongoose.connect(mongoUri);

  await Promise.all([
    Vehicle.deleteMany({}),
    User.deleteMany({ role: { $in: ["provider", "customer"] } })
  ]);

  const passwordHash = await bcrypt.hash("provider123", 10);

  const providers = await User.insertMany([
    {
      name: "Harjot Singh",
      email: "harjot.provider@mobility.local",
      phone: "+15145550100",
      passwordHash,
      role: "provider",
      approved: true
    },
    ...Array.from({ length: 4 }).map((_, idx) => ({
      name: `Provider ${idx + 2}`,
      email: `provider${idx + 2}@mobility.local`,
      phone: `+15145550${String(101 + idx)}`,
      passwordHash,
      role: "provider",
      approved: true
    }))
  ]);

  const targetCount = Number(process.env.SEED_COUNT || 50);
  const vehicles = Array.from({ length: targetCount }).map((_, idx) => {
    const address = realAddresses[idx % realAddresses.length];
    const item = pick(catalog);
    const provider = pick(providers);
    const year = Math.floor(rand(2018, 2025));
    const mileageKm = Math.round(rand(item.minKm, item.maxKm));

    return {
      name: `${year} ${item.label}`,
      type: item.type,
      mileageKm,
      pricePerDay: Math.round(rand(item.minPrice, item.maxPrice)),
      city: address.city,
      addressFormatted: address.addressFormatted,
      lat: address.lat,
      lng: address.lng,
      available: Math.random() > 0.25,
      imageUrl: "",
      providerId: provider._id
    };
  });

  for (let i = 0; i < vehicles.length; i += 1) {
    const vehicle = vehicles[i];
    try {
      const imageUrl = await generateVehicleImage(vehicle);
      vehicle.imageUrl = imageUrl;
      console.log(`Generated image ${i + 1}/${vehicles.length}: ${vehicle.name}`);
    } catch (err) {
      console.error(`Image generation failed ${i + 1}/${vehicles.length}: ${vehicle.name}`, err.message);
    }

    await Vehicle.create(vehicle);
    console.log(`Saved vehicle ${i + 1}/${vehicles.length}: ${vehicle.name}`);
  }

  console.log(`Seed complete: ${vehicles.length} vehicles created`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
>>>>>>> Testing
});
