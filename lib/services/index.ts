/**
 * Services Index
 * Central export point for all services
 */

export type { AppConfig } from './config.service';
export { ConfigService, configService } from './config.service';
export { DataStreamService } from './data-stream.service';
// Error Handling
export {
  createErrorResponse,
  handleApiError,
  handleFinancialApiError,
  handleNetworkError,
  handleRateLimitError,
  handleValidationError,
  safeError,
} from './error-handler.service';
export type {
  CompanyComparison,
  CompanyFinancials,
  FinancialHealthAnalysis,
  FinancialRatios,
  MetricComparison,
} from './financial-analysis.service';
// Business Logic Services
export {
  analyzeFinancialHealth,
  calculateFinancialRatios,
  compareCompanies,
} from './financial-analysis.service';
// Data Services
export {
  FinancialApiError,
  FinancialDataService,
} from './financial-data.service';
// Utility Services
export { ToolCacheService } from './tool-cache.service';
