import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Brain, LineChart, Zap, Menu, X, Github, Mail, Info } from "lucide-react";
import { useState, useEffect } from "react";

const Landing = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-card/95 backdrop-blur-sm border-b border-border shadow-card" : "bg-transparent"
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => scrollToSection("home")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Economy Forecaster
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("home")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button
                onClick={() => navigate("/backtesting")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Backtesting
              </button>
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Dashboard
                <TrendingUp className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-border mt-2 pt-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                >
                  About
                </button>
                <button
                  onClick={() => navigate("/backtesting")}
                  className="text-left px-4 py-2 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                >
                  Backtesting
                </button>
                <Button
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="mx-4 bg-primary hover:bg-primary/90"
                >
                  Dashboard
                  <TrendingUp className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-6 pt-32 pb-20">
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
      <section id="features" className="container mx-auto px-6 py-20">
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

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">About the Project</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Democratizing Economic Forecasting
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Making complex economic data accessible to everyone through AI-powered insights and intuitive visualizations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Problem Card */}
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">The Problem</h3>
              <p className="text-muted-foreground leading-relaxed">
                Traditional economic forecasting models are often complex, require deep expertise, and may not process vast amounts of real-time data efficiently. This creates a barrier for individuals and small businesses to make data-driven economic decisions.
              </p>
            </div>

            {/* Solution Card */}
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-card transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Solution</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI Economy Forecaster simplifies economic analysis by providing intuitive visualizations, AI-powered insights, and interactive policy simulations. We make complex economic data accessible to everyone, empowering informed decision-making.
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-semibold mb-6">Built With Modern Technology</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "React", icon: "⚛️" },
                { name: "TypeScript", icon: "📘" },
                { name: "Vite", icon: "⚡" },
                { name: "Tailwind CSS", icon: "🎨" },
                { name: "Shadcn UI", icon: "🧩" },
                { name: "Gemini AI", icon: "🤖" },
                { name: "FRED API", icon: "📊" },
                { name: "Recharts", icon: "📈" },
              ].map((tech, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <span className="text-2xl">{tech.icon}</span>
                  <span className="text-sm font-medium">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
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

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
                AI Economy Forecaster
              </span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Developers:</span>
                <a
                  href="https://github.com/Sapna190"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Github className="w-4 h-4 inline mr-1" />
                  Sapna Sharma
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://github.com/senipatel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <Github className="w-4 h-4 inline mr-1" />
                  Seni Patel
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Built for:</span>
                <a
                  href="https://hacknomics.devpost.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  HackNomics
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 AI Economy Forecaster. Built for HackNomics Hackathon.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
