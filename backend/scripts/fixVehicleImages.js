import dotenv from "dotenv";
import mongoose from "mongoose";
import { Vehicle } from "../src/models/Vehicle.js";

dotenv.config({ path: "backend/.env" });

await mongoose.connect(process.env.MONGODB_URI);

const res = await Vehicle.updateMany(
  {
    $or: [
      { imageUrl: { $exists: false } },
      { imageUrl: "" },
      { imageUrl: null },
      { imageUrl: { $regex: /^data:image\// } },
      { imageUrl: { $regex: /^https?:\/\// } }
    ]
  },
  { $set: { imageUrl: "/pic1.webp" } }
);

console.log(JSON.stringify({ updated: res.modifiedCount }));
await mongoose.disconnect();
