import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChartContainer } from "@/components/dashboard/ChartContainer";

export type ChartType = 
  | "gdp" 
  | "inflation" 
  | "policy-tradeoff" 
  | "unemployment" 
  | "fed-funds" 
  | "payrolls" 
  | "retail-sales" 
  | "industrial-production";

const Dashboard = () => {
  const [selectedChart, setSelectedChart] = useState<ChartType>("gdp");

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          selectedChart={selectedChart} 
          onSelectChart={setSelectedChart} 
        />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-6 overflow-auto">
            <ChartContainer selectedChart={selectedChart} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
