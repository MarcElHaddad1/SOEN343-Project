/**
 * scripts/checkProviderAssignment.js
 *
 * Prints a summary of how many vehicles are assigned to each provider.
 * Run after assignProviderToVehicles.js to verify the result.
 *
 * Usage:
 *   node scripts/checkProviderAssignment.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const providers = await User.find({ role: "provider" }).select("name email");
const providerMap = new Map(providers.map((p) => [p._id.toString(), p]));

const counts = await Vehicle.aggregate([
  { $group: { _id: "$providerId", count: { $sum: 1 } } }
]);

for (const { _id, count } of counts) {
  const provider = providerMap.get(_id?.toString());
  const label = provider ? `${provider.name} <${provider.email}>` : `Unknown (${_id})`;
  console.log(`${label}: ${count} vehicle(s)`);
}

const unassigned = await Vehicle.countDocuments({ providerId: { $exists: false } });
if (unassigned > 0) {
  console.warn(`WARNING: ${unassigned} vehicle(s) have no providerId`);
}

await mongoose.disconnect();
