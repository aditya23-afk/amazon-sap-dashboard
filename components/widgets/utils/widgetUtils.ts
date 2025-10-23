import { WidgetLayout, WidgetType, ChartType, WidgetConfig } from '../../../types';

/**
 * Creates a default widget configuration based on widget type
 */
export const createDefaultWidgetConfig = (
  type: WidgetType,
  title: string = 'New Widget'
): WidgetConfig => {
  const baseConfig: WidgetConfig = {
    title,
    refreshInterval: 300000, // 5 minutes
    customSettings: {},
    dataSource: '',
    filters: {}
  };

  switch (type) {
    case WidgetType.KPI:
      return {
        ...baseConfig,
        customSettings: {
          format: 'number',
          precision: 2,
          showTrend: true,
          showTarget: false,
          color: '#1976d2'
        }
      };

    case WidgetType.LINE_CHART:
      return {
        ...baseConfig,
        customSettings: {
          chartType: ChartType.LINE,
          showLegend: true,
          showGrid: true,
          animationEnabled: true,
          height: 300,
          interactive: true,
          colorScheme: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7']
        }
      };

    case WidgetType.BAR_CHART:
      return {
        ...baseConfig,
        customSettings: {
          chartType: ChartType.BAR,
          showLegend: true,
          showGrid: true,
          animationEnabled: true,
          height: 300,
          interactive: true,
          colorScheme: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7']
        }
      };

    case WidgetType.PIE_CHART:
      return {
        ...baseConfig,
        customSettings: {
          chartType: ChartType.PIE,
          showLegend: true,
          showGrid: false,
          animationEnabled: true,
          height: 300,
          interactive: true,
          colorScheme: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3']
        }
      };

    case WidgetType.DOUGHNUT_CHART:
      return {
        ...baseConfig,
        customSettings: {
          chartType: ChartType.DOUGHNUT,
          showLegend: true,
          showGrid: false,
          animationEnabled: true,
          height: 300,
          interactive: true,
          colorScheme: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3']
        }
      };

    case WidgetType.GAUGE_CHART:
      return {
        ...baseConfig,
        customSettings: {
          chartType: ChartType.GAUGE,
          showLegend: false,
          showGrid: false,
          animationEnabled: true,
          height: 250,
          interactive: false,
          colorScheme: ['#4caf50', '#ff9800', '#f44336'],
          minValue: 0,
          maxValue: 100,
          thresholds: [30, 70, 100]
        }
      };

    default:
      return baseConfig;
  }
};

/**
 * Creates a default widget layout
 */
export const createDefaultWidgetLayout = (
  id: string,
  type: WidgetType,
  position: { x: number; y: number; w: number; h: number },
  title?: string
): WidgetLayout => {
  return {
    id,
    type,
    position,
    visible: true,
    config: createDefaultWidgetConfig(type, title),
    minSize: getMinWidgetSize(type),
    maxSize: getMaxWidgetSize(type)
  };
};

/**
 * Gets minimum size constraints for a widget type
 */
export const getMinWidgetSize = (type: WidgetType): { w: number; h: number } => {
  switch (type) {
    case WidgetType.KPI:
      return { w: 2, h: 2 };
    case WidgetType.LINE_CHART:
    case WidgetType.BAR_CHART:
      return { w: 4, h: 3 };
    case WidgetType.PIE_CHART:
    case WidgetType.DOUGHNUT_CHART:
      return { w: 3, h: 3 };
    case WidgetType.GAUGE_CHART:
      return { w: 3, h: 2 };
    default:
      return { w: 2, h: 2 };
  }
};

/**
 * Gets maximum size constraints for a widget type
 */
export const getMaxWidgetSize = (type: WidgetType): { w: number; h: number } => {
  switch (type) {
    case WidgetType.KPI:
      return { w: 4, h: 3 };
    case WidgetType.LINE_CHART:
    case WidgetType.BAR_CHART:
      return { w: 12, h: 8 };
    case WidgetType.PIE_CHART:
    case WidgetType.DOUGHNUT_CHART:
      return { w: 6, h: 6 };
    case WidgetType.GAUGE_CHART:
      return { w: 6, h: 4 };
    default:
      return { w: 12, h: 8 };
  }
};

/**
 * Validates widget configuration
 */
export const validateWidgetConfig = (config: WidgetConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.title || config.title.trim().length === 0) {
    errors.push('Widget title is required');
  }

  if (config.refreshInterval && config.refreshInterval < 10000) {
    errors.push('Refresh interval must be at least 10 seconds');
  }

  if (config.customSettings?.height && config.customSettings.height < 100) {
    errors.push('Widget height must be at least 100px');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generates a unique widget ID
 */
export const generateWidgetId = (type: WidgetType): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `${type}-${timestamp}-${random}`;
};

/**
 * Gets widget type display name
 */
export const getWidgetTypeDisplayName = (type: WidgetType): string => {
  switch (type) {
    case WidgetType.KPI:
      return 'KPI Widget';
    case WidgetType.LINE_CHART:
      return 'Line Chart';
    case WidgetType.BAR_CHART:
      return 'Bar Chart';
    case WidgetType.PIE_CHART:
      return 'Pie Chart';
    case WidgetType.DOUGHNUT_CHART:
      return 'Doughnut Chart';
    case WidgetType.GAUGE_CHART:
      return 'Gauge Chart';
    default:
      return 'Unknown Widget';
  }
};

/**
 * Clones a widget layout with a new ID
 */
export const cloneWidgetLayout = (layout: WidgetLayout, newPosition?: { x: number; y: number }): WidgetLayout => {
  return {
    ...layout,
    id: generateWidgetId(layout.type),
    position: newPosition ? { ...layout.position, ...newPosition } : { ...layout.position },
    config: {
      ...layout.config,
      title: `${layout.config.title} (Copy)`
    }
  };
};

/**
 * Checks if two widget layouts overlap
 */
export const doWidgetsOverlap = (layout1: WidgetLayout, layout2: WidgetLayout): boolean => {
  const pos1 = layout1.position;
  const pos2 = layout2.position;

  return !(
    pos1.x + pos1.w <= pos2.x ||
    pos2.x + pos2.w <= pos1.x ||
    pos1.y + pos1.h <= pos2.y ||
    pos2.y + pos2.h <= pos1.y
  );
};

/**
 * Finds the next available position for a widget
 */
export const findNextAvailablePosition = (
  existingLayouts: WidgetLayout[],
  widgetSize: { w: number; h: number },
  gridCols: number = 12
): { x: number; y: number } => {
  let x = 0;
  let y = 0;

  while (true) {
    const testLayout: WidgetLayout = {
      id: 'test',
      type: WidgetType.KPI,
      position: { x, y, w: widgetSize.w, h: widgetSize.h },
      visible: true,
      config: { title: 'test' }
    };

    const hasOverlap = existingLayouts.some(layout => 
      layout.visible && doWidgetsOverlap(testLayout, layout)
    );

    if (!hasOverlap) {
      return { x, y };
    }

    x += 1;
    if (x + widgetSize.w > gridCols) {
      x = 0;
      y += 1;
    }
  }
};