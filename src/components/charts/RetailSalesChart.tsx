// src/components/charts/RetailSalesChart.tsx
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
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2, FileImage, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCachedData, setCachedData } from "@/lib/chartCache";
import html2canvas from "html2canvas";

type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
type ChartType = "line" | "bar";
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

export const RetailSalesChart = ({ onDataChange }: { onDataChange?: (data: any[]) => void }) => {
  const cacheKey = "retail-sales";
  const { toast } = useToast();

  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [chartType, setChartType] = useState<ChartType>("line");

  // ================================================================
  // 1. Fetch from /api/fred-retailsales
  // ================================================================
  useEffect(() => {
    const cached = getCachedData(cacheKey);
    if (cached) {
      setDataAll(cached);
      setLoading(false);
      return;
    }

    fetch("/api/fred-retailsales")
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
        console.error("Retail Sales proxy failed → using placeholder:", err);
        toast({
          title: "Using demo data",
          description: "Real retail sales data unavailable",
          variant: "destructive",
        });
        fallbackToPlaceholder();
      });

    function fallbackToPlaceholder() {
      const months = 120;
      const labels = generatePlaceholderMonths(months);
      const placeholder = labels.map((lab, idx) => ({
        date: lab,
        retail: +(100 + Math.sin(idx / 7) * 10 + Math.random() * 5).toFixed(2),
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

  // Emit full chart data to parent when it updates
  useEffect(() => {
    if (onDataChange) {
      onDataChange(dataAll);
    }
  }, [dataAll, onDataChange]);

  // ================================================================
  // 3. Download handlers
  // ================================================================
  const handleDownloadImage = async () => {
    const chartElement = document.getElementById("retail-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      link.download = `retail-sales-${chartType}-chart.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast({ title: "Success", description: "Chart image downloaded" });
    } catch (err) {
      toast({ title: "Error", description: "Image download failed", variant: "destructive" });
    }
  };

  const handleDownloadCSV = () => {
    try {
      const headers = ["Date", "Retail Sales (M$)"];
      const csvRows = [headers.join(",")];

      displayData.forEach((row) => {
        const date = String(row.date || "");
        const retail = String(row.retail || "");
        csvRows.push([date, retail].join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `retail-sales-data-${range}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Success", description: "CSV data downloaded" });
    } catch (err) {
      toast({ title: "Error", description: "CSV download failed", variant: "destructive" });
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

  const renderTick = (props: any) => {
    const { x, y, payload } = props;
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
  };

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
            <div className="flex items-center gap-2">
              <label htmlFor="chart-type" className="text-sm select-none">
                Chart Type
              </label>
              <Select
                value={chartType}
                onValueChange={(v) => setChartType(v as ChartType)}
              >
                <SelectTrigger id="chart-type" className="w-[100px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 no-export">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadImage} className="cursor-pointer">
                  <FileImage className="w-4 h-4 mr-2" />
                  Download as Image (PNG)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadCSV} className="cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400} id="retail-chart">
        {chartType === "line" ? (
          <LineChart data={displayData} margin={{ top: 20, right: 20, bottom: 80, left: 40 }}>
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
            <Label value="Retail Sales (M$)" angle={-90} position="center" dx={-30} />
          </YAxis>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
            }}
            formatter={(value: number) => `$${value.toLocaleString()}M`}
          />
          <Legend verticalAlign="top" align="center" />
          <Line
            type="monotone"
            dataKey="retail"
            stroke="hsl(var(--chart-4))"
            strokeWidth={3}
            name="Retail Sales (M$)"
            dot={false}
          />
        </LineChart>
        ) : (
          <BarChart data={displayData} margin={{ top: 20, right: 20, bottom: 80, left: 40 }}>
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
              <Label value="Retail Sales (M$)" angle={-90} position="center" dx={-30} />
            </YAxis>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
              }}
              formatter={(value: number) => `$${value.toLocaleString()}M`}
            />
            <Legend verticalAlign="top" align="center" />
            <Bar
              dataKey="retail"
              fill="hsl(var(--chart-4))"
              name="Retail Sales (M$)"
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};