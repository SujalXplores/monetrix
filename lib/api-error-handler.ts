import { logger } from '@/lib/logger';

export interface ApiErrorContext {
  status: number;
  statusText: string;
  url: string;
  body?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

export async function handleApiResponse(
  response: Response,
  context: string,
): Promise<ApiErrorResponse | null> {
  if (response.ok) {
    return null;
  }

  const errorText = await response
    .text()
    .catch(() => 'Unable to read error response');

  const errorContext: ApiErrorContext = {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    body: errorText,
  };

  logger.error(`API Error in ${context}`, errorContext);

  switch (response.status) {
    case 401:
      return {
        error: '🔑 Authentication failed',
        message:
          'Invalid or missing Financial Datasets API key. Please check your API key in settings.',
        status: 401,
      };
    case 402:
      return {
        error: '💳 Financial data API credits exhausted',
        message:
          'Your Financial Datasets API account has insufficient credits ($0.00 balance). Please add more credits to your account at https://financialdatasets.ai or update your API key in settings.',
        status: 402,
      };
    case 404:
      return {
        error: '🔍 Resource not found',
        message:
          'The requested financial data could not be found. Please check the ticker symbol or try again later.',
        status: 404,
      };
    case 429:
      return {
        error: '⏱️ Rate limit exceeded',
        message: 'Too many requests. Please wait a moment before trying again.',
        status: 429,
      };
    case 500:
      return {
        error: '🚫 Server error',
        message: 'Internal server error occurred. Please try again later.',
        status: 500,
      };
    default:
      return {
        error: `🚫 API error (${response.status})`,
        message: `An unexpected error occurred: ${response.statusText}. Please try again later.`,
        status: response.status,
      };
  }
}

export function createUnexpectedErrorResponse(
  error: unknown,
  tool: string,
): ApiErrorResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  logger.error(`Unexpected error in ${tool}`, { error: errorMessage });

  return {
    error: '🚫 Unexpected error occurred',
    message: `Failed to execute ${tool} due to an unexpected error: ${errorMessage}. Please try again later.`,
    status: 500,
  };
}
