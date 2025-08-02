import { logger } from '@/lib/logger';

export interface ApiErrorContext {
  status: number;
  statusText: string;
  body?: string;
  url?: string;
}

export function logApiError(context: string, errorContext: ApiErrorContext) {
  logger.error(`API Error in ${context}`, errorContext);
}

export function isApiKeyError(status: number, body?: string): boolean {
  if (status === 401) return true;
  if (status === 403) return true;
  if (body?.toLowerCase().includes('api key')) return true;
  if (body?.toLowerCase().includes('unauthorized')) return true;
  if (body?.toLowerCase().includes('forbidden')) return true;

  return false;
}

export function isPaymentError(status: number, body?: string): boolean {
  if (status === 402) return true;
  if (body?.toLowerCase().includes('payment')) return true;
  if (body?.toLowerCase().includes('billing')) return true;
  if (body?.toLowerCase().includes('quota')) return true;
  if (body?.toLowerCase().includes('credits')) return true;

  return false;
}

export function createStandardErrorResponse(
  context: string,
  status: number,
  message?: string,
) {
  return {
    error: `🚫 ${context} failed`,
    message: message || 'An unexpected error occurred',
    status,
  };
}
