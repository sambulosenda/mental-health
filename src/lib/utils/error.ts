/**
 * Extract error message from unknown error type
 */
export function formatErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

/**
 * Log error to console with context
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error);
}
