import { z } from 'zod';

export type FinancialPeriod = 'quarterly' | 'annual' | 'ttm';

export interface BaseFinancialParams {
  ticker: string;
  period?: FinancialPeriod;
  limit?: number;
  report_period_lte?: string;
  report_period_gte?: string;
}

export interface FinancialToolsConfig {
  financialDatasetsApiKey: string;
  dataStream: any;
}

export const createBaseFinancialSchema = (entityType: string) =>
  z.object({
    ticker: z
      .string()
      .describe(`The ticker of the company to get ${entityType} for`),
    period: z
      .enum(['quarterly', 'annual', 'ttm'])
      .default('ttm')
      .describe(`The period of the ${entityType} to return`),
    limit: z
      .number()
      .optional()
      .default(1)
      .describe(`The number of ${entityType} to return`),
    report_period_lte: z
      .string()
      .optional()
      .describe(
        `The less than or equal to date of the ${entityType} to return. This lets us bound the data by date.`,
      ),
    report_period_gte: z
      .string()
      .optional()
      .describe(
        `The greater than or equal to date of the ${entityType} to return. This lets us bound the data by date.`,
      ),
  });

export class BaseFinancialService {
  protected toolCallCache = new Set<string>();
  protected config: FinancialToolsConfig;

  constructor(config: FinancialToolsConfig) {
    this.config = config;
  }

  protected shouldExecuteToolCall(toolName: string, params: any): boolean {
    const key = JSON.stringify({ toolName, params });
    if (this.toolCallCache.has(key)) {
      return false;
    }
    this.toolCallCache.add(key);
    return true;
  }

  protected buildURLParams(params: BaseFinancialParams): URLSearchParams {
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
  }

  protected async makeFinancialApiCall(
    endpoint: string,
    params: BaseFinancialParams,
    context: string,
  ): Promise<any> {
    const urlParams = this.buildURLParams(params);

    try {
      const response = await fetch(
        `https://api.financialdatasets.ai${endpoint}?${urlParams}`,
        {
          headers: {
            'X-API-Key': this.config.financialDatasetsApiKey,
          },
        },
      );

      if (!response.ok) {
        return this.handleApiError(response, context);
      }

      return await response.json();
    } catch (error) {
      return {
        error: '🚫 Unexpected error occurred',
        message: `Failed to ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 500,
      };
    }
  }

  protected handleApiError(response: Response, context: string) {
    if (response.status === 402) {
      return {
        error: '💳 Financial data API credits exhausted',
        message:
          'Your Financial Datasets API account has insufficient credits ($0.00 balance). To continue:\n\n1. Visit https://financialdatasets.ai\n2. Add more credits to your account\n3. Or update your API key in settings if you have another account',
        status: 402,
        action_required: 'Add credits or update API key',
      };
    }
    if (response.status === 401) {
      return {
        error: '🔑 Authentication failed',
        message:
          'Invalid or missing Financial Datasets API key. Please check your API key in settings.',
        status: 401,
        action_required: 'Update API key',
      };
    }
    return {
      error: `🚫 API error (${response.status})`,
      message: `Failed to ${context}: ${response.statusText}. Please try again later.`,
      status: response.status,
    };
  }

  protected createFinancialDataTool(
    toolName: string,
    endpoint: string,
    description: string,
    entityType: string,
  ) {
    return {
      description,
      parameters: createBaseFinancialSchema(entityType),
      execute: async (params: BaseFinancialParams) => {
        if (!this.shouldExecuteToolCall(toolName, params)) {
          console.log(`Skipping duplicate ${toolName} call:`, params);
          return null;
        }

        return this.makeFinancialApiCall(
          endpoint,
          params,
          `fetch ${entityType} for ${params.ticker}`,
        );
      },
    };
  }
}
