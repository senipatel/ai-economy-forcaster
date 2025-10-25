import React, { useState, useEffect, useRef } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label as RechartsLabel,
} from "recharts";
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Define interfaces for better type safety
interface FormData {
  graphName: string;
  country: string;
  startYear: string;
  endYear: string;
  chartType: SupportedChartType;
  frequency: string;
}

type RangeKey = "3M" | "1Y" | "3Y" | "5Y" | "10Y";
const RANGE_MAP: Record<RangeKey, number> = { "3M": 3, "1Y": 12, "3Y": 36, "5Y": 60, "10Y": 120 };

// Supported chart types
type SupportedChartType = 'line' | 'bar';

const availableIndicators = [
  { value: 'GDP', label: 'GDP' },
  { value: 'Unemployment', label: 'Unemployment' },
  { value: 'CPI', label: 'Consumer Price Index (CPI)' },
  { value: 'demo', label: 'Demo (Nonfarm Payrolls)' },
];

const CreateChart = () => {
  // New type for a single observation suitable for Recharts
  interface ChartObservation {
    date: string;
    value: number | null;
  }

  // It's best practice to store API keys in environment variables
  // Create a .env.local file in your project root and add:
  // VITE_FRED_API_KEY=your_api_key_here
  const apiKey = process.env.VITE_FRED_API_KEY; // Fallback for demonstration
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    graphName: 'GDP',
    country: 'USA',
    startYear: '2010',
    endYear: new Date().getFullYear().toString(),
    chartType: 'line',
    frequency: 'm',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartObservation[] | null>(null); // Updated type
  const [displayData, setDisplayData] = useState<ChartObservation[] | null>(null); // Updated type
  const [range, setRange] = useState<RangeKey>("1Y");
  const [showDots, setShowDots] = useState<boolean>(true);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateChart = async () => {
    setLoading(true);
    setError(null);
    setChartData(null);

    const seriesMap: { [key: string]: string } = {
      'USA-GDP': 'GDP',
      'USA-Unemployment': 'UNRATE',
      'USA-CPI': 'CPIAUCSL',
      'Japan-CPI': 'CPALTT01JPM661N',
      'China-GDP': 'MKTGDPCHA646NWDB',
      'Euro Area-GDP': 'CLVMNACSCAB1GQEA19',
    };
    let seriesId = seriesMap[`${formData.country}-${formData.graphName.toUpperCase()}`];

    if (!seriesId) {
      if (formData.graphName.toLowerCase() === 'demo') { // Handle 'demo' as a special case
        seriesId = 'PAYNSA'; // Use a default series for demo purposes
      } else {
        setError(`Invalid economic indicator "${formData.graphName}" for the selected country. Please select a valid indicator.`);
        return;
      }
    }

    try {
      const observationStart = `${formData.startYear}-01-01`;
      const observationEnd = `${formData.endYear}-12-31`;
      let url = `/fred-api/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${observationStart}&observation_end=${observationEnd}&frequency=${formData.frequency}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data from FRED API: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.observations || data.observations.length === 0) {
        throw new Error('No data available for the selected criteria.');
      }

      // Transform data into an array of objects, suitable for Recharts
      const transformedData: ChartObservation[] = data.observations.map((obs: any) => ({
        date: obs.date,
        value: obs.value === '.' ? null : parseFloat(obs.value),
      }));

      setChartData(transformedData); // Store the Recharts-friendly format
      setStep(5); // Move to the chart view step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (chartData) {
        const months = RANGE_MAP[range];
        // chartData is now an array of ChartObservation objects
        const slicedData = chartData.slice(-months);
        setDisplayData(slicedData); // displayData will also be an array of ChartObservation objects
    }
  }, [chartData, range]);

  const handleDownload = async () => {
    const chartElement = document.getElementById("created-chart");
    if (!chartElement) return;

    try {
      const dataUrl = await toPng(chartElement);
      const link = document.createElement("a");
      link.download = `${formData.graphName.toLowerCase().replace(/ /g, '-')}-chart.png`;
      link.href = dataUrl;
      link.click();

      toast({ title: "Success", description: "Chart downloaded successfully" });
    } catch (err) {
      console.error("Error downloading chart:", err);
      toast({ title: "Error", description: "Failed to download chart", variant: "destructive" });
    }
  };

  // Custom Tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background border rounded-md shadow-lg">
          <p className="font-bold">{`Date: ${label}`}</p>
          <p style={{ color: payload[0].stroke || payload[0].fill }}>
            {`${payload[0].name}: ${
              payload[0].value !== null ? payload[0].value.toLocaleString() : 'N/A'
            }`}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <Label htmlFor="graphName">Economic Indicator</Label>
            <Select value={formData.graphName} onValueChange={(value) => handleFormChange('graphName', value)}>
              <SelectTrigger id="graphName">
                <SelectValue placeholder="Select an indicator" />
              </SelectTrigger>
              <SelectContent>
                {availableIndicators.map(indicator => (
                  <SelectItem key={indicator.value} value={indicator.value}>{indicator.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleNext} className="mt-4">Next</Button>
          </div>
        );
      case 2:
        return (
          <div>
            <Label htmlFor="country">Country Name</Label>
            <Select value={formData.country} onValueChange={(value) => handleFormChange('country', value)}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="China">China</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Euro Area">Euro Area</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Input id="startYear" type="number" value={formData.startYear} onChange={(e) => handleFormChange('startYear', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="endYear">End Year</Label>
                <Input id="endYear" type="number" value={formData.endYear} onChange={(e) => handleFormChange('endYear', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chartType">Chart Type</Label>
                <Select value={formData.chartType} onValueChange={(value) => handleFormChange('chartType', value as SupportedChartType)}>
                  <SelectTrigger id="chartType">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="bar">Bar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleFormChange('frequency', value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Annual</SelectItem>
                    <SelectItem value="q">Quarterly</SelectItem>
                    <SelectItem value="m">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>Back</Button>
              <Button onClick={handleGenerateChart} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Chart'}
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div id="created-chart">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between sm:space-y-0 space-y-2 mb-4">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 flex-wrap">
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
                        <label className="inline-flex items-center gap-2 text-sm">
                        <Checkbox checked={showDots} onCheckedChange={(v) => setShowDots(Boolean(v))} />
                        <span className="select-none">Show markers</span>
                        </label>
                    </div>
                    <div className="flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-2 no-export" onClick={handleDownload}><Download className="w-4 h-4" />Download</Button>
                    </div>
                </div>
            </div>
            <div className="w-full h-96">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayData ?? []}
                    margin={{
                      top: 5,
                      right: 20,
                      bottom: 25,
                      left: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }}>
                      <RechartsLabel value="Date" position="insideBottom" offset={-15} />
                    </XAxis>
                    <YAxis tickFormatter={(value) => value.toLocaleString()} tick={{ fontSize: 12 }}>
                      <RechartsLabel value="Value" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" />
                    {formData.chartType === 'line' && (
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={formData.graphName}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={showDots ? { r: 3, strokeWidth: 1 } : false}
                        connectNulls
                      />
                    )}
                    {formData.chartType === 'bar' && <Bar dataKey="value" name={formData.graphName} fill="hsl(var(--primary))" />}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>Create Another Chart</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Graph</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Graph</DialogTitle>
          <DialogDescription>
            {step < 5 ? `Step ${step} of 4: ${['Graph Name', 'Country', 'Time Range', 'Chart Options'][step - 1]}` : 'Your Chart'}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};

export default CreateChart;
