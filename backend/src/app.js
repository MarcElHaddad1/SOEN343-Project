import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mapsRoutes from "./routes/mapsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vehiclePoolDir = path.resolve(__dirname, "../public/vehicle-pool");
const logoDir = path.resolve(__dirname, "../public/LOGO");

export function createApp() {
  const app = express();
  const allowedOrigins = new Set(
    (process.env.FRONTEND_URLS || env.frontendUrl || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  // Keep local dev origins available in production-safe way.
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");

  app.use(
    cors({
      origin(origin, callback) {
        const isVercelPreview = typeof origin === "string" && origin.endsWith(".vercel.app");
        if (!origin || allowedOrigins.has(origin) || isVercelPreview) {
          return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
      optionsSuccessStatus: 204
    })
  );

  app.use(express.json({ limit: "8mb" }));
  app.use("/vehicle-pool", express.static(vehiclePoolDir));
  app.use("/LOGO", express.static(logoDir));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/maps", mapsRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/parking", parkingRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Unexpected server error" });
  });

  return app;
}
