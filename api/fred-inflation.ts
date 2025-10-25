// api/fred-inflation.ts
// No import from 'next' → works with Vite + Vercel

export default async function handler(req: any, res: any) {
  const API_KEY = process.env.VITE_FRED_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "FRED API key missing" });
  }

  try {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${API_KEY}&file_type=json&sort_order=asc`;

    const fredRes = await fetch(url);
    if (!fredRes.ok) throw new Error(`FRED error: ${fredRes.status}`);

    const data = await fredRes.json();

    const values = data.observations
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({ date: o.date, value: Number(o.value) }));

    const inflation = values
      .map((curr: any, i: number) => {
        if (i < 12) return null;
        const prev = values[i - 12];
        const rate = ((curr.value - prev.value) / prev.value) * 100;
        return {
          date: curr.date.slice(5, 7) + "/" + curr.date.slice(2, 4),
          inflation: Number(rate.toFixed(2)),
        };
      })
      .filter(Boolean);

    res.status(200).json(inflation);
  } catch (err: any) {
    console.error("Inflation proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Required for Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};