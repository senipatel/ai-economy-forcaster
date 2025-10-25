// src/components/charts/GDPChart.tsx
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { getCachedData, setCachedData } from "@/lib/chartCache";

type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
const RANGE_MAP: Record<RangeKey, number> = { "3M": 3, "1Y": 12, "3Y": 36, "5Y": 60, "10Y": 120 };

/** Format date: "10/2025" → "10/25" */
function shortDate(label: string | number) {
  const s = String(label);
  const parts = s.split("/");
  if (parts.length === 2) {
    const [mm, yyyy] = parts;
    const yy = yyyy.length === 4 ? yyyy.slice(-2) : yyyy;
    return `${mm.padStart(2, "0")}/${yy}`;
  }
  return s;
}

export const GDPChart = () => {
  const cacheKey = "gdp";
  const { toast } = useToast();

  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  useEffect(() => {
    const fetchGDPData = async () => {
      try {
        setLoading(true);

        const apiKey = import.meta.env.VITE_FRED_API_KEY;
        if (!apiKey) throw new Error("FRED API key not set");

        const seriesId = "A191RL1Q225S"; // Real GDP, QoQ % change, SAAR
        const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=asc`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const observations = json.observations || [];

        const formatted = observations
          .filter((o: any) => o.value && o.value !== ".")
          .map((o: any) => {
            const [year, month] = o.date.split("-");
            return {
              date: `${parseInt(month)}/${year}`,
              gdp: parseFloat(o.value),
            };
          });

        if (formatted.length === 0) throw new Error("No data returned");

        setDataAll(formatted);
        setCachedData(cacheKey, formatted);
        toast({ title: "Data Updated", description: "GDP data loaded from FRED" });
      } catch (err: any) {
        console.error("FRED API Error:", err);

        // Fallback: Use last known good data or show error
        const cached = getCachedData(cacheKey);
        if (cached && cached.length > 0) {
          setDataAll(cached);
          toast({
            title: "Using Cached Data",
            description: "Real-time data unavailable",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Data Load Failed",
            description: "Could not load GDP data. Check API key.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const cached = getCachedData(cacheKey);
    if (cached && cached.length > 0) {
      setDataAll(cached);
      setLoading(false);
    } else {
      fetchGDPData();
    }
  }, []);

  useEffect(() => {
    if (!dataAll.length) return;
    const months = RANGE_MAP[range];
    setDisplayData(dataAll.slice(-months));
  }, [dataAll, range]);

  const handleDownload = async () => {
    const chartElement = document.getElementById("gdp-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "gdp-growth-rate.png";
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "Success", description: "Chart downloaded" });
    } catch (err) {
      console.error("Download error:", err);
      toast({ title: "Error", description: "Failed to download", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!displayData.length) {
    return <div className="h-[400px] flex items-center justify-center text-muted-foreground">No data available</div>;
  }

  const interval = Math.max(0, Math.floor(displayData.length / 8));

  const renderTick = (props: any) => {
    const { x, y, payload } = props;
    const label = shortDate(payload?.value ?? "");
    const ty = y + 14;
    return (
      <text x={x} y={ty} transform={`rotate(-90 ${x} ${ty})`} textAnchor="end" fill="hsl(var(--foreground))" fontSize={11}>
        {label}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:space-y-0 space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-x-2">
              {(["3M", "1Y", "3Y", "5Y", "10Y"] as RangeKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    range === k ? "bg-primary text-white" : "bg-transparent border border-border hover:bg-muted"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox checked={showDots} onCheckedChange={(v) => setShowDots(Boolean(v))} />
              <span className="select-none">Show markers</span>
            </label>
          </div>

          <div className="flex-shrink-0">
            <Button variant="outline" size="sm" className="gap-2 no-export" onClick={handleDownload}>
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400} id="gdp-chart">
        <LineChart data={displayData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--foreground))" tick={renderTick} interval={interval}>
            <Label value="Date" position="center" dy={60} />
          </XAxis>
          <YAxis stroke="hsl(var(--foreground))">
            <Label value="GDP Growth Rate (%)" angle={-90} position="center" dx={-30} />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
          />
          <Legend verticalAlign="top" align="center" />
          <Line
            type="monotone"
            dataKey="gdp"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            name="GDP Growth Rate (%)"
            dot={showDots ? { fill: "hsl(var(--chart-1))", r: 4 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};