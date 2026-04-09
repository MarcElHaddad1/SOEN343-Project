/**
 * scripts/assignProviderToVehicles.js
 *
 * Reassigns all vehicles to a specific provider account.
 * Useful when seeding or correcting orphaned vehicle records.
 *
 * Usage:
 *   PROVIDER_EMAIL=someone@example.com node scripts/assignProviderToVehicles.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config();

const providerEmail = process.env.PROVIDER_EMAIL;
if (!providerEmail) {
  console.error("Error: PROVIDER_EMAIL environment variable is required.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const provider = await User.findOne({ email: providerEmail.toLowerCase(), role: "provider" });
if (!provider) {
  console.error(`No provider found with email: ${providerEmail}`);
  await mongoose.disconnect();
  process.exit(1);
}

const updated = await Vehicle.updateMany({}, { $set: { providerId: provider._id } });

console.log(JSON.stringify({
  providerId: provider._id.toString(),
  providerEmail: provider.email,
  vehiclesUpdated: updated.modifiedCount
}));

await mongoose.disconnect();
