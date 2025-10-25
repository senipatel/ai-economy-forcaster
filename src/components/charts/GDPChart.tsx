// src/components/charts/GDPChart.tsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { getCachedData, setCachedData } from "@/lib/chartCache";

// ---------------------------------------------------------------
// 1. Types & Constants
// ---------------------------------------------------------------
type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
const RANGE_MAP: Record<RangeKey, number> = {
  "3M": 3,
  "1Y": 12,
  "3Y": 36,
  "5Y": 60,
  "10Y": 120,
};

const FRED_SERIES_ID = "GDP";                     // quarterly real GDP
const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

// ---------------------------------------------------------------
// 2. Helper: format FRED date (YYYY-MM-DD → MM/YY)
// ---------------------------------------------------------------
function formatFredDate(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${Number(m)}/${y.slice(-2)}`;
}

// ---------------------------------------------------------------
// 3. Helper: placeholder data (used only on error)
// ---------------------------------------------------------------
function generatePlaceholderMonths(months: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
  }
  return out;
}

// ---------------------------------------------------------------
// 4. Main Component
// ---------------------------------------------------------------
export const GDPChart = () => {
  const cacheKey = "gdp";
  const { toast } = useToast();

  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  // -----------------------------------------------------------------
  // 5. Load data – FRED API → cache → placeholder fallback
  // -----------------------------------------------------------------
 useEffect(() => {
  const cached = getCachedData(cacheKey);
  if (cached) {
    setDataAll(cached);
    setLoading(false);
    return;
  }

  // CALL YOUR PROXY, NOT FRED
  fetch("/api/fred-gdp")
    .then((r) => {
      if (!r.ok) {
        return r.text().then(text => { throw new Error(text); });
      }
      return r.json();
    })
    .then((data) => {
      setDataAll(data);
      setCachedData(cacheKey, data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("FRED proxy failed → using placeholder:", err);
      toast({
        title: "Using demo data",
        description: "Real GDP data unavailable",
        variant: "destructive",
      });
      fallbackToPlaceholder();
    });
}, []);

  // -----------------------------------------------------------------
  // 6. Slice data when range changes
  // -----------------------------------------------------------------
  useEffect(() => {
    if (!dataAll.length) return;
    const months = RANGE_MAP[range];
    setDisplayData(dataAll.slice(-months));
  }, [dataAll, range]);

  // -----------------------------------------------------------------
  // 7. Download handler (unchanged)
  // -----------------------------------------------------------------
  const handleDownload = async () => {
    const chartElement = document.getElementById("gdp-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: null,
        scale: 2, // higher resolution
      });
      const link = document.createElement("a");
      link.download = "gdp-chart.png";
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "Success", description: "Chart downloaded" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Download failed", variant: "destructive" });
    }
  };

  // -----------------------------------------------------------------
  // 8. Render helpers
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const interval = Math.max(0, Math.floor(displayData.length / 8));
  const formatDate = (label: any) => {
    try {
      const s = String(label);
      const [mm, yy] = s.split("/");
      return `${mm}/${yy.slice(-2)}`;
    } catch {
      return String(label);
    }
  };

  const renderTick = (props: any) => {
    const { x, y, payload } = props;
    const label = formatDate(payload?.value ?? "");
    const ty = y + 14;
    return (
      <text
        x={x}
        y={ty}
        transform={`rotate(-90 ${x} ${ty})`}
        textAnchor="end"
        fill="hsl(var(--foreground))"
        fontSize={11}
      >
        {label}
      </text>
    );
  };

  // -----------------------------------------------------------------
  // 9. JSX (same UI you already had)
  // -----------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header – range, checkbox, download */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:space-y-0 space-y-2">
        <div className="flex items-center justify-between w-full">
          {/* LEFT: range + checkbox */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-x-2">
              {(["3M", "1Y", "3Y", "5Y", "10Y"] as RangeKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${range === k
                      ? "bg-primary text-white"
                      : "bg-transparent border border-border hover:bg-muted"
                    }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox
                checked={showDots}
                onCheckedChange={(v) => setShowDots(Boolean(v))}
              />
              <span className="select-none">Show markers</span>
            </label>
          </div>

          {/* RIGHT: download */}
          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 no-export"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400} id="gdp-chart">
        <LineChart
          data={displayData}
          margin={{ top: 20, right: 20, bottom: 80, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--foreground))"
            tick={renderTick}
            interval={interval}
          >
            <Label value="Date" position="center" dy={60} />
          </XAxis>
          <YAxis stroke="hsl(var(--foreground))">
            <Label
              value="Real GDP (Trillions of 2017 $)"
              angle={-90}
              position="center"
              dx={-30}
            />
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
            name="Real GDP (Trillions of 2017 $)"
            dot={showDots ? { fill: "hsl(var(--chart-1))", r: 4 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

function fallbackToPlaceholder() {
  throw new Error("Function not implemented.");
}
