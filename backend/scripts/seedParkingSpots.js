import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { ParkingSpot } from "../src/models/ParkingSpot.js";

dotenv.config();

const spots = [
  { name: "Downtown Garage A", city: "Montreal", addressFormatted: "1200 Avenue McGill College, Montreal, QC H3B 4G7, Canada", lat: 45.5015, lng: -73.5712, pricePerHour: 6, capacityTotal: 24 },
  { name: "Old Port Parking Hub", city: "Montreal", addressFormatted: "333 Rue de la Commune O, Montreal, QC H2Y 2E2, Canada", lat: 45.5076, lng: -73.5522, pricePerHour: 5, capacityTotal: 18 },
  { name: "Union Station Garage", city: "Toronto", addressFormatted: "65 Front St W, Toronto, ON M5J 1E6, Canada", lat: 43.6454, lng: -79.3807, pricePerHour: 7, capacityTotal: 32 },
  { name: "Bay Street Parking", city: "Toronto", addressFormatted: "200 Bay St, Toronto, ON M5J 2J2, Canada", lat: 43.6469, lng: -79.379, pricePerHour: 8, capacityTotal: 26 },
  { name: "Waterfront Lot", city: "Vancouver", addressFormatted: "200 Burrard St, Vancouver, BC V6C 3L6, Canada", lat: 49.2878, lng: -123.1169, pricePerHour: 7, capacityTotal: 20 },
  { name: "Cordova Smart Parking", city: "Vancouver", addressFormatted: "601 W Cordova St, Vancouver, BC V6B 1G1, Canada", lat: 49.2853, lng: -123.1128, pricePerHour: 6, capacityTotal: 22 },
  { name: "7th Ave Parking Center", city: "Calgary", addressFormatted: "645 7 Ave SW, Calgary, AB T2P 4G8, Canada", lat: 51.0462, lng: -114.0789, pricePerHour: 5, capacityTotal: 28 },
  { name: "Parliament District Parking", city: "Ottawa", addressFormatted: "100 Queen St, Ottawa, ON K1P 1J9, Canada", lat: 45.4213, lng: -75.7009, pricePerHour: 5, capacityTotal: 16 },
  { name: "Rideau Center Parking", city: "Ottawa", addressFormatted: "50 Rideau St, Ottawa, ON K1N 9J7, Canada", lat: 45.4256, lng: -75.6926, pricePerHour: 6, capacityTotal: 19 },
  { name: "Laval Metro Parking", city: "Laval", addressFormatted: "3131 Boulevard Le Carrefour, Laval, QC H7T 1C7, Canada", lat: 45.5682, lng: -73.7495, pricePerHour: 4, capacityTotal: 30 }
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);

  const provider = await User.findOne({ role: "provider", approved: true }).sort({ createdAt: 1 });
  if (!provider) throw new Error("No approved provider found. Create/approve provider first.");

  await ParkingSpot.deleteMany({});
  const docs = spots.map((spot) => ({
    ...spot,
    capacityAvailable: spot.capacityTotal,
    providerId: provider._id
  }));

  await ParkingSpot.insertMany(docs);
  console.log(`Seeded ${docs.length} parking spots for provider ${provider.email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
