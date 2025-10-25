// src/components/charts/PolicyTradeoffChart.tsx
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

type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
const RANGE_MAP: Record<RangeKey, number> = { "3M": 3, "1Y": 12, "3Y": 36, "5Y": 60, "10Y": 120 };

function generatePlaceholderMonths(months: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
  }
  return out;
}

const shortDate = (label: string | number) => {
  try {
    const s = String(label);
    const parts = s.split("/");
    if (parts.length === 2) return `${parts[0]}/${parts[1].slice(-2)}`;
    return s;
  } catch {
    return String(label);
  }
};

export const PolicyTradeoffChart = () => {
  const cacheKey = "policy-tradeoff";
  const { toast } = useToast();

  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  // ================================================================
  // 1. Fetch from /api/fred-tradeoff
  // ================================================================
  useEffect(() => {
    const cached = getCachedData(cacheKey);
    if (cached) {
      setDataAll(cached);
      setLoading(false);
      return;
    }

    fetch("/api/fred-tradeoff")
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text);
        }
        return r.json();
      })
      .then((data) => {
        setDataAll(data);
        setCachedData(cacheKey, data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Tradeoff proxy failed → using placeholder:", err);
        toast({
          title: "Using demo data",
          description: "Real data unavailable",
          variant: "destructive",
        });
        fallbackToPlaceholder();
      });

    function fallbackToPlaceholder() {
      const months = 120;
      const labels = generatePlaceholderMonths(months);
      const placeholder = labels.map((lab, idx) => ({
        date: lab,
        growth: +(Math.sin(idx / 10) * 1.2 + Math.random() * 0.8).toFixed(2),
        inflation: +(2 + Math.cos(idx / 8) * 0.9 + Math.random() * 0.5).toFixed(2),
      }));
      setDataAll(placeholder);
      setCachedData(cacheKey, placeholder);
      setLoading(false);
    }
  }, []);

  // ================================================================
  // 2. Update display
  // ================================================================
  useEffect(() => {
    if (!dataAll.length) return;
    const months = RANGE_MAP[range];
    setDisplayData(dataAll.slice(-months));
  }, [dataAll, range]);

  // ================================================================
  // 3. Download
  // ================================================================
  const handleDownload = async () => {
    const chartElement = document.getElementById("policy-tradeoff-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "policy-tradeoff-chart.png";
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "Success", description: "Chart downloaded" });
    } catch (err) {
      toast({ title: "Error", description: "Download failed", variant: "destructive" });
    }
  };

  // ================================================================
  // 4. Render
  // ================================================================
  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const interval = Math.max(0, Math.floor(displayData.length / 8));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:space-y-0 space-y-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="space-x-2">
              {(["3M", "1Y", "3Y", "5Y", "10Y"] as RangeKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    range === k
                      ? "bg-primary text-white"
                      : "bg-transparent border border-border hover:bg-muted"
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
            <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400} id="policy-tradeoff-chart">
        <LineChart data={displayData} margin={{ top: 20, right: 50, bottom: 80, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--foreground))"
            tick={({ x, y, payload }: any) => {
              const label = shortDate(payload?.value ?? "");
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
            }}
            interval={interval}
          >
            <Label value="Date" position="center" dy={60} />
          </XAxis>

          {/* Left Y: Growth */}
          <YAxis
            yAxisId="growth"
            stroke="hsl(var(--chart-1))"
            domain={["dataMin - 1", "dataMax + 1"]}
          >
            <Label value="GDP (Trillions $)" angle={-90} position="insideLeft" dx={10} />
          </YAxis>

          {/* Right Y: Inflation */}
          <YAxis
            yAxisId="inflation"
            orientation="right"
            stroke="hsl(var(--chart-2))"
            domain={[0, 10]}
          >
            <Label value="Inflation (%)" angle={-90} position="insideRight" dx={-10} />
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
            yAxisId="growth"
            type="monotone"
            dataKey="growth"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            name="GDP Growth (Trillions)"
            dot={showDots ? { fill: "hsl(var(--chart-1))", r: 4 } : false}
            connectNulls
          />
          <Line
            yAxisId="inflation"
            type="monotone"
            dataKey="inflation"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            name="Inflation (%)"
            dot={showDots ? { fill: "hsl(var(--chart-2))", r: 3 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
