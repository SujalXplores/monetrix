export interface StockPriceParams {
  ticker: string;
  start_date?: string;
  end_date?: string;
  interval?: 'second' | 'minute' | 'day' | 'week' | 'month' | 'year';
  interval_multiplier?: number;
}

export interface FinancialStatementParams {
  ticker: string;
  period?: 'annual' | 'quarterly' | 'ttm';
  limit?: number;
  report_period_lte?: string;
  report_period_gte?: string;
}

export interface StockFilterParams {
  filters: Record<string, any>;
  period?: 'annual' | 'quarterly' | 'ttm';
  limit?: number;
}

export interface NewsParams {
  query?: string;
  ticker?: string;
  limit?: number;
  start_date?: string;
  end_date?: string;
}
