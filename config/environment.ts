/**
 * Environment configuration service
 * Provides type-safe access to environment variables
 */

export interface EnvironmentConfig {
  // App Info
  appName: string;
  appVersion: string;
  nodeEnv: string;
  
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;
  enableMockData: boolean;
  
  // Feature Flags
  enableRealTime: boolean;
  enableExport: boolean;
  enableAlerts: boolean;
  enableCustomization: boolean;
  enableAccessibility: boolean;
  
  // Performance Settings
  refreshInterval: number;
  cacheDuration: number;
  enablePerformanceMonitoring: boolean;
  
  // Debug Settings
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableReduxDevtools: boolean;
  
  // Analytics
  enableAnalytics: boolean;
  analyticsId?: string;
  
  // Security
  enableCSP: boolean;
  secureCookies: boolean;
}

/**
 * Parse environment variable as boolean
 */
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value || value === 'undefined') return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Parse environment variable as number
 */
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value || value === 'undefined') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse environment variable as string with fallback
 */
const parseString = (value: string | undefined, defaultValue: string): string => {
  if (!value || value === 'undefined') return defaultValue;
  return value;
};

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    // App Info
    appName: parseString(import.meta.env.VITE_APP_NAME, 'Amazon SAP Dashboard'),
    appVersion: parseString(import.meta.env.VITE_APP_VERSION, '1.0.0'),
    nodeEnv: parseString(import.meta.env.VITE_NODE_ENV || (import.meta.env.DEV ? 'development' : 'production'), 'development'),
    
    // API Configuration
    apiBaseUrl: parseString(import.meta.env.VITE_API_BASE_URL, 'http://localhost:3001/api'),
    apiTimeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 10000),
    enableMockData: parseBoolean(import.meta.env.VITE_ENABLE_MOCK_DATA || import.meta.env.VITE_USE_MOCK_DATA, true),
    
    // Feature Flags
    enableRealTime: parseBoolean(import.meta.env.VITE_ENABLE_REAL_TIME || import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES, true),
    enableExport: parseBoolean(import.meta.env.VITE_ENABLE_EXPORT || import.meta.env.VITE_ENABLE_EXPORT_FEATURES, true),
    enableAlerts: parseBoolean(import.meta.env.VITE_ENABLE_ALERTS, true),
    enableCustomization: parseBoolean(import.meta.env.VITE_ENABLE_CUSTOMIZATION, true),
    enableAccessibility: parseBoolean(import.meta.env.VITE_ENABLE_ACCESSIBILITY, true),
    
    // Performance Settings
    refreshInterval: parseNumber(import.meta.env.VITE_REFRESH_INTERVAL || import.meta.env.VITE_MOCK_DATA_REFRESH_INTERVAL, 300000), // 5 minutes
    cacheDuration: parseNumber(import.meta.env.VITE_CACHE_DURATION, 600000), // 10 minutes
    enablePerformanceMonitoring: parseBoolean(import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING, true),
    
    // Debug Settings
    debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, import.meta.env.DEV || false),
    logLevel: (parseString(import.meta.env.VITE_LOG_LEVEL, 'info') as 'debug' | 'info' | 'warn' | 'error'),
    enableReduxDevtools: parseBoolean(import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS, import.meta.env.DEV || false),
    
    // Analytics
    enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, false),
    analyticsId: parseString(import.meta.env.VITE_ANALYTICS_ID, ''),
    
    // Security
    enableCSP: parseBoolean(import.meta.env.VITE_ENABLE_CSP, import.meta.env.PROD || false),
    secureCookies: parseBoolean(import.meta.env.VITE_SECURE_COOKIES, import.meta.env.PROD || false),
  };
};

/**
 * Environment configuration instance
 */
export const env = getEnvironmentConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = () => env.nodeEnv === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = () => env.nodeEnv === 'production';

/**
 * Check if running in staging mode
 */
export const isStaging = () => env.nodeEnv === 'staging';

/**
 * Get API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${env.apiBaseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

/**
 * Log configuration (respects log level)
 */
export const logger = {
  debug: (...args: any[]) => {
    if (env.debugMode && ['debug'].includes(env.logLevel)) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(env.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(env.logLevel)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

export default env;