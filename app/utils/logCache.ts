// app/utils/logCache.ts

const logCache: string[] = [];

export function addLog(message: string) {
  logCache.push(`[${new Date().toISOString()}] ${message}`);
  if (logCache.length > 100) {
    logCache.shift(); // keep only last 100
  }
}

export function getLogs() {
  return [...logCache];
}

export function clearLogs() {
  logCache.length = 0;
}
