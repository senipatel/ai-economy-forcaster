// api/fred-tradeoff.ts
export default async function handler(req: any, res: any) {
  const API_KEY = process.env.VITE_FRED_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "FRED API key missing" });
  }

  try {
    // Fetch GDP (quarterly) and CPI (monthly) → align to monthly
    const [gdpRes, cpiRes] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${API_KEY}&file_type=json&sort_order=asc`),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${API_KEY}&file_type=json&sort_order=asc`),
    ]);

    if (!gdpRes.ok || !cpiRes.ok) throw new Error("FRED API failed");

    const gdpData = await gdpRes.json();
    const cpiData = await cpiRes.json();

    // Parse GDP (quarterly → map to last month of quarter)
    const gdpMap = new Map();
    gdpData.observations
      .filter((o: any) => o.value !== ".")
      .forEach((o: any) => {
        const [y, m] = o.date.split("-");
        const monthKey = `${y}-${m.padStart(2, "0")}`;
        gdpMap.set(monthKey, Number(o.value) / 1000); // Billions → Trillions
      });

    // Parse CPI → YoY inflation
    const cpiValues = cpiData.observations
      .filter((o: any) => o.value !== ".")
      .map((o: any) => ({ date: o.date, value: Number(o.value) }));

    const result: any[] = [];

    for (let i = 12; i < cpiValues.length; i++) {
      const curr = cpiValues[i];
      const prev = cpiValues[i - 12];
      const inflation = ((curr.value - prev.value) / prev.value) * 100;

      const [y, m] = curr.date.split("-");
      const monthKey = `${y}-${m}`;
      const gdp = gdpMap.get(monthKey) || null;

      // Only include if we have inflation (always) and GDP (sometimes)
      result.push({
        date: `${Number(m)}/${y.slice(-2)}`,
        inflation: Number(inflation.toFixed(2)),
        growth: gdp !== null ? Number(gdp.toFixed(2)) : null,
      });
    }

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Tradeoff proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}

export const config = { api: { bodyParser: false } };