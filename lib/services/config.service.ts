import { logger } from '@/lib/logger';

/**
 * Configuration Service
 * Manages application configuration and environment variables
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Load configuration from environment variables
   */
  private loadConfig(): AppConfig {
    const config: AppConfig = {
      // Environment
      nodeEnv: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',

      // API URLs
      financialApiBaseUrl:
        process.env.FINANCIAL_API_BASE_URL ||
        'https://api.financialdatasets.ai',

      // Pyodide
      pyodideVersion: process.env.PYODIDE_VERSION || 'v0.23.4',
      pyodideCdnBaseUrl:
        process.env.PYODIDE_CDN_BASE_URL || 'https://cdn.jsdelivr.net/pyodide',

      // Content limits
      contentVisibility: {
        textMinLength: Number(process.env.TEXT_MIN_LENGTH) || 400,
        textMaxLength: Number(process.env.TEXT_MAX_LENGTH) || 450,
        codeMinLength: Number(process.env.CODE_MIN_LENGTH) || 300,
        codeMaxLength: Number(process.env.CODE_MAX_LENGTH) || 310,
      },

      // Stream settings
      streamDelays: {
        finishDelayMs: Number(process.env.FINISH_DELAY_MS) || 1000,
      },

      // Cache settings
      cache: {
        maxSize: Number(process.env.CACHE_MAX_SIZE) || 1000,
        ttl: Number(process.env.CACHE_TTL) || 3600000, // 1 hour
      },

      // Rate limiting
      rateLimit: {
        maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      },
    };

    logger.info('Configuration loaded', {
      nodeEnv: config.nodeEnv,
      isDevelopment: config.isDevelopment,
      financialApiBaseUrl: `${config.financialApiBaseUrl.substring(0, 30)}...`,
    });

    return config;
  }

  /**
   * Get the full configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Get Pyodide full URL
   */
  getPyodideFullUrl(): string {
    return `${this.config.pyodideCdnBaseUrl}/${this.config.pyodideVersion}/full/`;
  }

  /**
   * Check if running in development mode
   */
  isDev(): boolean {
    return this.config.isDevelopment;
  }

  /**
   * Check if running in production mode
   */
  isProd(): boolean {
    return this.config.isProduction;
  }

  /**
   * Update configuration (mainly for testing)
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.debug('Configuration updated', updates);
  }
}

/**
 * Application Configuration Interface
 */
export interface AppConfig {
  // Environment
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;

  // API URLs
  financialApiBaseUrl: string;

  // Pyodide
  pyodideVersion: string;
  pyodideCdnBaseUrl: string;

  // Content limits
  contentVisibility: {
    textMinLength: number;
    textMaxLength: number;
    codeMinLength: number;
    codeMaxLength: number;
  };

  // Stream settings
  streamDelays: {
    finishDelayMs: number;
  };

  // Cache settings
  cache: {
    maxSize: number;
    ttl: number;
  };

  // Rate limiting
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

// Export singleton instance
export const configService = ConfigService.getInstance();
