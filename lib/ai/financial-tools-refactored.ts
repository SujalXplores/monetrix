import { z } from 'zod';
import { validStockSearchFilters } from '@/lib/api/stock-filters';
import { logger } from '@/lib/logger';
import { DataStreamService } from '@/lib/services/data-stream.service';
import {
  handleFinancialApiError,
  safeError,
} from '@/lib/services/error-handler.service';
import {
  FinancialApiError,
  FinancialDataService,
} from '@/lib/services/financial-data.service';
import { ToolCacheService } from '@/lib/services/tool-cache.service';

export const financialTools = [
  'getStockPrices',
  'getIncomeStatements',
  'getBalanceSheets',
  'getCashFlowStatements',
  'getFinancialMetrics',
  'searchStocksByFilters',
  'getNews',
] as const;

export type AllowedTools = (typeof financialTools)[number];

export interface FinancialToolsConfig {
  financialDatasetsApiKey: string;
  dataStream: any;
}

/**
 * Refactored Financial Tools Manager
 * Uses modular services for better separation of concerns
 */
export class FinancialToolsManager {
  private financialDataService: FinancialDataService;
  private toolCacheService: ToolCacheService;
  private dataStreamService: DataStreamService;

  constructor(config: FinancialToolsConfig) {
    this.financialDataService = new FinancialDataService(
      config.financialDatasetsApiKey,
    );
    this.toolCacheService = new ToolCacheService();
    this.dataStreamService = new DataStreamService(config.dataStream);
  }

  /**
   * Get all available financial tools with their configurations
   */
  public getTools() {
    return {
      getNews: {
        description:
          'Use this tool to get news and latest events for a company. This tool will return a list of news articles and events for a company. When using this tool, include dates in your output.',
        parameters: z.object({
          ticker: z
            .string()
            .describe('The ticker of the company to get news for'),
          limit: z
            .number()
            .optional()
            .default(5)
            .describe('The number of news articles to return'),
        }),
        execute: async (params: { ticker: string; limit?: number }) => {
          return this.executeWithErrorHandling('getNews', params, () =>
            this.financialDataService.getNews(params),
          );
        },
      },

      getStockPrices: {
        description:
          'Get stock prices for a company. You can get current snapshot prices or historical prices over a date range.',
        parameters: z.object({
          ticker: z
            .string()
            .describe('The ticker of the company to get stock prices for'),
          start_date: z
            .string()
            .optional()
            .describe('The start date for historical prices (YYYY-MM-DD)')
            .default(() => {
              const date = new Date();
              date.setMonth(date.getMonth() - 1);
              return date.toISOString().split('T')[0];
            }),
          end_date: z
            .string()
            .optional()
            .describe('The end date for historical prices (YYYY-MM-DD)')
            .default(() => {
              return new Date().toISOString().split('T')[0];
            }),
          interval: z
            .enum(['second', 'minute', 'day', 'week', 'month', 'year'])
            .default('day')
            .describe('The interval between price points'),
          interval_multiplier: z
            .number()
            .default(1)
            .describe('The multiplier for the interval'),
        }),
        execute: async (params: {
          ticker: string;
          start_date?: string;
          end_date?: string;
          interval?: 'second' | 'minute' | 'day' | 'week' | 'month' | 'year';
          interval_multiplier?: number;
        }) => {
          return this.executeWithErrorHandling('getStockPrices', params, () =>
            this.financialDataService.getStockPrices(params),
          );
        },
      },

      getIncomeStatements: {
        description: 'Get the income statements of a company',
        parameters: z.object({
          ticker: z
            .string()
            .describe('The ticker of the company to get income statements for'),
          period: z
            .enum(['quarterly', 'annual', 'ttm'])
            .default('ttm')
            .describe('The period of the income statements to return'),
          limit: z
            .number()
            .optional()
            .default(1)
            .describe('The number of income statements to return'),
          report_period_lte: z
            .string()
            .optional()
            .describe(
              'The less than or equal to date of the income statements to return',
            ),
          report_period_gte: z
            .string()
            .optional()
            .describe(
              'The greater than or equal to date of the income statements to return',
            ),
        }),
        execute: async (params: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
          report_period_lte?: string;
          report_period_gte?: string;
        }) => {
          return this.executeWithErrorHandling(
            'getIncomeStatements',
            params,
            () => this.financialDataService.getIncomeStatements(params),
          );
        },
      },

      getBalanceSheets: {
        description: 'Get the balance sheets of a company',
        parameters: z.object({
          ticker: z
            .string()
            .describe('The ticker of the company to get balance sheets for'),
          period: z
            .enum(['quarterly', 'annual', 'ttm'])
            .default('ttm')
            .describe('The period of the balance sheets to return'),
          limit: z
            .number()
            .optional()
            .default(1)
            .describe('The number of balance sheets to return'),
          report_period_lte: z
            .string()
            .optional()
            .describe(
              'The less than or equal to date of the balance sheets to return',
            ),
          report_period_gte: z
            .string()
            .optional()
            .describe(
              'The greater than or equal to date of the balance sheets to return',
            ),
        }),
        execute: async (params: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
          report_period_lte?: string;
          report_period_gte?: string;
        }) => {
          return this.executeWithErrorHandling('getBalanceSheets', params, () =>
            this.financialDataService.getBalanceSheets(params),
          );
        },
      },

      getCashFlowStatements: {
        description: 'Get the cash flow statements of a company',
        parameters: z.object({
          ticker: z
            .string()
            .describe(
              'The ticker of the company to get cash flow statements for',
            ),
          period: z
            .enum(['quarterly', 'annual', 'ttm'])
            .default('ttm')
            .describe('The period of the cash flow statements to return'),
          limit: z
            .number()
            .optional()
            .default(1)
            .describe('The number of cash flow statements to return'),
          report_period_lte: z
            .string()
            .optional()
            .describe(
              'The less than or equal to date of the cash flow statements to return',
            ),
          report_period_gte: z
            .string()
            .optional()
            .describe(
              'The greater than or equal to date of the cash flow statements to return',
            ),
        }),
        execute: async (params: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
          report_period_lte?: string;
          report_period_gte?: string;
        }) => {
          return this.executeWithErrorHandling(
            'getCashFlowStatements',
            params,
            () => this.financialDataService.getCashFlowStatements(params),
          );
        },
      },

      getFinancialMetrics: {
        description:
          'Get the financial metrics of a company. These financial metrics are derived metrics like P/E ratio, operating income, etc. that cannot be found in the income statement, balance sheet, or cash flow statement.',
        parameters: z.object({
          ticker: z
            .string()
            .describe('The ticker of the company to get financial metrics for'),
          period: z
            .enum(['quarterly', 'annual', 'ttm'])
            .default('ttm')
            .describe('The period of the financial metrics to return'),
          limit: z
            .number()
            .optional()
            .default(1)
            .describe('The number of financial metrics to return'),
          report_period_lte: z
            .string()
            .optional()
            .describe(
              'The less than or equal to date of the financial metrics to return',
            ),
          report_period_gte: z
            .string()
            .optional()
            .describe(
              'The greater than or equal to date of the financial metrics to return',
            ),
        }),
        execute: async (params: {
          ticker: string;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
          report_period_lte?: string;
          report_period_gte?: string;
        }) => {
          return this.executeWithErrorHandling(
            'getFinancialMetrics',
            params,
            () => this.financialDataService.getFinancialMetrics(params),
          );
        },
      },

      searchStocksByFilters: {
        description:
          'Search for stocks based on financial criteria filters. You can filter stocks by various financial metrics like revenue, net income, market cap, etc.',
        parameters: z.object({
          filters: z
            .array(
              z.object({
                field: z.enum(validStockSearchFilters as [string, ...string[]]),
                operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']),
                value: z.number(),
              }),
            )
            .describe('The filters to search for'),
          period: z
            .enum(['quarterly', 'annual', 'ttm'])
            .optional()
            .describe('The period of the financial metrics to return'),
          limit: z
            .number()
            .optional()
            .default(5)
            .describe('The number of stocks to return'),
          order_by: z
            .enum(['-report_period', 'report_period'])
            .optional()
            .default('-report_period')
            .describe('The order of the stocks to return'),
        }),
        execute: async (params: {
          filters: Array<{
            field: string;
            operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
            value: number;
          }>;
          period?: 'quarterly' | 'annual' | 'ttm';
          limit?: number;
          order_by?: '-report_period' | 'report_period';
        }) => {
          return this.executeWithErrorHandling(
            'searchStocksByFilters',
            params,
            () => this.financialDataService.searchStocksByFilters(params),
          );
        },
      },
    };
  }

  /**
   * Execute a tool with error handling and caching
   */
  private async executeWithErrorHandling<T>(
    toolName: string,
    params: any,
    executeFn: () => Promise<T>,
  ): Promise<T | null> {
    // Check cache first
    if (!this.toolCacheService.shouldExecute(toolName, params)) {
      logger.debug(`Skipping duplicate ${toolName} call`, params);
      return null;
    }

    // Set loading state
    this.dataStreamService.setToolLoading(toolName, true);

    try {
      const result = await executeFn();

      // Reset loading state
      this.dataStreamService.setToolLoading(toolName, false);

      logger.debug(`${toolName} executed successfully`, {
        paramsLength: JSON.stringify(params).length,
      });
      return result;
    } catch (error) {
      // Reset loading state
      this.dataStreamService.setToolLoading(toolName, false);

      if (error instanceof FinancialApiError) {
        return handleFinancialApiError(error, toolName) as any;
      }

      return safeError(error, toolName) as any;
    }
  }

  /**
   * Clear the tool cache
   */
  public clearCache(): void {
    this.toolCacheService.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return {
      size: this.toolCacheService.size,
    };
  }
}
