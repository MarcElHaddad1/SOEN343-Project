import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vehiclePoolDir = path.resolve(__dirname, "../../public/vehicle-pool");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function baseUrl() {
  const configured = process.env.BACKEND_PUBLIC_URL || `http://localhost:${env.port}`;
  return configured.replace(/\/+$/, "");
}

function getPoolImagePaths() {
  try {
    const files = fs.readdirSync(vehiclePoolDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => imageExtensions.has(path.extname(name).toLowerCase()));

    return files.map((name) => `/vehicle-pool/${name}`);
  } catch {
    return [];
  }
}

export function getRandomVehicleImageUrl() {
  const availableImages = getPoolImagePaths();
  if (availableImages.length === 0) {
    return "/pic1.webp";
  }

  const selectedPath = randomItem(availableImages);
  return `${baseUrl()}${selectedPath}`;
}

export function getVehicleImagePoolManifest() {
  const availableImages = getPoolImagePaths();
  return { all: availableImages };
}
