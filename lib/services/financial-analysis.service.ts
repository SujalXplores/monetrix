import { logger } from '@/lib/logger';
import type {
  BalanceSheet,
  CashFlowStatement,
  FinancialMetrics,
  IncomeStatement,
} from '@/lib/types/financial';

export function calculateFinancialRatios(
  incomeStatement: IncomeStatement,
  balanceSheet: BalanceSheet,
): FinancialRatios {
  const ratios: FinancialRatios = {
    ticker: incomeStatement.ticker,
    report_period: incomeStatement.report_period,

    // Profitability Ratios
    grossProfitMargin:
      safeDivide(incomeStatement.gross_profit, incomeStatement.revenue) * 100,
    operatingMargin:
      safeDivide(incomeStatement.operating_income, incomeStatement.revenue) *
      100,
    netProfitMargin:
      safeDivide(incomeStatement.net_income, incomeStatement.revenue) * 100,

    // Liquidity Ratios
    currentRatio: safeDivide(
      balanceSheet.current_assets,
      balanceSheet.current_liabilities,
    ),
    quickRatio: safeDivide(
      balanceSheet.current_assets - balanceSheet.inventory,
      balanceSheet.current_liabilities,
    ),

    // Leverage Ratios
    debtToEquity: safeDivide(
      balanceSheet.total_debt,
      balanceSheet.shareholders_equity,
    ),
    debtToAssets: safeDivide(
      balanceSheet.total_debt,
      balanceSheet.total_assets,
    ),

    // Efficiency Ratios
    assetTurnover: safeDivide(
      incomeStatement.revenue,
      balanceSheet.total_assets,
    ),
    returnOnAssets:
      safeDivide(incomeStatement.net_income, balanceSheet.total_assets) * 100,
    returnOnEquity:
      safeDivide(incomeStatement.net_income, balanceSheet.shareholders_equity) *
      100,
  };

  logger.debug('Calculated financial ratios', {
    ticker: ratios.ticker,
    period: ratios.report_period,
  });
  return ratios;
}

/**
 * Analyze financial health based on multiple metrics
 */
export function analyzeFinancialHealth(
  incomeStatement: IncomeStatement,
  balanceSheet: BalanceSheet,
  cashFlow: CashFlowStatement,
  metrics: FinancialMetrics,
): FinancialHealthAnalysis {
  const ratios = calculateFinancialRatios(incomeStatement, balanceSheet);

  const analysis: FinancialHealthAnalysis = {
    ticker: incomeStatement.ticker,
    report_period: incomeStatement.report_period,

    // Overall Score (0-100)
    overallScore: calculateOverallScore(ratios, cashFlow, metrics),

    // Category Scores
    profitabilityScore: calculateProfitabilityScore(ratios),
    liquidityScore: calculateLiquidityScore(ratios),
    leverageScore: calculateLeverageScore(ratios),
    efficiencyScore: calculateEfficiencyScore(ratios),

    // Key Insights
    strengths: identifyStrengths(ratios, cashFlow, metrics),
    weaknesses: identifyWeaknesses(ratios, cashFlow, metrics),

    // Recommendations
    recommendations: generateRecommendations(ratios, cashFlow, metrics),

    // Risk Assessment
    riskLevel: assessRiskLevel(ratios, cashFlow, metrics),
  };

  logger.info('Financial health analysis completed', {
    ticker: analysis.ticker,
    score: analysis.overallScore,
    riskLevel: analysis.riskLevel,
  });

  return analysis;
}

/**
 * Compare two companies financials
 */
export function compareCompanies(
  company1: CompanyFinancials,
  company2: CompanyFinancials,
): CompanyComparison {
  const ratios1 = calculateFinancialRatios(
    company1.incomeStatement,
    company1.balanceSheet,
  );
  const ratios2 = calculateFinancialRatios(
    company2.incomeStatement,
    company2.balanceSheet,
  );

  return {
    company1: company1.incomeStatement.ticker,
    company2: company2.incomeStatement.ticker,

    profitabilityComparison: {
      grossProfitMargin: compareMetric(
        ratios1.grossProfitMargin,
        ratios2.grossProfitMargin,
      ),
      operatingMargin: compareMetric(
        ratios1.operatingMargin,
        ratios2.operatingMargin,
      ),
      netProfitMargin: compareMetric(
        ratios1.netProfitMargin,
        ratios2.netProfitMargin,
      ),
    },

    liquidityComparison: {
      currentRatio: compareMetric(ratios1.currentRatio, ratios2.currentRatio),
      quickRatio: compareMetric(ratios1.quickRatio, ratios2.quickRatio),
    },

    leverageComparison: {
      debtToEquity: compareMetric(
        ratios1.debtToEquity,
        ratios2.debtToEquity,
        true,
      ), // Lower is better
      debtToAssets: compareMetric(
        ratios1.debtToAssets,
        ratios2.debtToAssets,
        true,
      ),
    },

    recommendation: getComparisonRecommendation(ratios1, ratios2),
  };
}

/**
 * Safe division to handle divide by zero
 */
function safeDivide(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Calculate overall financial health score
 */
function calculateOverallScore(
  ratios: FinancialRatios,
  cashFlow: CashFlowStatement,
  _metrics: FinancialMetrics,
): number {
  const profitability = calculateProfitabilityScore(ratios);
  const liquidity = calculateLiquidityScore(ratios);
  const leverage = calculateLeverageScore(ratios);
  const efficiency = calculateEfficiencyScore(ratios);
  const cashFlowScore = calculateCashFlowScore(cashFlow);

  return Math.round(
    (profitability + liquidity + leverage + efficiency + cashFlowScore) / 5,
  );
}

function calculateProfitabilityScore(ratios: FinancialRatios): number {
  let score = 0;

  // Gross Profit Margin
  if (ratios.grossProfitMargin > 40) score += 25;
  else if (ratios.grossProfitMargin > 20) score += 15;
  else if (ratios.grossProfitMargin > 0) score += 5;

  // Operating Margin
  if (ratios.operatingMargin > 20) score += 25;
  else if (ratios.operatingMargin > 10) score += 15;
  else if (ratios.operatingMargin > 0) score += 5;

  // Net Profit Margin
  if (ratios.netProfitMargin > 15) score += 25;
  else if (ratios.netProfitMargin > 5) score += 15;
  else if (ratios.netProfitMargin > 0) score += 5;

  // ROE
  if (ratios.returnOnEquity > 15) score += 25;
  else if (ratios.returnOnEquity > 10) score += 15;
  else if (ratios.returnOnEquity > 0) score += 5;

  return Math.min(score, 100);
}

function calculateLiquidityScore(ratios: FinancialRatios): number {
  let score = 0;

  // Current Ratio
  if (ratios.currentRatio >= 2) score += 50;
  else if (ratios.currentRatio >= 1.5) score += 35;
  else if (ratios.currentRatio >= 1) score += 20;

  // Quick Ratio
  if (ratios.quickRatio >= 1.5) score += 50;
  else if (ratios.quickRatio >= 1) score += 35;
  else if (ratios.quickRatio >= 0.5) score += 20;

  return Math.min(score, 100);
}

function calculateLeverageScore(ratios: FinancialRatios): number {
  let score = 100; // Start with perfect score and deduct

  // Debt to Equity (lower is better)
  if (ratios.debtToEquity > 2) score -= 40;
  else if (ratios.debtToEquity > 1) score -= 20;
  else if (ratios.debtToEquity > 0.5) score -= 10;

  // Debt to Assets (lower is better)
  if (ratios.debtToAssets > 0.6) score -= 40;
  else if (ratios.debtToAssets > 0.4) score -= 20;
  else if (ratios.debtToAssets > 0.2) score -= 10;

  return Math.max(score, 0);
}

function calculateEfficiencyScore(ratios: FinancialRatios): number {
  let score = 0;

  // Asset Turnover
  if (ratios.assetTurnover > 1.5) score += 50;
  else if (ratios.assetTurnover > 1) score += 35;
  else if (ratios.assetTurnover > 0.5) score += 20;

  // ROA
  if (ratios.returnOnAssets > 10) score += 50;
  else if (ratios.returnOnAssets > 5) score += 35;
  else if (ratios.returnOnAssets > 0) score += 20;

  return Math.min(score, 100);
}

function calculateCashFlowScore(cashFlow: CashFlowStatement): number {
  let score = 0;

  // Operating Cash Flow (positive is good)
  if (cashFlow.net_cash_flow_from_operations > 0) score += 40;

  // Cash Flow Growth (compare to previous if available)
  if (cashFlow.change_in_cash_and_equivalents > 0) score += 30;

  // Capital Expenditure efficiency
  if (
    cashFlow.capital_expenditure < 0 &&
    Math.abs(cashFlow.capital_expenditure) <
      cashFlow.net_cash_flow_from_operations
  ) {
    score += 30;
  }

  return Math.min(score, 100);
}

function identifyStrengths(
  ratios: FinancialRatios,
  cashFlow: CashFlowStatement,
  _metrics: FinancialMetrics,
): string[] {
  const strengths: string[] = [];

  if (ratios.grossProfitMargin > 40)
    strengths.push('High gross profit margin indicates strong pricing power');
  if (ratios.netProfitMargin > 15)
    strengths.push('Excellent net profit margin shows efficient operations');
  if (ratios.currentRatio >= 2)
    strengths.push('Strong liquidity position with high current ratio');
  if (ratios.debtToEquity < 0.5)
    strengths.push('Conservative debt levels reduce financial risk');
  if (cashFlow.net_cash_flow_from_operations > 0)
    strengths.push('Positive operating cash flow indicates healthy operations');
  if (ratios.returnOnEquity > 15)
    strengths.push(
      'High return on equity shows effective use of shareholder funds',
    );

  return strengths;
}

function identifyWeaknesses(
  ratios: FinancialRatios,
  cashFlow: CashFlowStatement,
  _metrics: FinancialMetrics,
): string[] {
  const weaknesses: string[] = [];

  if (ratios.grossProfitMargin < 20)
    weaknesses.push('Low gross profit margin may indicate pricing pressure');
  if (ratios.netProfitMargin < 5)
    weaknesses.push(
      'Low net profit margin suggests operational inefficiencies',
    );
  if (ratios.currentRatio < 1)
    weaknesses.push(
      'Current ratio below 1 indicates potential liquidity issues',
    );
  if (ratios.debtToEquity > 2)
    weaknesses.push('High debt-to-equity ratio increases financial risk');
  if (cashFlow.net_cash_flow_from_operations < 0)
    weaknesses.push('Negative operating cash flow is concerning');
  if (ratios.returnOnEquity < 5)
    weaknesses.push(
      'Low return on equity indicates poor shareholder value creation',
    );

  return weaknesses;
}

function generateRecommendations(
  ratios: FinancialRatios,
  cashFlow: CashFlowStatement,
  _metrics: FinancialMetrics,
): string[] {
  const recommendations: string[] = [];

  if (ratios.grossProfitMargin < 30) {
    recommendations.push(
      'Focus on improving pricing strategy or reducing cost of goods sold',
    );
  }
  if (ratios.currentRatio < 1.5) {
    recommendations.push('Consider improving working capital management');
  }
  if (ratios.debtToEquity > 1.5) {
    recommendations.push(
      'Consider reducing debt levels to improve financial stability',
    );
  }
  if (cashFlow.net_cash_flow_from_operations < ratios.netProfitMargin * 0.8) {
    recommendations.push(
      'Focus on converting earnings to cash flow more efficiently',
    );
  }

  return recommendations;
}

function assessRiskLevel(
  ratios: FinancialRatios,
  cashFlow: CashFlowStatement,
  _metrics: FinancialMetrics,
): 'Low' | 'Medium' | 'High' {
  let riskScore = 0;

  if (ratios.currentRatio < 1) riskScore += 2;
  if (ratios.debtToEquity > 2) riskScore += 3;
  if (ratios.netProfitMargin < 0) riskScore += 3;
  if (cashFlow.net_cash_flow_from_operations < 0) riskScore += 2;

  if (riskScore >= 5) return 'High';
  if (riskScore >= 2) return 'Medium';
  return 'Low';
}

function compareMetric(
  value1: number,
  value2: number,
  lowerIsBetter = false,
): MetricComparison {
  const difference = value1 - value2;
  const percentageDiff = ((value1 - value2) / value2) * 100;

  let winner: 'company1' | 'company2' | 'tie';

  if (Math.abs(difference) < 0.01) {
    winner = 'tie';
  } else if (lowerIsBetter) {
    winner = value1 < value2 ? 'company1' : 'company2';
  } else {
    winner = value1 > value2 ? 'company1' : 'company2';
  }

  return {
    company1Value: value1,
    company2Value: value2,
    difference,
    percentageDifference: percentageDiff,
    winner,
  };
}

function getComparisonRecommendation(
  ratios1: FinancialRatios,
  ratios2: FinancialRatios,
): string {
  const score1 =
    (ratios1.grossProfitMargin +
      ratios1.netProfitMargin +
      ratios1.returnOnEquity) /
    3;
  const score2 =
    (ratios2.grossProfitMargin +
      ratios2.netProfitMargin +
      ratios2.returnOnEquity) /
    3;

  if (score1 > score2 * 1.1) {
    return `${ratios1.ticker} shows stronger overall financial performance`;
  }

  if (score2 > score1 * 1.1) {
    return `${ratios2.ticker} shows stronger overall financial performance`;
  }

  return 'Both companies show comparable financial performance';
}

// Type definitions for the analysis service
export interface FinancialRatios {
  ticker: string;
  report_period: string;
  grossProfitMargin: number;
  operatingMargin: number;
  netProfitMargin: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  debtToAssets: number;
  assetTurnover: number;
  returnOnAssets: number;
  returnOnEquity: number;
}

export interface FinancialHealthAnalysis {
  ticker: string;
  report_period: string;
  overallScore: number;
  profitabilityScore: number;
  liquidityScore: number;
  leverageScore: number;
  efficiencyScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface CompanyFinancials {
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
  metrics: FinancialMetrics;
}

export interface CompanyComparison {
  company1: string;
  company2: string;
  profitabilityComparison: {
    grossProfitMargin: MetricComparison;
    operatingMargin: MetricComparison;
    netProfitMargin: MetricComparison;
  };
  liquidityComparison: {
    currentRatio: MetricComparison;
    quickRatio: MetricComparison;
  };
  leverageComparison: {
    debtToEquity: MetricComparison;
    debtToAssets: MetricComparison;
  };
  recommendation: string;
}

export interface MetricComparison {
  company1Value: number;
  company2Value: number;
  difference: number;
  percentageDifference: number;
  winner: 'company1' | 'company2' | 'tie';
}
