import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Activity, GitBranch, Users, DollarSign, ShoppingCart, Package, Plus } from "lucide-react";
import { ChartType } from "@/pages/Dashboard";
import CreateChart from "../charts/CreateChart";

const chartItems = [
  { id: "gdp" as ChartType, title: "GDP Growth", icon: TrendingUp },
  { id: "inflation" as ChartType, title: "Inflation Rate", icon: Activity },
  { id: "policy-tradeoff" as ChartType, title: "Policy Trade-off", icon: GitBranch },
  { id: "unemployment" as ChartType, title: "Unemployment", icon: Users },
  { id: "fed-funds" as ChartType, title: "Federal Funds Rate", icon: DollarSign },
  { id: "payrolls" as ChartType, title: "Nonfarm Payrolls", icon: Users },
  { id: "retail-sales" as ChartType, title: "Retail Sales", icon: ShoppingCart },
  { id: "industrial-production" as ChartType, title: "Industrial Production", icon: Package },
];

interface DashboardSidebarProps {
  selectedChart: ChartType;
  onSelectChart: (chart: ChartType) => void;
}

export const DashboardSidebar = ({ selectedChart, onSelectChart }: DashboardSidebarProps) => {
  return (
    <Sidebar className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Economic Indicators</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chartItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectChart(item.id)}
                    isActive={selectedChart === item.id}
                    className="w-full"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="p-4 space-y-2">
        <CreateChart />
        <Button variant="outline" size="sm" className="w-full gap-2">
          <Upload className="w-4 h-4" />
          Create from Data
        </Button>
      </SidebarFooter> */}
    </Sidebar>
  );
};
