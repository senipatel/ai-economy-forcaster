import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Brain, LineChart, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powered by FRED & Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            AI Economic Forecaster
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Transform complex US economic data into actionable insights with real-time charts and AI-powered analysis
          </p>
          
          <Button 
            size="lg" 
            onClick={() => navigate("/dashboard")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg shadow-glow animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
          >
            Open Dashboard
            <TrendingUp className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: LineChart,
              title: "Real-Time Economic Data",
              description: "Access live US economic indicators including GDP, inflation, unemployment, and federal funds rate from FRED API",
              delay: "delay-100"
            },
            {
              icon: Brain,
              title: "AI-Powered Analysis",
              description: "Get context-aware insights for each chart powered by Gemini AI. Ask questions and understand trends instantly",
              delay: "delay-200"
            },
            {
              icon: TrendingUp,
              title: "Interactive Forecasting",
              description: "Adjust policy parameters with interactive sliders and see real-time impact on economic forecasts",
              delay: "delay-300"
            }
          ].map((feature, idx) => (
            <div 
              key={idx} 
              className={`bg-card border border-border rounded-xl p-8 hover:shadow-card transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 ${feature.delay}`}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Metrics Preview */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Track Critical Economic Indicators</h2>
          <p className="text-muted-foreground text-lg">Monitor the metrics that matter most to the US economy</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { label: "GDP Growth", icon: "📈" },
            { label: "Inflation Rate", icon: "💹" },
            { label: "Unemployment", icon: "👥" },
            { label: "Fed Funds Rate", icon: "🏦" }
          ].map((metric, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-all duration-300">
              <div className="text-4xl mb-3">{metric.icon}</div>
              <div className="font-semibold">{metric.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-primary rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to Explore Economic Insights?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Start analyzing real-time economic data with AI-powered insights
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/dashboard")}
            className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-lg"
          >
            Launch Dashboard
            <TrendingUp className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
