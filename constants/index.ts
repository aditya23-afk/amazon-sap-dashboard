import { TimePeriod, ChartType, WidgetType, AlertLevel, TrendDirection } from '../types';

// Default values for data models
export const DEFAULT_CURRENCY = 'USD';
export const DEFAULT_REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds
export const DEFAULT_CHART_HEIGHT = 400;
export const DEFAULT_CHART_WIDTH = 600;

// Date range presets
export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_QUARTER: 'thisQuarter',
  LAST_QUARTER: 'lastQuarter',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
  CUSTOM: 'custom'
} as const;

// Widget configuration defaults
export const DEFAULT_WIDGET_CONFIG = {
  refreshInterval: DEFAULT_REFRESH_INTERVAL,
  height: 300,
  width: 400,
  minHeight: 200,
  minWidth: 300,
  maxHeight: 800,
  maxWidth: 1200
};

// Chart color palettes
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1',
  PALETTE: [
    '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', '#d32f2f',
    '#0288d1', '#7b1fa2', '#388e3c', '#f57c00', '#c62828'
  ]
};

// Alert thresholds
export const ALERT_THRESHOLDS = {
  INVENTORY_LOW_STOCK: 10,
  INVENTORY_OUT_OF_STOCK: 0,
  CUSTOMER_SATISFACTION_LOW: 70,
  CUSTOMER_SATISFACTION_CRITICAL: 50,
  REVENUE_VARIANCE_WARNING: 10, // percentage
  REVENUE_VARIANCE_CRITICAL: 20, // percentage
  SUPPORT_TICKET_HIGH: 100,
  SUPPORT_TICKET_CRITICAL: 200
};

// Time period configurations
export const TIME_PERIOD_CONFIG = {
  [TimePeriod.DAILY]: {
    label: 'Daily',
    format: 'MMM dd',
    interval: 1,
    unit: 'day'
  },
  [TimePeriod.WEEKLY]: {
    label: 'Weekly',
    format: 'MMM dd',
    interval: 7,
    unit: 'day'
  },
  [TimePeriod.MONTHLY]: {
    label: 'Monthly',
    format: 'MMM yyyy',
    interval: 1,
    unit: 'month'
  },
  [TimePeriod.QUARTERLY]: {
    label: 'Quarterly',
    format: 'Qo yyyy',
    interval: 3,
    unit: 'month'
  },
  [TimePeriod.YEARLY]: {
    label: 'Yearly',
    format: 'yyyy',
    interval: 1,
    unit: 'year'
  }
};

// Chart type configurations
export const CHART_TYPE_CONFIG = {
  [ChartType.LINE]: {
    label: 'Line Chart',
    icon: 'timeline',
    supportsMultipleDatasets: true,
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  },
  [ChartType.BAR]: {
    label: 'Bar Chart',
    icon: 'bar_chart',
    supportsMultipleDatasets: true,
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  },
  [ChartType.PIE]: {
    label: 'Pie Chart',
    icon: 'pie_chart',
    supportsMultipleDatasets: false,
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right' as const
        }
      }
    }
  },
  [ChartType.DOUGHNUT]: {
    label: 'Doughnut Chart',
    icon: 'donut_large',
    supportsMultipleDatasets: false,
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right' as const
        }
      }
    }
  },
  [ChartType.GAUGE]: {
    label: 'Gauge Chart',
    icon: 'speed',
    supportsMultipleDatasets: false,
    defaultOptions: {
      responsive: true,
      maintainAspectRatio: false,
      circumference: Math.PI,
      rotation: Math.PI,
      cutout: '80%'
    }
  }
};

// Widget type configurations
export const WIDGET_TYPE_CONFIG = {
  [WidgetType.KPI]: {
    label: 'KPI Widget',
    icon: 'analytics',
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 4, h: 2 }
  },
  [WidgetType.LINE_CHART]: {
    label: 'Line Chart',
    icon: 'timeline',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 8, h: 6 }
  },
  [WidgetType.BAR_CHART]: {
    label: 'Bar Chart',
    icon: 'bar_chart',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 8, h: 6 }
  },
  [WidgetType.PIE_CHART]: {
    label: 'Pie Chart',
    icon: 'pie_chart',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 }
  },
  [WidgetType.DOUGHNUT_CHART]: {
    label: 'Doughnut Chart',
    icon: 'donut_large',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 4, h: 4 }
  },
  [WidgetType.GAUGE_CHART]: {
    label: 'Gauge Chart',
    icon: 'speed',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    maxSize: { w: 3, h: 3 }
  }
};

// Alert level configurations
export const ALERT_LEVEL_CONFIG = {
  [AlertLevel.LOW]: {
    label: 'Low',
    color: '#2e7d32',
    backgroundColor: '#e8f5e8',
    icon: 'info'
  },
  [AlertLevel.MEDIUM]: {
    label: 'Medium',
    color: '#ed6c02',
    backgroundColor: '#fff4e6',
    icon: 'warning'
  },
  [AlertLevel.HIGH]: {
    label: 'High',
    color: '#d32f2f',
    backgroundColor: '#ffebee',
    icon: 'error'
  },
  [AlertLevel.CRITICAL]: {
    label: 'Critical',
    color: '#b71c1c',
    backgroundColor: '#ffcdd2',
    icon: 'dangerous'
  }
};

// Trend direction configurations
export const TREND_CONFIG = {
  [TrendDirection.UP]: {
    label: 'Increasing',
    color: '#2e7d32',
    icon: 'trending_up',
    symbol: '↗'
  },
  [TrendDirection.DOWN]: {
    label: 'Decreasing',
    color: '#d32f2f',
    icon: 'trending_down',
    symbol: '↘'
  },
  [TrendDirection.STABLE]: {
    label: 'Stable',
    color: '#757575',
    icon: 'trending_flat',
    symbol: '→'
  }
};

// API endpoints (for mock data service)
export const API_ENDPOINTS = {
  BUSINESS_METRICS: '/api/metrics/business',
  REVENUE_DATA: '/api/metrics/revenue',
  INVENTORY_DATA: '/api/metrics/inventory',
  CUSTOMER_METRICS: '/api/metrics/customers',
  FINANCIAL_METRICS: '/api/metrics/financial',
  EXPORT_DATA: '/api/export'
};

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR'
};

// Format configurations
export const FORMAT_CONFIG = {
  CURRENCY: {
    style: 'currency' as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  },
  PERCENTAGE: {
    style: 'percent' as const,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  },
  NUMBER: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  },
  DECIMAL: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }
};