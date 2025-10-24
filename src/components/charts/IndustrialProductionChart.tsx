import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";
import { getCachedData, setCachedData } from "@/lib/chartCache";
import html2canvas from "html2canvas";

type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
const RANGE_MAP: Record<RangeKey, number> = { "3M": 3, "1Y": 12, "3Y": 36, "5Y": 60, "10Y": 120 };

function generatePlaceholderMonths(months: number) { const out = []; const now = new Date(); for (let i = months - 1; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); out.push(`${d.getMonth() + 1}/${d.getFullYear()}`); } return out; }

export const IndustrialProductionChart = () => {
  const cacheKey = "industrial-production";
  const { toast } = useToast();
  const [dataAll, setDataAll] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  useEffect(() => {
    const cached = getCachedData(cacheKey);
    if (cached) { setDataAll(cached); setLoading(false); return; }
    const months = 120;
    const labels = generatePlaceholderMonths(months);
    const placeholderData = labels.map((lab, idx) => ({ date: lab, ip: +((95 + Math.cos(idx / 10) * 6 + Math.random() * 2).toFixed(2)) }));
    setDataAll(placeholderData);
    setCachedData(cacheKey, placeholderData);
    setLoading(false);
  }, []);

  useEffect(() => { if (!dataAll.length) return; setDisplayData(dataAll.slice(-RANGE_MAP[range])); }, [dataAll, range]);

 const handleDownload = async () => {
    const chartElement = document.getElementById("ip-chart");
    if (!chartElement) return;

    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: null,
        scale: 1,
      });

      const link = document.createElement("a");
      link.download = "ip-chart.png";
      link.href = canvas.toDataURL();
      link.click();

      toast({ title: "Success", description: "Chart downloaded successfully" });
    } catch (err) {
      console.error("Error downloading chart:", err);
      toast({ title: "Error", description: "Failed to download chart", variant: "destructive" });
    }
  };

  if (loading) return <div className="h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const interval = Math.max(0, Math.floor(displayData.length / 8));

  return (
    <div className="space-y-4" >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">

          {/* LEFT GROUP: Range Buttons and Show Markers Checkbox */}
          <div className="flex items-center gap-4 flex-wrap">

            {/* Range Buttons */}
            <div className="space-x-2">
              {(["3M", "1Y", "3Y", "5Y", "10Y"] as RangeKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${range === k ? "bg-primary text-white" : "bg-transparent border border-border hover:bg-muted"}`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Show Markers Checkbox */}
            <label className="inline-flex items-center gap-2 text-sm">
              <Checkbox checked={showDots} onCheckedChange={(v) => setShowDots(Boolean(v))} />
              <span className="select-none">Show markers</span>
            </label>
          </div>

          {/* RIGHT GROUP: Download Button */}
          <div className="flex-shrink-0">
            <Button variant="outline" size="sm" className="gap-2 no-export" onClick={handleDownload}><Download className="w-4 h-4" />Download</Button>
          </div>

        </div>
      </div>

      <ResponsiveContainer width="100%" height={400} id="ip-chart">
        <LineChart data={displayData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--foreground))" tick={({ x, y, payload }: any) => {
            const label = String(payload?.value ?? ""); const parts = label.split('/'); const short = parts.length === 2 ? `${parts[0]}/${parts[1].slice(-2)}` : label; const ty = y + 6;
            return <text x={x} y={ty} transform={`rotate(-90 ${x} ${ty})`} textAnchor="end" fill="hsl(var(--foreground))" fontSize={12}>{short}</text>;
          }} interval={interval}>
            <Label value="Date" position="center" dy={60} />
          </XAxis>
          <YAxis stroke="hsl(var(--foreground))">
            <Label value="Industrial Production" angle={-90} position="center" dx={-30} />
          </YAxis>
          <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
          <Legend verticalAlign="top" align="center" />
          <Line type="monotone" dataKey="ip" stroke="hsl(var(--chart-5))" strokeWidth={3} name="Industrial Production" dot={showDots ? { fill: "hsl(var(--chart-5))", r: 4 } : false} />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
