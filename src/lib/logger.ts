/**
 * Conditional logging utility
 * Logs to console in development, suppresses in production
 */
export const logError = (context: string, error: any) => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
  // In production, you could send to error tracking service
  // e.g., Sentry, LogRocket, etc.
};

export const logInfo = (context: string, message: any) => {
  if (import.meta.env.DEV) {
    console.log(`[${context}]`, message);
  }
};
