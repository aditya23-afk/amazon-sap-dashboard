// Base components
export { BaseWidget } from './BaseWidget';
export { KPIWidget } from './KPIWidget';
export { ChartWidget } from './ChartWidget';

// Financial widgets
export { RevenueWidget } from './RevenueWidget';
export { ProfitMarginWidget } from './ProfitMarginWidget';
export { CostBreakdownWidget } from './CostBreakdownWidget';
export { FinancialVarianceWidget } from './FinancialVarianceWidget';

// Inventory widgets
export { InventoryLevelsWidget } from './InventoryLevelsWidget';
export { WarehouseCapacityWidget } from './WarehouseCapacityWidget';
export { InventoryThresholdWidget } from './InventoryThresholdWidget';
export { InventoryDrillDownWidget } from './InventoryDrillDownWidget';

// Customer service widgets
export { CustomerSatisfactionWidget } from './CustomerSatisfactionWidget';
export { SupportTicketsWidget } from './SupportTicketsWidget';
export { CustomerRetentionWidget } from './CustomerRetentionWidget';
export { ProductReturnsWidget } from './ProductReturnsWidget';

// Configuration and factory
export { WidgetConfigDialog } from './WidgetConfig';
export { WidgetFactory } from './WidgetFactory';

// Demo component
export { WidgetDemo } from './WidgetDemo';

// Utilities
export * from './utils/widgetUtils';

// Re-export types for convenience
export type {
  BaseWidgetProps,
  KPIWidgetProps,
  ChartWidgetProps,
  WidgetConfig,
  WidgetLayout
} from '../../types';