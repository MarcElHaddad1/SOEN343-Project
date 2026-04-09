import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Vehicle } from "../models/Vehicle.js";
import { signToken, authRequired } from "../middleware/auth.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { sendEventNotifications } from "../services/notificationService.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, phone, role = "customer" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const approved = role === "provider" ? false : true;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone: phone || "",
    passwordHash,
    role,
    approved,
    rejected: false,
    preferredCity: "Montreal",
    preferredMobilityType: "scooter"
  });

  sendEventNotifications({
    user,
    eventType: "registration",
    emailMessage: `Hi ${user.name}, your account was created successfully.`,
    smsMessage: `Welcome ${user.name}. Your Mobility Rental account is ready.`
  }).catch((err) => {
    console.error("Registration notifications failed:", err.message);
  });

  return res.status(201).json({
    message: role === "provider" ? "Provider account created and pending admin approval" : "Account created",
    user: sanitizeUser(user)
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

router.get("/me", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: sanitizeUser(user) });
});

router.patch("/me", authRequired, async (req, res) => {
  const { name, email, phone, addressFormatted, addressLat, addressLng, preferredCity, preferredMobilityType } = req.body;
  const user = await User.findById(req.auth.sub);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (email && email.toLowerCase() !== user.email) {
    const clash = await User.findOne({ email: email.toLowerCase() });
    if (clash) {
      return res.status(409).json({ message: "Email already in use" });
    }
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (addressFormatted !== undefined) user.addressFormatted = addressFormatted;
  if (addressLat !== undefined) user.addressLat = addressLat;
  if (addressLng !== undefined) user.addressLng = addressLng;
  if (preferredCity !== undefined) user.preferredCity = preferredCity;
  if (preferredMobilityType !== undefined && ["bike", "scooter"].includes(String(preferredMobilityType).toLowerCase())) {
    user.preferredMobilityType = String(preferredMobilityType).toLowerCase();
  }

  await user.save();

  return res.json({ user: sanitizeUser(user) });
});

router.get("/recommendations/me", authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const preferredCity = user.preferredCity || "Montreal";
  const preferredMobilityType = user.preferredMobilityType || "scooter";

  const typeRegex = preferredMobilityType === "bike"
    ? /^(bike|e-bike)$/i
    : /^scooter$/i;

  const availableCount = await Vehicle.countDocuments({
    available: true,
    city: preferredCity,
    type: { $regex: typeRegex }
  });

  const noun = preferredMobilityType === "bike" ? "Bikes" : "Scooters";
  const message = availableCount > 0
    ? `${noun} are currently available in ${preferredCity}. You may reserve one now.`
    : `No ${preferredMobilityType}s are currently available in ${preferredCity}. Try another city or check back soon.`;

  return res.json({
    recommendation: {
      preferredCity,
      preferredMobilityType,
      availableCount,
      message
    }
  });
});

router.patch("/me/password", authRequired, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }

  const user = await User.findById(req.auth.sub);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.json({ message: "Password updated" });
});

export default router;
