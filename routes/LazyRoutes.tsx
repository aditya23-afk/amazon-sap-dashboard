import { lazy } from 'react';

// Lazy load page components for code splitting
export const Overview = lazy(() => import('../pages/Overview'));
export const Revenue = lazy(() => import('../pages/Revenue'));
export const Inventory = lazy(() => import('../pages/Inventory'));
export const Customers = lazy(() => import('../pages/Customers'));
export const CustomerServiceDashboard = lazy(() => import('../pages/CustomerServiceDashboard'));
export const FinancialDashboard = lazy(() => import('../pages/FinancialDashboard'));
export const InventoryDashboard = lazy(() => import('../pages/InventoryDashboard'));
export const Reports = lazy(() => import('../pages/Reports'));
export const Settings = lazy(() => import('../pages/Settings'));

// Demo components (only loaded when needed)
export const RealTimeDemo = lazy(() => import('../components/demo/RealTimeDemo'));
export const ErrorHandlingDemo = lazy(() => import('../components/demo/ErrorHandlingDemo'));
export const AlertDemo = lazy(() => import('../components/demo/AlertDemo'));
export const WidgetDemo = lazy(() => import('../components/widgets/WidgetDemo'));

// Export all lazy components
export const LazyComponents = {
  Overview,
  Revenue,
  Inventory,
  Customers,
  CustomerServiceDashboard,
  FinancialDashboard,
  InventoryDashboard,
  Reports,
  Settings,
  RealTimeDemo,
  ErrorHandlingDemo,
  AlertDemo,
  WidgetDemo,
};