export function logRequest(color: string, message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  }
  