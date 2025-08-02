import { logger } from '@/lib/logger';
import type { FinancialApiError } from '@/lib/services/financial-data.service';

/**
 * Error Handler Service
 * Centralized error handling for the application
 */

/**
 * Handle Financial API errors
 */
export function handleFinancialApiError(
  error: FinancialApiError,
  context: string,
) {
  logger.error(`Financial API error in ${context}`, {
    status: error.status,
    statusText: error.statusText,
    endpoint: error.endpoint,
    responseText: error.responseText,
  });

  return {
    error: getErrorTitle(error),
    message: error.userFriendlyMessage,
    status: error.status,
    action_required: getActionRequired(error),
  };
}

/**
 * Handle generic API errors
 */
export function handleApiError(error: Error, context: string, status = 500) {
  logger.error(`API error in ${context}`, {
    error: error.message,
    stack: error.stack,
    status,
  });

  return {
    error: '🚫 Unexpected error occurred',
    message: `Failed to ${context}: ${error.message}. Please try again later.`,
    status,
  };
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: any, context: string) {
  logger.warn(`Validation error in ${context}`, {
    error: error.message || error,
  });

  return {
    error: '📋 Validation Error',
    message: `Invalid input for ${context}: ${error.message || 'Please check your input and try again.'}`,
    status: 400,
  };
}

/**
 * Handle rate limit errors
 */
export function handleRateLimitError(context: string) {
  logger.warn(`Rate limit exceeded in ${context}`);

  return {
    error: '⏰ Rate Limit Exceeded',
    message: 'Too many requests. Please wait a moment before trying again.',
    status: 429,
    action_required: 'Wait and retry',
  };
}

/**
 * Handle network errors
 */
export function handleNetworkError(context: string) {
  logger.error(`Network error in ${context}`);

  return {
    error: '🌐 Network Error',
    message:
      'Unable to connect to the service. Please check your internet connection and try again.',
    status: 503,
    action_required: 'Check connection',
  };
}

/**
 * Get error title based on error type
 */
function getErrorTitle(error: FinancialApiError): string {
  if (error.isCreditsExhausted) {
    return '💳 Financial data API credits exhausted';
  }

  if (error.isUnauthorized) {
    return '🔑 Authentication failed';
  }

  return `🚫 API error (${error.status})`;
}

/**
 * Get required action based on error type
 */
function getActionRequired(error: FinancialApiError): string {
  if (error.isCreditsExhausted) {
    return 'Add credits or update API key';
  }

  if (error.isUnauthorized) {
    return 'Update API key';
  }

  return 'Retry later';
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  title: string,
  message: string,
  status: number,
  actionRequired?: string,
) {
  return {
    error: title,
    message,
    status,
    ...(actionRequired && { action_required: actionRequired }),
  };
}

/**
 * Log and return a safe error for the user
 */
export function safeError(
  error: unknown,
  context: string,
  fallbackMessage?: string,
) {
  // Log the full error for debugging
  logger.error(`Error in ${context}`, {
    error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // Return a safe, user-friendly error
  return createErrorResponse(
    '🚫 Something went wrong',
    fallbackMessage ||
      `An error occurred while ${context}. Please try again later.`,
    500,
  );
}
