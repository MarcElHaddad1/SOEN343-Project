import mongoose from "mongoose";
import { env } from "../config/env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB");
}
