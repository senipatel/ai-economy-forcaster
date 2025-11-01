// src/lib/backtesting.ts
// Utility functions for backtesting calculations

export interface BacktestResult {
  date: string;
  actual: number;
  predicted: number;
  error: number;
  errorPercent: number;
}

export interface BacktestMetrics {
  mae: number;
  mape: number;
  rmse: number;
  rSquared: number;
}

/**
 * Calculate Mean Absolute Error (MAE)
 */
export function calculateMAE(results: BacktestResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + Math.abs(r.error), 0);
  return sum / results.length;
}

/**
 * Calculate Mean Absolute Percentage Error (MAPE)
 */
export function calculateMAPE(results: BacktestResult[]): number {
  if (results.length === 0) return 0;
  const validResults = results.filter((r) => r.actual !== 0);
  if (validResults.length === 0) return 0;
  const sum = validResults.reduce((acc, r) => acc + Math.abs(r.errorPercent), 0);
  return sum / validResults.length;
}

/**
 * Calculate Root Mean Squared Error (RMSE)
 */
export function calculateRMSE(results: BacktestResult[]): number {
  if (results.length === 0) return 0;
  const sumSquared = results.reduce((acc, r) => acc + Math.pow(r.error, 2), 0);
  return Math.sqrt(sumSquared / results.length);
}

/**
 * Calculate R² Score (Coefficient of Determination)
 */
export function calculateRSquared(results: BacktestResult[]): number {
  if (results.length === 0) return 0;
  
  const actualValues = results.map((r) => r.actual);
  const meanActual = actualValues.reduce((a, b) => a + b, 0) / actualValues.length;
  
  const ssRes = results.reduce((acc, r) => acc + Math.pow(r.error, 2), 0);
  const ssTot = results.reduce((acc, r) => acc + Math.pow(r.actual - meanActual, 2), 0);
  
  if (ssTot === 0) return 0;
  return 1 - ssRes / ssTot;
}

/**
 * Calculate all metrics at once
 */
export function calculateMetrics(results: BacktestResult[]): BacktestMetrics {
  return {
    mae: calculateMAE(results),
    mape: calculateMAPE(results),
    rmse: calculateRMSE(results),
    rSquared: calculateRSquared(results),
  };
}

/**
 * Generate backtest results from actual and predicted arrays
 */
export function generateBacktestResults(
  dates: string[],
  actualValues: number[],
  predictedValues: number[]
): BacktestResult[] {
  const results: BacktestResult[] = [];
  
  for (let i = 0; i < dates.length; i++) {
    const actual = actualValues[i];
    const predicted = predictedValues[i];
    const error = predicted - actual;
    const errorPercent = actual !== 0 ? (error / actual) * 100 : 0;
    
    results.push({
      date: dates[i],
      actual,
      predicted,
      error,
      errorPercent,
    });
  }
  
  return results;
}

