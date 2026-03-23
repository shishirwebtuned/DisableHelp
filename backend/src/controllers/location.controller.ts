import { catchAsync } from "../utils/catchAsync.js";
import { GeoCache } from "../models/geocache.model.js";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let requestQueue: Promise<void> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    requestQueue = requestQueue.then(() => fn().then(resolve).catch(reject));
  });
}

async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3,
  backoff = 1000,
) {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options);

    if (res.status !== 429) return res;

    console.warn(`429 Too Many Requests. Retry ${i + 1} in ${backoff}ms`);
    await delay(backoff);
    backoff *= 2;
  }
  throw new Error("Too many requests, retries exhausted");
}

export const getGeoCode = catchAsync(async (req, res) => {
  const { address } = req.query;

  if (!address) return res.status(400).json({ error: "Address required" });

  const normalizedAddress = (address as string).trim().toLowerCase();

  // 1. Check cache first
  const cached = await GeoCache.findOne({ address: normalizedAddress });
  if (cached) {
    console.log("GeoCache hit:", normalizedAddress);
    return res.json({ lat: cached.lat, lon: cached.lon });
  }

  // 2. Enqueue request to avoid hitting rate limit
  try {
    const result = await enqueue(async () => {
      // Add 1s delay between requests to respect Nominatim's 1 req/sec policy
      await delay(1100);

      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address as string)}`;
      const options = {
        headers: {
          "User-Agent": "MyApp/1.0 (contact@myapp.com)",
        },
      };

      const response = await fetchWithRetry(url, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Nominatim error: ${text}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("Coordinates not found");
      }

      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      // 3. Save to cache
      await GeoCache.create({ address: normalizedAddress, lat, lon });

      return { lat, lon };
    });

    return res.json(result);
  } catch (err: any) {
    console.error("Error fetching coordinates:", err);

    if (err.message === "Coordinates not found") {
      return res.status(404).json({ error: "Coordinates not found" });
    }

    return res.status(500).json({
      error: "Failed to fetch coordinates",
      details: err.message,
    });
  }
});
