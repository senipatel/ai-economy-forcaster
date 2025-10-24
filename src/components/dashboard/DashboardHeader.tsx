import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Economic Dashboard
        </h1>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Button>
    </header>
  );
};
