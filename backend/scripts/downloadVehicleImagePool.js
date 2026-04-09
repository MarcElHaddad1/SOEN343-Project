import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, "../public/vehicle-pool");

const sources = [
  { fileName: "car-01.jpg", url: "https://loremflickr.com/1600/900/car?lock=1001" },
  { fileName: "car-02.jpg", url: "https://loremflickr.com/1600/900/car,city?lock=1002" },
  { fileName: "car-03.jpg", url: "https://loremflickr.com/1600/900/sedan?lock=1003" },
  { fileName: "car-04.jpg", url: "https://loremflickr.com/1600/900/vehicle?lock=1004" },
  { fileName: "suv-01.jpg", url: "https://loremflickr.com/1600/900/suv?lock=2001" },
  { fileName: "suv-02.jpg", url: "https://loremflickr.com/1600/900/suv,road?lock=2002" },
  { fileName: "suv-03.jpg", url: "https://loremflickr.com/1600/900/offroad,suv?lock=2003" },
  { fileName: "bike-01.jpg", url: "https://loremflickr.com/1600/900/bicycle?lock=3001" },
  { fileName: "bike-02.jpg", url: "https://loremflickr.com/1600/900/bike,street?lock=3002" },
  { fileName: "bike-03.jpg", url: "https://loremflickr.com/1600/900/city,bike?lock=3003" },
  { fileName: "scooter-01.jpg", url: "https://loremflickr.com/1600/900/scooter?lock=4001" },
  { fileName: "scooter-02.jpg", url: "https://loremflickr.com/1600/900/moped,scooter?lock=4002" },
  { fileName: "scooter-03.jpg", url: "https://loremflickr.com/1600/900/electric,scooter?lock=4003" },
  { fileName: "ebike-01.jpg", url: "https://loremflickr.com/1600/900/electric,bike?lock=5001" },
  { fileName: "ebike-02.jpg", url: "https://loremflickr.com/1600/900/ebike?lock=5002" }
];

async function downloadImage(fileName, url) {
  const filePath = path.join(targetDir, fileName);
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "mobility-rental-image-seeder/1.0"
    }
  });

  if (!res.ok || !res.body) {
    throw new Error(`Failed: ${fileName} -> ${res.status}`);
  }

  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(filePath));
  const stat = await fs.promises.stat(filePath);
  console.log(`Downloaded ${fileName} (${stat.size} bytes)`);
}

async function main() {
  await fs.promises.mkdir(targetDir, { recursive: true });

  const failures = [];
  for (const item of sources) {
    try {
      await downloadImage(item.fileName, item.url);
    } catch (err) {
      failures.push({ fileName: item.fileName, error: err.message });
      console.error(`Error ${item.fileName}: ${err.message}`);
    }
  }

  await fs.promises.writeFile(
    path.join(targetDir, "sources.json"),
    JSON.stringify(
      {
        downloadedAt: new Date().toISOString(),
        sources
      },
      null,
      2
    )
  );

  if (failures.length > 0) {
    console.error("Some downloads failed:", failures);
    process.exit(1);
  }

  console.log(`Image pool ready: ${sources.length} files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
