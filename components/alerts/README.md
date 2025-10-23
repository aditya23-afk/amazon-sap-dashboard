# Alert and Notification System

This directory contains the complete alert and notification system for the Amazon SAP Dashboard. The system provides threshold-based alerts, visual indicators, and a comprehensive notification center.

## Features

### 🚨 Alert Types
- **Inventory Low Stock**: Triggered when inventory levels fall below threshold
- **Inventory Out of Stock**: Triggered when items are completely out of stock  
- **Financial Target Missed**: Triggered when revenue falls below target
- **Customer Satisfaction Low**: Triggered when satisfaction drops below acceptable level
- **High Support Tickets**: Triggered when support ticket volume exceeds threshold
- **Warehouse Capacity**: Triggered when warehouse utilization exceeds safe threshold

### 🎯 Alert Severities
- **Info**: Informational alerts (blue)
- **Warning**: Warning alerts (orange) 
- **Error**: Error alerts (red)
- **Critical**: Critical alerts (dark red)

### 📊 Visual Indicators
- **Badge**: Shows alert count with notification icon
- **Chip**: Displays alert count as a chip component
- **Icon**: Simple icon indicator
- **Compact**: Minimal space indicator for mobile/small widgets

### 🔔 Notification Center
- **Active Alerts**: Shows currently active alerts requiring attention
- **Acknowledged**: Shows alerts that have been acknowledged but not resolved
- **History**: Shows resolved and dismissed alerts
- **Filtering**: Filter by severity, type, and status
- **Actions**: Acknowledge, resolve, or dismiss alerts

### ⚙️ Configuration Panel
- **Threshold Management**: Create, edit, and delete alert thresholds
- **Condition Builder**: Set up complex alert conditions with operators
- **Notification Settings**: Configure toast notifications, sounds, and persistence
- **Global Settings**: Control system-wide alert behavior

## Components

### Core Components

#### `AlertProvider`
Main provider component that wraps the application and provides alert context.

```tsx
import { AlertProvider } from './components/alerts';

<AlertProvider>
  <App />
</AlertProvider>
```

#### `AlertIndicator`
Visual indicator component for displaying alert status.

```tsx
import { AlertIndicator } from './components/alerts';

<AlertIndicator
  alerts={alerts}
  variant="badge"
  onClick={showNotificationCenter}
/>
```

#### `NotificationCenter`
Drawer component for managing alerts.

```tsx
import { NotificationCenter } from './components/alerts';

<NotificationCenter
  open={open}
  onClose={onClose}
  alerts={alerts}
  onAcknowledge={acknowledgeAlert}
  onResolve={resolveAlert}
  onDismiss={dismissAlert}
/>
```

#### `AlertConfigurationPanel`
Dialog component for configuring alert thresholds and settings.

```tsx
import { AlertConfigurationPanel } from './components/alerts';

<AlertConfigurationPanel
  open={open}
  onClose={onClose}
  configuration={configuration}
  onUpdateThreshold={updateThreshold}
/>
```

#### `AlertSummaryWidget`
Dashboard widget showing alert summary and statistics.

```tsx
import { AlertSummaryWidget } from './components/alerts';

<AlertSummaryWidget
  title="System Alerts"
  compact={isMobile}
/>
```

### Hooks

#### `useAlerts`
Main hook for alert functionality.

```tsx
import { useAlerts } from './hooks/useAlerts';

const {
  alerts,
  configuration,
  acknowledgeAlert,
  resolveAlert,
  dismissAlert,
  startMonitoring
} = useAlerts();
```

#### `useAlertContext`
Context hook for accessing alert system from components.

```tsx
import { useAlertContext } from './components/alerts';

const { 
  alerts, 
  showNotificationCenter,
  checkMetrics 
} = useAlertContext();
```

## Services

### `AlertService`
Core service managing alert logic, thresholds, and monitoring.

```tsx
import { alertService } from './services/alertService';

// Check business metrics for alerts
alertService.checkBusinessMetrics(businessMetrics);

// Start automatic monitoring
alertService.startMonitoring(dataCallback);

// Manage alerts
alertService.acknowledgeAlert(alertId);
alertService.resolveAlert(alertId);
```

## Usage Examples

### Basic Setup

1. **Wrap your app with AlertProvider**:
```tsx
import { AlertProvider } from './components/alerts';

function App() {
  return (
    <AlertProvider>
      <YourAppContent />
    </AlertProvider>
  );
}
```

2. **Add alert indicator to header**:
```tsx
import { AlertIndicator, useAlertContext } from './components/alerts';

function Header() {
  const { alerts, showNotificationCenter } = useAlertContext();
  
  return (
    <AppBar>
      <AlertIndicator
        alerts={alerts}
        variant="badge"
        onClick={showNotificationCenter}
      />
    </AppBar>
  );
}
```

3. **Start monitoring in your dashboard**:
```tsx
import { useAlertContext } from './components/alerts';

function Dashboard() {
  const { startMonitoring } = useAlertContext();
  
  useEffect(() => {
    const dataCallback = async () => ({
      business: await getBusinessMetrics(),
      financial: await getFinancialMetrics()
    });
    
    startMonitoring(dataCallback);
  }, []);
}
```

### Manual Alert Checking

```tsx
import { useAlertContext } from './components/alerts';

function SomeComponent() {
  const { checkMetrics } = useAlertContext();
  
  const handleDataUpdate = (newData) => {
    // Check for alerts when data updates
    checkMetrics({
      business: newData.businessMetrics,
      financial: newData.financialMetrics
    });
  };
}
```

### Custom Alert Thresholds

```tsx
import { AlertType, AlertSeverity } from './types/alerts';

const customThreshold = {
  type: AlertType.INVENTORY_LOW_STOCK,
  name: 'Critical Inventory Alert',
  description: 'Triggered when critical items are low',
  enabled: true,
  conditions: [
    { field: 'lowStockItems', operator: 'gt', value: 500 }
  ],
  severity: AlertSeverity.CRITICAL,
  notificationSettings: {
    showToast: true,
    showInCenter: true,
    playSound: true,
    persistent: true,
    autoResolve: false
  }
};

updateThreshold(customThreshold);
```

## Configuration

### Default Thresholds

The system comes with pre-configured thresholds for common business scenarios:

- **Low Stock**: > 1000 items (Warning)
- **Out of Stock**: > 100 items (Error)
- **Financial Target Missed**: < -10% variance (Error)
- **Customer Satisfaction**: < 3.5 score (Warning)
- **High Support Tickets**: > 1500 tickets (Warning)
- **Warehouse Capacity**: > 90% utilization (Warning)

### Global Settings

- **Enable Sounds**: Play audio alerts
- **Enable Toasts**: Show toast notifications
- **Enable Notification Center**: Show notification center
- **Max Alerts**: Maximum alerts to store (default: 50)
- **Auto Refresh**: Monitoring interval (default: 30s)
- **Notification Duration**: Toast duration (default: 5s)

## Testing

Use the Alert Demo page (`/alert-demo`) to test different alert scenarios:

1. Navigate to `/alert-demo`
2. Click buttons to trigger different alert types
3. Observe alerts in notification center and toast notifications
4. Test acknowledgment, resolution, and dismissal actions

## Integration with Requirements

This implementation addresses the following requirements:

- **Requirement 2.3**: Inventory threshold alerts with visual indicators
- **Requirement 3.4**: Financial variance alerts and notifications  
- **Requirement 4.5**: Customer satisfaction and support ticket alerts

The system provides comprehensive alerting capabilities with visual indicators, configurable thresholds, and a full notification management interface.