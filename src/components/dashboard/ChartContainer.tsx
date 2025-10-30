import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartType } from "@/pages/Dashboard";
import { GDPChart } from "@/components/charts/GDPChart";
import { InflationChart } from "@/components/charts/InflationChart";
import { PolicyTradeoffChart } from "@/components/charts/PolicyTradeoffChart";
import { UnemploymentChart } from "@/components/charts/UnemploymentChart";
import { FedFundsChart } from "@/components/charts/FedFundsChart";
import { PayrollsChart } from "@/components/charts/PayrollsChart";
import { RetailSalesChart } from "@/components/charts/RetailSalesChart";
import { IndustrialProductionChart } from "@/components/charts/IndustrialProductionChart";
import { AIChat } from "@/components/dashboard/AIChat";
import { useState } from "react";

interface ChartContainerProps {
  selectedChart: ChartType;
}

const chartConfig: Record<ChartType, { title: string; description: string; component: React.ComponentType }> = {
  "gdp": {
    title: "GDP Growth Rate",
    description: "Quarterly percentage change in US Gross Domestic Product",
    component: GDPChart
  },
  "inflation": {
    title: "Inflation Rate (CPI)",
    description: "Consumer Price Index showing price changes over time",
    component: InflationChart
  },
  "policy-tradeoff": {
    title: "Policy Trade-off: Inflation vs Interest Rates",
    description: "Interactive view of the relationship between inflation and monetary policy",
    component: PolicyTradeoffChart
  },
  "unemployment": {
    title: "Unemployment Rate",
    description: "Percentage of labor force that is unemployed",
    component: UnemploymentChart
  },
  "fed-funds": {
    title: "Federal Funds Rate",
    description: "Target interest rate set by the Federal Reserve",
    component: FedFundsChart
  },
  "payrolls": {
    title: "Nonfarm Payrolls",
    description: "Monthly change in US employment excluding farm workers",
    component: PayrollsChart
  },
  "retail-sales": {
    title: "Retail Sales",
    description: "Total receipts of retail stores",
    component: RetailSalesChart
  },
  "industrial-production": {
    title: "Industrial Production Index",
    description: "Measure of real output of manufacturing, mining, and utilities",
    component: IndustrialProductionChart
  }
};

export const ChartContainer = ({ selectedChart }: ChartContainerProps) => {
  const config = chartConfig[selectedChart];
  const ChartComponent = config.component;
  const [chartData, setChartData] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div id={`chart-${selectedChart}`}>
            {selectedChart === "gdp" ? (
              <GDPChart onDataChange={setChartData} />
            ) : (
              <ChartComponent />
            )}
          </div>
        </CardContent>
      </Card>
      <AIChat chartType={selectedChart} chartData={chartData} />
    </div>
  );
};
