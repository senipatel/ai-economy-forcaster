// src/lib/chartCache.ts
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  data: any[];
  timestamp: number;
}

/**
 * Get cached data (if it exists and is not expired)
 */
export const getCachedData = (key: string): any[] | null => {
  try {
    const raw = localStorage.getItem(`chartData_${key}`);
    if (!raw) return null;

    const item: CacheItem = JSON.parse(raw);

    // Expired?
    if (Date.now() - item.timestamp > TTL_MS) {
      localStorage.removeItem(`chartData_${key}`);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
};

/**
 * Store data with a timestamp
 */
export const setCachedData = (key: string, data: any[]): void => {
  try {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`chartData_${key}`, JSON.stringify(item));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
};