// src/lib/backtestingHelpers.ts
// Helper functions for fetching historical data and generating AI predictions

import { GoogleGenerativeAI } from "@google/generative-ai";

export type IndicatorType =
  | "gdp"
  | "inflation"
  | "unemployment"
  | "fed-funds"
  | "payrolls"
  | "retail-sales"
  | "industrial-production";

// Mapping of indicators to their FRED API endpoints and data keys
export const INDICATOR_CONFIG: Record<
  IndicatorType,
  { apiEndpoint: string; dataKey: string; seriesId: string; label: string }
> = {
  gdp: {
    apiEndpoint: "/api/fred-gdp",
    dataKey: "gdp",
    seriesId: "GDP",
    label: "GDP (Trillions of 2017 $)",
  },
  inflation: {
    apiEndpoint: "/api/fred-inflation",
    dataKey: "inflation",
    seriesId: "CPIAUCSL",
    label: "Inflation Rate (%)",
  },
  unemployment: {
    apiEndpoint: "/api/fred-unemployment",
    dataKey: "unemployment",
    seriesId: "UNRATE",
    label: "Unemployment Rate (%)",
  },
  "fed-funds": {
    apiEndpoint: "/api/fred-fedfunds",
    dataKey: "rate",
    seriesId: "FEDFUNDS",
    label: "Federal Funds Rate (%)",
  },
  payrolls: {
    apiEndpoint: "/api/fred-payrolls",
    dataKey: "payrolls",
    seriesId: "PAYNSA",
    label: "Payrolls (k)",
  },
  "retail-sales": {
    apiEndpoint: "/api/fred-retailsales",
    dataKey: "retail",
    seriesId: "RSXFS",
    label: "Retail Sales (M$)",
  },
  "industrial-production": {
    apiEndpoint: "/api/fred-industrial",
    dataKey: "ip",
    seriesId: "INDPRO",
    label: "Industrial Production",
  },
};

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const PREFERRED_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

/**
 * Get an available Gemini model instance
 */
async function getAvailableModelInstance() {
  let lastError: any = null;
  for (const modelId of PREFERRED_MODELS) {
    try {
      return genAI.getGenerativeModel({ model: modelId });
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    `No available Gemini model found. Tried: ${PREFERRED_MODELS.join(", ")}. Last error: ${lastError?.message ?? String(lastError)}`
  );
}

/**
 * Generate AI prediction for a specific date based on historical context
 */
export async function generateAIPrediction(
  indicator: IndicatorType,
  targetDate: string,
  historicalData: Array<{ date: string; [key: string]: any }>
): Promise<number> {
  try {
    const model = await getAvailableModelInstance();
    const config = INDICATOR_CONFIG[indicator];
    
    // Prepare historical context (last 12 data points before target date)
    const targetDateTime = parseDateFromString(targetDate) || new Date(targetDate);
    const contextData = historicalData
      .filter((d) => {
        const dataDate = parseDateFromString(d.date);
        if (!dataDate) return false;
        return dataDate < targetDateTime;
      })
      .slice(-12)
      .map((d) => ({
        date: d.date,
        value: d[config.dataKey],
      }));

    const prompt = `You are an AI Economist Assistant. Based on the historical ${config.label} data provided, predict the value for ${targetDate}.

Historical Data (last 12 months before ${targetDate}):
${JSON.stringify(contextData, null, 2)}

Provide ONLY a numeric prediction value for ${targetDate}. Do not include any explanation, text, or formatting. Just the number.

Prediction for ${targetDate}:`;

    const result = await model.generateContent(prompt);
    const responseText = extractTextFromResult(result);
    
    // Extract numeric value from response
    const numericMatch = responseText.match(/[\d.]+/);
    if (numericMatch) {
      return parseFloat(numericMatch[0]);
    }
    
    // Fallback: use simple trend calculation
    if (contextData.length >= 2) {
      const recent = contextData.slice(-3).map((d) => d.value).filter((v) => typeof v === "number");
      if (recent.length >= 2) {
        const trend = (recent[recent.length - 1] - recent[0]) / recent.length;
        return recent[recent.length - 1] + trend;
      }
    }
    
    return contextData[contextData.length - 1]?.value || 0;
  } catch (error) {
    console.error("AI prediction error:", error);
    // Fallback to trend-based prediction
    const config = INDICATOR_CONFIG[indicator];
    const targetDateTime = parseDateFromString(targetDate) || new Date(targetDate);
    const contextData = historicalData
      .filter((d) => {
        const dataDate = parseDateFromString(d.date);
        if (!dataDate) return false;
        return dataDate < targetDateTime;
      })
      .slice(-3)
      .map((d) => d[config.dataKey])
      .filter((v) => typeof v === "number");
    
    if (contextData.length >= 2) {
      const trend = (contextData[contextData.length - 1] - contextData[0]) / contextData.length;
      return contextData[contextData.length - 1] + trend;
    }
    
    return contextData[contextData.length - 1] || 0;
  }
}

/**
 * Extract text from Gemini API response
 */
function extractTextFromResult(result: any): string {
  try {
    if (result?.response && typeof result.response.text === "function") {
      const text = result.response.text();
      if (typeof text === "string") return text;
    }
    if (Array.isArray(result?.output) && result.output.length > 0) {
      const outItem = result.output[0];
      if (Array.isArray(outItem?.content) && outItem.content.length > 0) {
        const c = outItem.content[0];
        if (typeof c?.text === "string") return c.text;
        if (typeof c === "string") return c;
      }
      if (typeof outItem?.text === "string") return outItem.text;
    }
    if (typeof result === "string") return result;
    return JSON.stringify(result);
  } catch (err) {
    return "0";
  }
}

/**
 * Fetch historical data for an indicator
 */
export async function fetchHistoricalData(
  indicator: IndicatorType,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; [key: string]: any }>> {
  const config = INDICATOR_CONFIG[indicator];
  
  try {
    // Fetch data from the proxy endpoint
    const response = await fetch(config.apiEndpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${indicator} data`);
    }
    
    const data = await response.json();
    
    // Convert input dates to Date objects for comparison
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Include the entire end date
    
    // Filter data by date range
    const filtered = data.filter((item: any) => {
      const itemDate = parseDateFromString(item.date);
      if (!itemDate) return false;
      
      // Compare dates
      return itemDate >= startDateObj && itemDate <= endDateObj;
    });
    
    // Sort by date to ensure chronological order
    filtered.sort((a, b) => {
      const dateA = parseDateFromString(a.date);
      const dateB = parseDateFromString(b.date);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
    
    return filtered;
  } catch (error) {
    console.error(`Error fetching ${indicator} data:`, error);
    throw error;
  }
}

/**
 * Parse date from various string formats (MM/YY, YYYY-MM-DD, etc.)
 */
export function parseDateFromString(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Format: MM/YY or MM/YYYY
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 2) {
        const month = parseInt(parts[0]);
        const yearStr = parts[1];
        const fullYear = yearStr.length === 2 ? parseInt(`20${yearStr}`) : parseInt(yearStr);
        // Use first day of month for comparison
        return new Date(fullYear, month - 1, 1);
      }
    }
    
    // Format: YYYY-MM-DD
    if (dateStr.includes("-") && dateStr.length >= 10) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Format date to YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Convert date string to standard format (YYYY-MM-DD)
 */
export function normalizeDateString(dateStr: string): string {
  const date = parseDateFromString(dateStr);
  if (!date) return dateStr;
  return formatDateForInput(date);
}

