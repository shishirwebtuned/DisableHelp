import { catchAsync } from "../utils/catchAsync.js";

// Helper delay
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch with retry on 429
async function fetchWithRetry(
  url: string,
  options: any,
  retries = 3,
  backoff = 1000,
) {
  for (let i = 0; i <= retries; i++) {
    const res = await fetch(url, options);

    if (res.status !== 429) return res; // Not a rate limit error

    console.warn(`429 Too Many Requests. Retry ${i + 1} in ${backoff}ms`);
    await delay(backoff);
    backoff *= 2; // Exponential backoff
  }
  throw new Error("Too many requests, retries exhausted");
}

export const getGeoCode = catchAsync(async (req, res) => {
  const { address } = req.query;

  if (!address) return res.status(400).json({ error: "Address required" });

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address as string)}`;
  const options = {
    headers: {
      "User-Agent": "MyApp/1.0 (contact@myapp.com)", // Use a real email
    },
  };

  try {
    const response = await fetchWithRetry(url, options);

    console.log(
      "Nominatim response status:",
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Nominatim error response body:", text);
      return res
        .status(response.status)
        .json({ error: "Failed to fetch coordinates", details: text });
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log("Nominatim returned empty data:", data);
      return res.status(404).json({ error: "Coordinates not found" });
    }

    res.json({
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    });
  } catch (err: any) {
    console.error("Error fetching coordinates:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch coordinates", details: err.message });
  }
});
