// src/pages/Backtesting.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label as ChartLabel,
} from "recharts";
import { Loader2, Play, TrendingUp, Activity, Users, DollarSign, ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  calculateMetrics,
  generateBacktestResults,
  BacktestResult,
  BacktestMetrics,
} from "@/lib/backtesting";
import {
  IndicatorType,
  INDICATOR_CONFIG,
  fetchHistoricalData,
  generateAIPrediction,
} from "@/lib/backtestingHelpers";

const INDICATOR_OPTIONS: Array<{
  value: IndicatorType;
  label: string;
  icon: React.ElementType;
}> = [
  { value: "gdp", label: "GDP", icon: TrendingUp },
  { value: "inflation", label: "Inflation Rate", icon: Activity },
  { value: "unemployment", label: "Unemployment", icon: Users },
  { value: "fed-funds", label: "Federal Funds Rate", icon: DollarSign },
  { value: "payrolls", label: "Nonfarm Payrolls", icon: Users },
  { value: "retail-sales", label: "Retail Sales", icon: ShoppingCart },
  { value: "industrial-production", label: "Industrial Production", icon: Package },
];

const Backtesting = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [indicator, setIndicator] = useState<IndicatorType>("gdp");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [metrics, setMetrics] = useState<BacktestMetrics | null>(null);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Set default dates (1 year ago to today)
  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      setEndDate(formatDateForInput(today));
      setStartDate(formatDateForInput(oneYearAgo));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunBacktest = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast({
        title: "Error",
        description: "Start date must be before end date",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setMetrics(null);

    try {
      // Fetch historical data
      const historicalData = await fetchHistoricalData(indicator, startDate, endDate);
      
      if (historicalData.length === 0) {
        toast({
          title: "No Data",
          description: "No historical data found for the selected date range",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate predictions for each date point
      const predictions: number[] = [];
      const actuals: number[] = [];
      const dates: string[] = [];
      const config = INDICATOR_CONFIG[indicator];

      // Limit to max 15 points for performance (sample if needed)
      const sampleSize = Math.min(historicalData.length, 15);
      const step = Math.max(1, Math.floor(historicalData.length / sampleSize));
      const sampledData = historicalData.filter((_, idx) => idx % step === 0 || idx === historicalData.length - 1);

      for (let i = 0; i < sampledData.length; i++) {
        const dataPoint = sampledData[i];
        dates.push(dataPoint.date);
        actuals.push(Number(dataPoint[config.dataKey]) || 0);

        // Generate prediction using data up to (but not including) this point
        // Find the index in full historicalData array
        const currentIndex = historicalData.findIndex((d) => d.date === dataPoint.date);
        const historicalContext = currentIndex > 0 ? historicalData.slice(0, currentIndex) : [];
        
        const prediction = await generateAIPrediction(
          indicator,
          dataPoint.date,
          historicalContext.length > 0 ? historicalContext : [dataPoint]
        );
        predictions.push(prediction);
        
        // Add small delay to avoid rate limiting
        if (i < sampledData.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Show progress
        if ((i + 1) % 5 === 0) {
          toast({
            title: "Progress",
            description: `Processing ${i + 1} of ${sampledData.length} data points...`,
          });
        }
      }

      // Generate backtest results
      const backtestResults = generateBacktestResults(dates, actuals, predictions);
      setResults(backtestResults);

      // Calculate metrics
      const calculatedMetrics = calculateMetrics(backtestResults);
      setMetrics(calculatedMetrics);

      toast({
        title: "Success",
        description: `Backtesting completed! Analyzed ${backtestResults.length} data points.`,
      });
    } catch (error: any) {
      console.error("Backtesting error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to run backtest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Backtesting & Model Performance
            </h1>
            <p className="text-muted-foreground">
              Evaluate AI prediction accuracy by comparing forecasts against historical actual values
            </p>
          </div>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Backtesting Configuration</CardTitle>
            <CardDescription>
              Select an economic indicator and date range to evaluate prediction performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="indicator">Economic Indicator</Label>
                <Select value={indicator} onValueChange={(v) => setIndicator(v as IndicatorType)}>
                  <SelectTrigger id="indicator">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INDICATOR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                  max={formatDateForInput(new Date())}
                />
              </div>
            </div>

            <Button
              onClick={handleRunBacktest}
              disabled={loading || !startDate || !endDate}
              className="mt-6 gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Backtest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Metrics Cards */}
        {metrics && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Mean Absolute Error</CardDescription>
                <CardTitle className="text-2xl">{metrics.mae.toFixed(4)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Mean Absolute % Error</CardDescription>
                <CardTitle className="text-2xl">{metrics.mape.toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Root Mean Squared Error</CardDescription>
                <CardTitle className="text-2xl">{metrics.rmse.toFixed(4)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>R² Score</CardDescription>
                <CardTitle className="text-2xl">{(metrics.rSquared * 100).toFixed(2)}%</CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Charts */}
        {results.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Actual vs Predicted Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Actual vs Predicted</CardTitle>
                <CardDescription>Comparison of actual and predicted values over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--foreground))"
                      tick={{ fontSize: 11 }}
                      tickFormatter={shortDate}
                    />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      name="Actual"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      name="Predicted"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error % Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Error Percentage</CardTitle>
                <CardDescription>Prediction error percentage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--foreground))"
                      tick={{ fontSize: 11 }}
                      tickFormatter={shortDate}
                    />
                    <YAxis stroke="hsl(var(--foreground))">
                      <ChartLabel value="Error %" angle={-90} position="insideLeft" />
                    </YAxis>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                      formatter={(value: number) => `${value.toFixed(2)}%`}
                    />
                    <Legend />
                    <Bar
                      dataKey="errorPercent"
                      fill="hsl(var(--chart-3))"
                      name="Error %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>
                Complete breakdown of actual values, predictions, and errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actual Value</TableHead>
                      <TableHead className="text-right">Predicted Value</TableHead>
                      <TableHead className="text-right">Error</TableHead>
                      <TableHead className="text-right">Error %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{result.date}</TableCell>
                        <TableCell className="text-right">{result.actual.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.predicted.toFixed(2)}</TableCell>
                        <TableCell
                          className={`text-right ${Math.abs(result.error) > 0 ? (result.error > 0 ? "text-green-500" : "text-red-500") : ""}`}
                        >
                          {result.error > 0 ? "+" : ""}
                          {result.error.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${Math.abs(result.errorPercent) > 0 ? (result.errorPercent > 0 ? "text-green-500" : "text-red-500") : ""}`}
                        >
                          {result.errorPercent > 0 ? "+" : ""}
                          {result.errorPercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && results.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Generating predictions... This may take a moment.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Backtesting;

