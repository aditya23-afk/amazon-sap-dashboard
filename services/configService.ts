/**
 * Configuration service for managing application settings
 */
class ConfigService {
  // API Configuration
  get apiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  get useMockData(): boolean {
    return import.meta.env.VITE_USE_MOCK_DATA !== 'false';
  }

  get simulateDelays(): boolean {
    return import.meta.env.VITE_SIMULATE_DELAYS !== 'false';
  }

  get errorSimulationRate(): number {
    return parseFloat(import.meta.env.VITE_ERROR_RATE || '0.1');
  }

  // Development Settings
  get debugMode(): boolean {
    return import.meta.env.VITE_DEBUG_MODE === 'true';
  }

  get logLevel(): 'debug' | 'info' | 'warn' | 'error' {
    const level = import.meta.env.VITE_LOG_LEVEL || 'info';
    if (['debug', 'info', 'warn', 'error'].includes(level)) {
      return level as 'debug' | 'info' | 'warn' | 'error';
    }
    return 'info';
  }

  // Mock Data Settings
  get mockDelayMin(): number {
    return parseInt(import.meta.env.VITE_MOCK_DELAY_MIN || '200');
  }

  get mockDelayMax(): number {
    return parseInt(import.meta.env.VITE_MOCK_DELAY_MAX || '1500');
  }

  get mockDataRefreshInterval(): number {
    return parseInt(import.meta.env.VITE_MOCK_DATA_REFRESH_INTERVAL || '300000'); // 5 minutes
  }

  // Feature Flags
  get enableRealTimeUpdates(): boolean {
    return import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES !== 'false';
  }

  get enableExportFeatures(): boolean {
    return import.meta.env.VITE_ENABLE_EXPORT_FEATURES !== 'false';
  }

  get enableAdvancedFilters(): boolean {
    return import.meta.env.VITE_ENABLE_ADVANCED_FILTERS !== 'false';
  }

  // Environment Detection
  get isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  get isProduction(): boolean {
    return import.meta.env.PROD;
  }

  // Logging utility
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...args);
        break;
      case 'info':
        console.info(prefix, message, ...args);
        break;
      case 'warn':
        console.warn(prefix, message, ...args);
        break;
      case 'error':
        console.error(prefix, message, ...args);
        break;
    }
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  // Configuration validation
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate API URL
    try {
      new URL(this.apiBaseUrl);
    } catch {
      errors.push('Invalid API base URL');
    }

    // Validate error rate
    if (this.errorSimulationRate < 0 || this.errorSimulationRate > 1) {
      errors.push('Error simulation rate must be between 0 and 1');
    }

    // Validate delay settings
    if (this.mockDelayMin < 0 || this.mockDelayMax < this.mockDelayMin) {
      errors.push('Invalid mock delay configuration');
    }

    // Validate refresh interval
    if (this.mockDataRefreshInterval < 1000) {
      errors.push('Mock data refresh interval must be at least 1000ms');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get all configuration as object
  getAllConfig(): Record<string, any> {
    return {
      api: {
        baseUrl: this.apiBaseUrl,
        useMockData: this.useMockData,
        simulateDelays: this.simulateDelays,
        errorSimulationRate: this.errorSimulationRate
      },
      development: {
        debugMode: this.debugMode,
        logLevel: this.logLevel,
        isDevelopment: this.isDevelopment,
        isProduction: this.isProduction
      },
      mockData: {
        delayMin: this.mockDelayMin,
        delayMax: this.mockDelayMax,
        refreshInterval: this.mockDataRefreshInterval
      },
      features: {
        realTimeUpdates: this.enableRealTimeUpdates,
        exportFeatures: this.enableExportFeatures,
        advancedFilters: this.enableAdvancedFilters
      }
    };
  }
}

export const configService = new ConfigService();
export default configService;