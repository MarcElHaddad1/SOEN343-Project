import express from "express";
import { env } from "../config/env.js";

const router = express.Router();

router.get("/autocomplete", async (req, res) => {
  const input = req.query.input;

  if (!env.googleMapsApiKey) {
    return res.status(500).json({ message: "GOOGLE_MAPS_API_KEY is not configured" });
  }

  if (!input || String(input).length < 3) {
    return res.json({ predictions: [] });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${env.googleMapsApiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  return res.json({ predictions: data.predictions || [] });
});

router.get("/place/:placeId", async (req, res) => {
  if (!env.googleMapsApiKey) {
    return res.status(500).json({ message: "GOOGLE_MAPS_API_KEY is not configured" });
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(req.params.placeId)}&fields=formatted_address,geometry&key=${env.googleMapsApiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data.result) {
    return res.status(404).json({ message: "Place not found" });
  }

  return res.json({
    formattedAddress: data.result.formatted_address,
    lat: data.result.geometry?.location?.lat,
    lng: data.result.geometry?.location?.lng
  });
});

export default router;
