// src/lib/chartCache.ts

export const getCachedData = (key: string): any[] | null => {
  try {
    const cached = localStorage.getItem(`chartData_${key}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
};

export const setCachedData = (key: string, data: any[]): void => {
  try {
    localStorage.setItem(`chartData_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};