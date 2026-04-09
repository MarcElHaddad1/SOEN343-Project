import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { env } from "../config/env.js";

export async function ensureAdminUser() {
  const existing = await User.findOne({ email: env.adminEmail.toLowerCase() });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);

  await User.create({
    name: "Administrator",
    email: env.adminEmail.toLowerCase(),
    phone: "",
    passwordHash,
    role: "admin",
    approved: true
  });

  console.log("Seeded default admin account");
}
