import { NextResponse } from 'next/server';

/**
 * Sanitizes internal technical errors (e.g., DB driver messages, stack traces, hostnames)
 * so sensitive server details are never exposed to the client.
 */
export function sanitizeErrorMessage(error: any, fallbackMessage: string = 'An unexpected error occurred'): string {
  if (!error) return fallbackMessage;
  const msg = typeof error === 'string' ? error : error.message || '';

  // Check for internal database connection, driver, or system errors
  if (
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENOTFOUND') ||
    msg.includes('tenant/user') ||
    msg.includes('connection') ||
    msg.includes('PostgresError') ||
    msg.includes('127.0.0.1') ||
    msg.includes('password') ||
    msg.includes('connect')
  ) {
    return 'Database service temporarily unavailable. Please verify your environment configuration.';
  }

  return msg || fallbackMessage;
}

/**
 * Standardized helper for building sanitized error responses in Next.js API routes.
 */
export function handleApiError(
  context: string,
  error: any,
  status: number = 500,
  extraHeaders: Record<string, string> = {}
) {
  console.error(`[API Error - ${context}]:`, error);
  const userFriendlyMessage = sanitizeErrorMessage(error);

  return NextResponse.json(
    {
      success: false,
      error: userFriendlyMessage,
    },
    {
      status,
      headers: extraHeaders,
    }
  );
}
