// src/components/AIChat.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Send, Sparkles } from "lucide-react";
import { ChartType } from "@/pages/Dashboard";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

/**
 * IMPORTANT security note:
 * - Do NOT ship your real API key in client bundles. The code below shows direct SDK usage
 *   for quick local testing only. For production, proxy requests through a backend server
 *   (serverless function / API route) and keep the API key secret there.
 */

interface AIChatProps {
  chartType: ChartType;
  chartData?: any[];
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Try a small list of currently-supported Gemini model IDs (2.5 family).
// If your account doesn't have a model, the SDK will throw and we try the next one.
const PREFERRED_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

const DEFAULT_PROMPTS = [
  "Provide a summary of this graph",
  "Predict next year's data trends",
];

async function getAvailableModelInstance() {
  // Attempt to get a usable model instance from the preferred list.
  // genAI.getGenerativeModel may throw if the model is not available.
  let lastError: any = null;
  for (const modelId of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      // Optionally you could make a tiny call here to validate — for speed we return directly.
      return model;
    } catch (err) {
      // keep trying next model
      lastError = err;
      // eslint-disable-next-line no-console
      console.warn(`Model ${modelId} unavailable:`, err);
    }
  }
  // If none worked, rethrow a consolidated error
  throw new Error(
    `No available Gemini model found. Tried: ${PREFERRED_MODELS.join(
      ", "
    )}. Last error: ${lastError?.message ?? String(lastError)}`
  );
}

/**
 * Helper to safely extract text from the SDK result object.
 * SDK shapes vary by versions; this function tries common shapes.
 */
function extractTextFromResult(result: any): string {
  try {
    // shape: result.response.text()
    if (result?.response && typeof result.response.text === "function") {
      const text = result.response.text();
      if (typeof text === "string") return text;
    }

    // other common shapes:
    // result.output[0].content[0].text
    if (Array.isArray(result?.output) && result.output.length > 0) {
      const outItem = result.output[0];
      if (Array.isArray(outItem?.content) && outItem.content.length > 0) {
        const c = outItem.content[0];
        if (typeof c?.text === "string") return c.text;
        if (typeof c === "string") return c;
      }
      // fallback: output[0].text
      if (typeof outItem?.text === "string") return outItem.text;
    }

    // fallback: result.toString()
    if (typeof result === "string") return result;
    return JSON.stringify(result);
  } catch (err) {
    return "Unable to parse AI response.";
  }
}

export const AIChat = ({ chartType, chartData }: AIChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [includeChartData, setIncludeChartData] = useState(true);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage ?? message;
    if (!messageToSend || !messageToSend.trim()) return;

    // add user message to UI immediately
    setMessage("");
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setLoading(true);

    try {
      // Get a working model instance (tries the list)
      const model = await getAvailableModelInstance();

      const contextInfo =
        includeChartData && chartData
          ? `\n\nChart Data Context: ${JSON.stringify(chartData)}...`
          : "";

      const prompt = `You are an AI Economist Assistant. Answer only economy, finances, markets, trade, graph and nation related questions (macroeconomics, microeconomics, finance, markets, trade). If unrelated, reply: "I can only answer economy-related questions." Keep answers concise, simple, and clear. User: ${messageToSend} ${contextInfo}`;

      // Most SDKs accept either a plain string or an object; keep same call shape you had but guard result parsing.
      const result = await model.generateContent(prompt);

      const responseText = extractTextFromResult(result) ?? "No response from model.";

      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch (err: any) {
      // show friendly toast + put a message in chat
      const msg = err?.message ?? String(err);
      toast({
        title: "AI Error",
        description:
          msg.indexOf("No available Gemini model") > -1
            ? "No supported Gemini model available for this API key/project. Check model availability or use a backend proxy."
            : "Failed to get AI response. See console for details.",
        variant: "destructive",
      });

      // also append an assistant-like error message so the user sees it inline
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to get a response from the AI. Check console for details. If you are running in production, move the API key to a backend service.",
        },
      ]);
      // eslint-disable-next-line no-console
      console.error("AI Error:", err);
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
            {DEFAULT_PROMPTS.map((prompt, idx) => (
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
            ))}
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

        <div className="flex items-center space-x-2 mb-2">
          <Switch
            id="include-chart-data"
            checked={includeChartData}
            onCheckedChange={setIncludeChartData}
          />
          <Label htmlFor="include-chart-data">Include chart data in context</Label>
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
          <Button
            onClick={() => handleSend()}
            disabled={loading || !message.trim()}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;
