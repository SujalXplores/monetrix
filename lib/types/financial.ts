/**
 * Financial Data Types
 * Shared types for financial operations
 */

export interface FinancialApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

export interface StockSearchFilters {
  field: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  value: number;
}

export interface StockPrice {
  ticker: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
}

export interface IncomeStatement {
  ticker: string;
  report_period: string;
  revenue: number;
  cost_of_revenue: number;
  gross_profit: number;
  operating_expense: number;
  operating_income: number;
  net_income: number;
  earnings_per_share: number;
  earnings_per_share_diluted: number;
  weighted_average_shares: number;
}

export interface BalanceSheet {
  ticker: string;
  report_period: string;
  total_assets: number;
  total_liabilities: number;
  shareholders_equity: number;
  current_assets: number;
  current_liabilities: number;
  cash_and_equivalents: number;
  inventory: number;
  total_debt: number;
}

export interface CashFlowStatement {
  ticker: string;
  report_period: string;
  net_cash_flow_from_operations: number;
  net_cash_flow_from_investing: number;
  net_cash_flow_from_financing: number;
  change_in_cash_and_equivalents: number;
  capital_expenditure: number;
  depreciation_and_amortization: number;
}

export interface FinancialMetrics {
  ticker: string;
  report_period: string;
  market_cap: number;
  enterprise_value: number;
  price_to_earnings_ratio: number;
  price_to_book_ratio: number;
  price_to_sales_ratio: number;
  debt_to_equity_ratio: number;
  return_on_equity: number;
  return_on_assets: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  published_at: string;
  source: string;
  tickers: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface StockScreenerResult {
  ticker: string;
  company_name: string;
  sector: string;
  industry: string;
  market_cap: number;
  filters_matched: string[];
}

export type FinancialPeriod = 'quarterly' | 'annual' | 'ttm';
export type PriceInterval =
  | 'second'
  | 'minute'
  | 'day'
  | 'week'
  | 'month'
  | 'year';
