import OpenAI from "openai";
import { env } from "../config/env.js";

const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;
const imageModel = process.env.OPENAI_IMAGE_MODEL || "dall-e-3";

const fallbackImages = [
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80"
];

function randomFallbackImage() {
  return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
}

export async function generateVehicleImage(vehicle) {
  if (!openai) {
    return randomFallbackImage();
  }

  try {
    const prompt = `Photorealistic wide-angle vehicle listing photo in landscape format. Subject: ${vehicle.type} "${vehicle.name}" in ${vehicle.city}. Clean street environment, natural daylight, high detail, realistic reflections and shadows, commercial marketplace style, no people, no logos, no text, no watermark, no illustration/cartoon look.`;
    const result = await openai.images.generate({
      model: imageModel,
      prompt,
      size: "1792x1024",
      quality: "standard"
    });

    const imageUrl = result.data?.[0]?.url;
    if (imageUrl) {
      return imageUrl;
    }

    const imageBase64 = result.data?.[0]?.b64_json;
    if (!imageBase64) {
      return randomFallbackImage();
    }

    return `data:image/png;base64,${imageBase64}`;
  } catch (error) {
    console.error("Image generation failed", error.message);
    return randomFallbackImage();
  }
}
