<<<<<<< HEAD
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

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

await mongoose.connect(process.env.MONGODB_URI);
const vehicles = await Vehicle.find({}).sort({ createdAt: 1 });

for (let i = 0; i < vehicles.length; i += 1) {
  const v = vehicles[i];
  const a = realAddresses[i % realAddresses.length];
  v.name = v.name.replace(/\s\d+$/, "").trim();
  v.city = a.city;
  v.addressFormatted = a.addressFormatted;
  v.lat = a.lat;
  v.lng = a.lng;
  await v.save();
}

console.log(`Updated ${vehicles.length} vehicles with real addresses and clean titles`);
=======
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

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

await mongoose.connect(process.env.MONGODB_URI);
const vehicles = await Vehicle.find({}).sort({ createdAt: 1 });

for (let i = 0; i < vehicles.length; i += 1) {
  const v = vehicles[i];
  const a = realAddresses[i % realAddresses.length];
  v.name = v.name.replace(/\s\d+$/, "").trim();
  v.city = a.city;
  v.addressFormatted = a.addressFormatted;
  v.lat = a.lat;
  v.lng = a.lng;
  await v.save();
}

console.log(`Updated ${vehicles.length} vehicles with real addresses and clean titles`);
>>>>>>> Testing
await mongoose.disconnect();
