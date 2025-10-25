// api/fred-retailsales.ts
export default async function handler(req: any, res: any) {
  const API_KEY = process.env.VITE_FRED_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "FRED API key missing" });
  }

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=RSXFS&api_key=${API_KEY}&file_type=json&sort_order=asc`;

    const fredRes = await fetch(url);
    if (!fredRes.ok) throw new Error(`FRED error: ${fredRes.status}`);

    const data = await fredRes.json();

    const formatted = data.observations
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({
        date: o.date.slice(5, 7) + "/" + o.date.slice(2, 4), // MM/YY
        retail: Number(o.value), // Already in millions
      }));

    res.status(200).json(formatted);
  } catch (err: any) {
    console.error("Retail Sales proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}

export const config = { api: { bodyParser: false } };