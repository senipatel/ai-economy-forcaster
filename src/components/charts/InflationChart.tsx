// src/components/charts/InflationChart.tsx
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
  ReferenceLine,
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
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1].slice(-2)}`;
    }
    return s;
  } catch {
    return String(label);
  }
};

export const InflationChart = ({ onDataChange }: { onDataChange?: (data: any[]) => void }) => {
  const cacheKey = "inflation";
  const { toast } = useToast();

  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  // ================================================================
  // 1. Fetch from /api/fred-inflation → cache → placeholder
  // ================================================================
  useEffect(() => {
    const cached = getCachedData(cacheKey);
    if (cached) {
      setDataAll(cached);
      setLoading(false);
      return;
    }

    fetch("/api/fred-inflation")
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
        console.error("Inflation proxy failed → using placeholder:", err);
        toast({
          title: "Using demo data",
          description: "Real inflation data unavailable",
          variant: "destructive",
        });
        fallbackToPlaceholder();
      });

    function fallbackToPlaceholder() {
      const months = 120;
      const labels = generatePlaceholderMonths(months);
      const placeholder = labels.map((lab, idx) => ({
        date: lab,
        inflation: +(2.0 + Math.sin(idx / 6) * 1.5 + Math.random() * 1.0).toFixed(2),
      }));
      setDataAll(placeholder);
      setCachedData(cacheKey, placeholder);
      setLoading(false);
    }
  }, []);

  // ================================================================
  // 2. Update display when range changes
  // ================================================================
  useEffect(() => {
    if (!dataAll.length) return;
    const months = RANGE_MAP[range];
    setDisplayData(dataAll.slice(-months));
  }, [dataAll, range]);

  // Emit full chart data to parent when it updates
  useEffect(() => {
    if (onDataChange) {
      onDataChange(dataAll);
    }
  }, [dataAll, onDataChange]);

  // ================================================================
  // 3. Download handler
  // ================================================================
  const handleDownload = async () => {
    const chartElement = document.getElementById("inflation-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = "inflation-chart.png";
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
      <ResponsiveContainer width="100%" height={400} id="inflation-chart">
        <LineChart data={displayData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
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
          <YAxis stroke="hsl(var(--foreground))">
            <Label value="Inflation Rate (%)" angle={-90} position="center" dx={-30} />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
            formatter={(v: number) => v.toFixed(2)}
          />
          <Legend verticalAlign="top" align="center" />
          <ReferenceLine
            y={2}
            stroke="hsl(var(--accent))"
            strokeDasharray="5 5"
            label={{ value: "Fed Target (2%)", position: "right", fill: "hsl(var(--accent))" }}
          />
          <Line
            type="monotone"
            dataKey="inflation"
            stroke="hsl(var(--chart-2))"
            strokeWidth={3}
            name="Inflation Rate (%)"
            dot={showDots ? { fill: "hsl(var(--chart-2))", r: 4 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};