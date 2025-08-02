import { logger } from '@/lib/logger';
export interface StockSearchFilters {
  field: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  value: number | string;
}

/**
 * Financial Data Service
 * Handles all financial data API operations
 */
export class FinancialDataService {
  private baseUrl = 'https://api.financialdatasets.ai';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    params?: URLSearchParams,
  ): Promise<T> {
    const url = params
      ? `${this.baseUrl}${endpoint}?${params.toString()}`
      : `${this.baseUrl}${endpoint}`;

    logger.debug('Making financial API request', { url, endpoint });

    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Financial API request failed', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        error: errorText,
      });

      throw new FinancialApiError(
        response.status,
        response.statusText,
        errorText,
        endpoint,
      );
    }

    const data = await response.json();
    logger.debug('Financial API request successful', {
      endpoint,
      dataLength: JSON.stringify(data).length,
    });

    return data;
  }

  async getStockPrices(params: {
    ticker: string;
    start_date?: string;
    end_date?: string;
    interval?: 'second' | 'minute' | 'day' | 'week' | 'month' | 'year';
    interval_multiplier?: number;
  }) {
    const urlParams = new URLSearchParams({ ticker: params.ticker });

    if (params.start_date) urlParams.append('start_date', params.start_date);
    if (params.end_date) urlParams.append('end_date', params.end_date);
    if (params.interval) urlParams.append('interval', params.interval);
    if (params.interval_multiplier)
      urlParams.append(
        'interval_multiplier',
        params.interval_multiplier.toString(),
      );

    return this.makeRequest('/prices/snapshot', urlParams);
  }

  async getIncomeStatements(params: {
    ticker: string;
    period?: 'quarterly' | 'annual' | 'ttm';
    limit?: number;
    report_period_lte?: string;
    report_period_gte?: string;
  }) {
    const urlParams = new URLSearchParams({
      ticker: params.ticker,
      period: params.period ?? 'ttm',
    });

    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.report_period_lte)
      urlParams.append('report_period_lte', params.report_period_lte);
    if (params.report_period_gte)
      urlParams.append('report_period_gte', params.report_period_gte);

    return this.makeRequest('/financials/income-statements/', urlParams);
  }

  async getBalanceSheets(params: {
    ticker: string;
    period?: 'quarterly' | 'annual' | 'ttm';
    limit?: number;
    report_period_lte?: string;
    report_period_gte?: string;
  }) {
    const urlParams = new URLSearchParams({
      ticker: params.ticker,
      period: params.period ?? 'ttm',
    });

    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.report_period_lte)
      urlParams.append('report_period_lte', params.report_period_lte);
    if (params.report_period_gte)
      urlParams.append('report_period_gte', params.report_period_gte);

    return this.makeRequest('/financials/balance-sheets/', urlParams);
  }

  async getCashFlowStatements(params: {
    ticker: string;
    period?: 'quarterly' | 'annual' | 'ttm';
    limit?: number;
    report_period_lte?: string;
    report_period_gte?: string;
  }) {
    const urlParams = new URLSearchParams({
      ticker: params.ticker,
      period: params.period ?? 'ttm',
    });

    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.report_period_lte)
      urlParams.append('report_period_lte', params.report_period_lte);
    if (params.report_period_gte)
      urlParams.append('report_period_gte', params.report_period_gte);

    return this.makeRequest('/financials/cash-flow-statements/', urlParams);
  }

  async getFinancialMetrics(params: {
    ticker: string;
    period?: 'quarterly' | 'annual' | 'ttm';
    limit?: number;
    report_period_lte?: string;
    report_period_gte?: string;
  }) {
    const urlParams = new URLSearchParams({
      ticker: params.ticker,
      period: params.period ?? 'ttm',
    });

    if (params.limit) urlParams.append('limit', params.limit.toString());
    if (params.report_period_lte)
      urlParams.append('report_period_lte', params.report_period_lte);
    if (params.report_period_gte)
      urlParams.append('report_period_gte', params.report_period_gte);

    return this.makeRequest('/financial-metrics/', urlParams);
  }

  async getNews(params: { ticker: string; limit?: number }) {
    const urlParams = new URLSearchParams({
      ticker: params.ticker,
      limit: (params.limit ?? 5).toString(),
    });

    return this.makeRequest('/news/', urlParams);
  }

  async searchStocksByFilters(params: {
    filters: StockSearchFilters[];
    period?: 'quarterly' | 'annual' | 'ttm';
    limit?: number;
    order_by?: '-report_period' | 'report_period';
  }) {
    const body = {
      filters: params.filters,
      period: params.period ?? 'ttm',
      limit: params.limit ?? 5,
      order_by: params.order_by ?? '-report_period',
    };

    const response = await fetch(`${this.baseUrl}/stocks/search/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new FinancialApiError(
        response.status,
        response.statusText,
        errorText,
        'searchStocksByFilters',
      );
    }

    return response.json();
  }
}

/**
 * Custom error class for financial API errors
 */
export class FinancialApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseText: string,
    public endpoint: string,
  ) {
    super(`Financial API Error ${status}: ${statusText} at ${endpoint}`);
    this.name = 'FinancialApiError';
  }

  get isCreditsExhausted(): boolean {
    return this.status === 402;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get userFriendlyMessage(): string {
    if (this.isCreditsExhausted) {
      return '💳 Financial data API credits exhausted. Please add more credits at https://financialdatasets.ai or update your API key in settings.';
    }

    if (this.isUnauthorized) {
      return '🔑 Authentication failed. Invalid or missing Financial Datasets API key. Please check your API key in settings.';
    }

    return `🚫 API error (${this.status}): ${this.statusText}. Please try again later.`;
  }
}
