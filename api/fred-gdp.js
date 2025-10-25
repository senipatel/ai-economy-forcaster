// api/fred-gdp.js
export const config = {
  api: {
    externalResolver: true,
  },
};

export default async function handler(req, res) {
  const API_KEY = process.env.VITE_FRED_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "FRED API key missing" });
  }

  try {
    const fredRes = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${API_KEY}&file_type=json&sort_order=asc`
    );

    if (!fredRes.ok) throw new Error("FRED API failed");

    const data = await fredRes.json();

    const formatted = data.observations
      .filter((o) => o.value !== ".")
      .map((o) => ({
        date: o.date.slice(5, 7) + "/" + o.date.slice(2, 4), // MM/YY
        gdp: Number(o.value) / 1000, // Billions → Trillions
      }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("FRED proxy error:", err);
    res.status(500).json({ error: "Failed to fetch GDP" });
  }
}