import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Sparkles } from "lucide-react";
import { ChartType } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AIChatProps {
  chartType: ChartType;
  chartData?: any[];
}

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

const DEFAULT_PROMPTS = [
  "Provide a summary of this graph",
  "Predict next year's data trends",
];

export const AIChat = ({ chartType, chartData }: AIChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (customMessage?: string) => {
  const messageToSend = customMessage || message;
  if (!messageToSend.trim()) return;

  setMessage("");
  setMessages(prev => [...prev, { role: "user", content: messageToSend }]);
  setLoading(true);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const contextInfo = chartData 
      ? `\n\nChart Data Context: ${JSON.stringify(chartData.slice(0, 10))}...` 
      : "";

    const prompt = `You are an AI Economist Assistant. Answer only economy-related questions 
    (macroeconomics, microeconomics, finance, markets, trade). If unrelated, reply: "I can only answer 
    economy-related questions." Keep answers concise (100-150 words), simple, and clear. User: 
    ${messageToSend} ${contextInfo}`;

    const result = await model.generateContent(prompt as any);
    const response = result.response.text();

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: response }
    ]);
  } catch (error) {
    console.error("AI Error:", error);
    toast({
      title: "Error",
      description: "Failed to get AI response. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Card className="shadow-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-accent" />
          <CardTitle>AI Analysis</CardTitle>
        </div>
        <CardDescription>Ask questions about this chart's data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {/* {DEFAULT_PROMPTS.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="gap-2"
              >
                <Sparkles className="w-3 h-3" />
                {prompt}
              </Button>
            ))} */}
          </div>
        )}
        
        <div className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Start a conversation to get AI-powered insights about this economic indicator
            </p>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border p-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            placeholder="Ask about trends, predictions, or insights..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[60px]"
          />
          <Button onClick={() => handleSend()} disabled={loading || !message.trim()} size="icon" className="h-[60px] w-[60px]">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
