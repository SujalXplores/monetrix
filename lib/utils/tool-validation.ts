import { z } from 'zod';

export const TickerSchema = z
  .string()
  .min(1)
  .max(10)
  .describe('The ticker symbol of the company');

export const LimitSchema = z
  .number()
  .min(1)
  .max(100)
  .optional()
  .describe('The maximum number of items to return');

export const DateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .describe('Date in YYYY-MM-DD format');

export const PeriodSchema = z
  .enum(['quarterly', 'annual', 'ttm'])
  .default('ttm')
  .describe('The reporting period');

// Common parameter builders
export const createFinancialParamsSchema = (entityName: string) =>
  z.object({
    ticker: TickerSchema.describe(
      `The ticker of the company to get ${entityName} for`,
    ),
    period: PeriodSchema.describe(`The period of the ${entityName} to return`),
    limit: LimitSchema.default(1).describe(
      `The number of ${entityName} to return`,
    ),
    report_period_lte: DateSchema.describe(
      `The less than or equal to date of the ${entityName} to return. This lets us bound the data by date.`,
    ),
    report_period_gte: DateSchema.describe(
      `The greater than or equal to date of the ${entityName} to return. This lets us bound the data by date.`,
    ),
  });

export const createNewsParamsSchema = () =>
  z.object({
    ticker: TickerSchema.describe('The ticker of the company to get news for'),
    limit: LimitSchema.default(5).describe(
      'The number of news articles to return',
    ),
  });

// URL parameter utilities
export const buildFinancialParams = (params: {
  ticker: string;
  period?: string;
  limit?: number;
  report_period_lte?: string;
  report_period_gte?: string;
}): URLSearchParams => {
  const urlParams = new URLSearchParams({
    ticker: params.ticker,
    period: params.period ?? 'ttm',
  });

  if (params.limit) urlParams.append('limit', params.limit.toString());
  if (params.report_period_lte)
    urlParams.append('report_period_lte', params.report_period_lte);
  if (params.report_period_gte)
    urlParams.append('report_period_gte', params.report_period_gte);

  return urlParams;
};

// Common headers
export const createApiHeaders = (apiKey: string) => ({
  'X-API-Key': apiKey,
  'Content-Type': 'application/json',
});

// Tool execution utilities
export const createToolExecutor = <
  T extends {
    ticker: string;
    period?: string;
    limit?: number;
    report_period_lte?: string;
    report_period_gte?: string;
  },
>(
  toolName: string,
  endpoint: string,
  apiKey: string,
  shouldExecuteToolCall: (name: string, params: any) => boolean,
  handleApiError: (response: Response, context: string) => any,
) => {
  return async (params: T) => {
    if (!shouldExecuteToolCall(toolName, params)) {
      console.log(`Skipping duplicate ${toolName} call:`, params);
      return null;
    }

    try {
      const urlParams = buildFinancialParams(params);
      const response = await fetch(
        `https://api.financialdatasets.ai${endpoint}?${urlParams}`,
        {
          headers: createApiHeaders(apiKey),
        },
      );

      if (!response.ok) {
        return handleApiError(
          response,
          `fetch ${toolName.replace('get', '').toLowerCase()}`,
        );
      }

      return await response.json();
    } catch (error) {
      return {
        error: '🚫 Unexpected error occurred',
        message: `Failed to ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500,
      };
    }
  };
};
