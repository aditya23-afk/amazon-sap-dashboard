import {
  Alert,
  AlertThreshold,
  AlertType,
  AlertSeverity,
  AlertStatus,
  AlertCondition,
  AlertSummary,
  AlertConfiguration,
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_ALERT_CONFIGURATION
} from '../types/alerts';
import { BusinessMetrics, FinancialMetrics, CustomerMetrics } from '../types';

class AlertService {
  private alerts: Alert[] = [];
  private thresholds: AlertThreshold[] = [];
  private configuration: AlertConfiguration = DEFAULT_ALERT_CONFIGURATION;
  private listeners: Array<(alerts: Alert[]) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultThresholds();
    this.loadConfiguration();
  }

  private initializeDefaultThresholds(): void {
    this.thresholds = DEFAULT_ALERT_THRESHOLDS.map((threshold, index) => ({
      ...threshold,
      id: `threshold_${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private loadConfiguration(): void {
    try {
      const saved = localStorage.getItem('alertConfiguration');
      if (saved) {
        const config = JSON.parse(saved);
        this.configuration = { ...DEFAULT_ALERT_CONFIGURATION, ...config };
        if (config.thresholds) {
          this.thresholds = config.thresholds;
        }
      }
    } catch (error) {
      console.error('Failed to load alert configuration:', error);
    }
  }

  private saveConfiguration(): void {
    try {
      const config = {
        ...this.configuration,
        thresholds: this.thresholds
      };
      localStorage.setItem('alertConfiguration', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save alert configuration:', error);
    }
  }

  // Alert monitoring methods
  checkBusinessMetrics(metrics: BusinessMetrics): Alert[] {
    const newAlerts: Alert[] = [];

    // Check inventory alerts
    if (metrics.inventory.lowStock > 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.INVENTORY_LOW_STOCK && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { lowStockItems: metrics.inventory.lowStock })) {
        const alert = this.createAlert(
          AlertType.INVENTORY_LOW_STOCK,
          threshold,
          'Low Stock Alert',
          `${metrics.inventory.lowStock} items are running low on stock`,
          {
            currentValue: metrics.inventory.lowStock,
            thresholdValue: threshold.conditions[0]?.value,
            affectedItems: ['Multiple categories']
          }
        );
        newAlerts.push(alert);
      }
    }

    if (metrics.inventory.outOfStock > 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.INVENTORY_OUT_OF_STOCK && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { outOfStockItems: metrics.inventory.outOfStock })) {
        const alert = this.createAlert(
          AlertType.INVENTORY_OUT_OF_STOCK,
          threshold,
          'Out of Stock Alert',
          `${metrics.inventory.outOfStock} items are completely out of stock`,
          {
            currentValue: metrics.inventory.outOfStock,
            thresholdValue: threshold.conditions[0]?.value,
            affectedItems: ['Multiple categories']
          }
        );
        newAlerts.push(alert);
      }
    }

    // Check warehouse capacity
    if (metrics.inventory.utilizationRate > 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.WAREHOUSE_CAPACITY && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { warehouseUtilization: metrics.inventory.utilizationRate })) {
        const alert = this.createAlert(
          AlertType.WAREHOUSE_CAPACITY,
          threshold,
          'Warehouse Capacity Warning',
          `Warehouse utilization is at ${metrics.inventory.utilizationRate.toFixed(1)}%`,
          {
            currentValue: metrics.inventory.utilizationRate,
            thresholdValue: threshold.conditions[0]?.value
          }
        );
        newAlerts.push(alert);
      }
    }

    // Check customer satisfaction
    if (metrics.customers.satisfaction > 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.CUSTOMER_SATISFACTION_LOW && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { customerSatisfaction: metrics.customers.satisfaction })) {
        const alert = this.createAlert(
          AlertType.CUSTOMER_SATISFACTION_LOW,
          threshold,
          'Low Customer Satisfaction',
          `Customer satisfaction has dropped to ${metrics.customers.satisfaction.toFixed(1)}`,
          {
            currentValue: metrics.customers.satisfaction,
            thresholdValue: threshold.conditions[0]?.value
          }
        );
        newAlerts.push(alert);
      }
    }

    // Check support tickets
    if (metrics.customers.supportTickets.open > 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.HIGH_SUPPORT_TICKETS && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { openSupportTickets: metrics.customers.supportTickets.open })) {
        const alert = this.createAlert(
          AlertType.HIGH_SUPPORT_TICKETS,
          threshold,
          'High Support Ticket Volume',
          `${metrics.customers.supportTickets.open} support tickets are currently open`,
          {
            currentValue: metrics.customers.supportTickets.open,
            thresholdValue: threshold.conditions[0]?.value
          }
        );
        newAlerts.push(alert);
      }
    }

    return this.processNewAlerts(newAlerts);
  }

  checkFinancialMetrics(metrics: FinancialMetrics): Alert[] {
    const newAlerts: Alert[] = [];

    // Check revenue variance
    if (metrics.variance.budget < 0) {
      const threshold = this.thresholds.find(t => t.type === AlertType.FINANCIAL_TARGET_MISSED && t.enabled);
      if (threshold && this.evaluateConditions(threshold.conditions, { revenueVariance: metrics.variance.budget })) {
        const alert = this.createAlert(
          AlertType.FINANCIAL_TARGET_MISSED,
          threshold,
          'Financial Target Missed',
          `Revenue is ${Math.abs(metrics.variance.budget).toFixed(1)}% below budget target`,
          {
            currentValue: metrics.variance.budget,
            thresholdValue: threshold.conditions[0]?.value
          }
        );
        newAlerts.push(alert);
      }
    }

    return this.processNewAlerts(newAlerts);
  }

  private evaluateConditions(conditions: AlertCondition[], data: Record<string, number | string>): boolean {
    return conditions.every(condition => {
      const value = data[condition.field];
      if (value === undefined) return false;

      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      const thresholdValue = typeof condition.value === 'string' ? parseFloat(condition.value) : condition.value;

      switch (condition.operator) {
        case 'gt': return numValue > thresholdValue;
        case 'lt': return numValue < thresholdValue;
        case 'gte': return numValue >= thresholdValue;
        case 'lte': return numValue <= thresholdValue;
        case 'eq': return numValue === thresholdValue;
        case 'neq': return numValue !== thresholdValue;
        default: return false;
      }
    });
  }

  private createAlert(
    type: AlertType,
    threshold: AlertThreshold,
    title: string,
    message: string,
    metadata?: Alert['metadata']
  ): Alert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: threshold.severity,
      status: AlertStatus.ACTIVE,
      title,
      message,
      thresholdId: threshold.id,
      triggeredAt: new Date().toISOString(),
      metadata
    };
  }

  private processNewAlerts(newAlerts: Alert[]): Alert[] {
    // Filter out duplicate alerts (same type and similar conditions)
    const uniqueAlerts = newAlerts.filter(newAlert => {
      return !this.alerts.some(existingAlert => 
        existingAlert.type === newAlert.type &&
        existingAlert.status === AlertStatus.ACTIVE &&
        this.isRecentAlert(existingAlert, 300000) // 5 minutes
      );
    });

    // Add unique alerts to the collection
    this.alerts.unshift(...uniqueAlerts);

    // Limit the number of stored alerts
    if (this.alerts.length > this.configuration.globalSettings.maxAlertsInCenter) {
      this.alerts = this.alerts.slice(0, this.configuration.globalSettings.maxAlertsInCenter);
    }

    // Notify listeners
    if (uniqueAlerts.length > 0) {
      this.notifyListeners();
    }

    return uniqueAlerts;
  }

  private isRecentAlert(alert: Alert, timeWindow: number): boolean {
    const alertTime = new Date(alert.triggeredAt).getTime();
    const now = Date.now();
    return (now - alertTime) < timeWindow;
  }

  // Alert management methods
  acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && alert.status === AlertStatus.ACTIVE) {
      alert.status = AlertStatus.ACKNOWLEDGED;
      alert.acknowledgedAt = new Date().toISOString();
      alert.acknowledgedBy = acknowledgedBy;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string, resolvedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert && (alert.status === AlertStatus.ACTIVE || alert.status === AlertStatus.ACKNOWLEDGED)) {
      alert.status = AlertStatus.RESOLVED;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  dismissAlert(alertId: string, dismissedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = AlertStatus.DISMISSED;
      alert.dismissedAt = new Date().toISOString();
      alert.dismissedBy = dismissedBy;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter(alert => alert.status !== AlertStatus.RESOLVED);
    this.notifyListeners();
  }

  clearAllAlerts(): void {
    this.alerts = [];
    this.notifyListeners();
  }

  // Configuration methods
  updateThreshold(threshold: AlertThreshold): void {
    const index = this.thresholds.findIndex(t => t.id === threshold.id);
    if (index >= 0) {
      this.thresholds[index] = { ...threshold, updatedAt: new Date().toISOString() };
    } else {
      this.thresholds.push({ ...threshold, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.saveConfiguration();
  }

  deleteThreshold(thresholdId: string): void {
    this.thresholds = this.thresholds.filter(t => t.id !== thresholdId);
    this.saveConfiguration();
  }

  updateGlobalSettings(settings: Partial<AlertConfiguration['globalSettings']>): void {
    this.configuration.globalSettings = { ...this.configuration.globalSettings, ...settings };
    this.saveConfiguration();
  }

  // Getters
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => alert.status === AlertStatus.ACTIVE);
  }

  getAlertsByType(type: AlertType): Alert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  getAlertSummary(): AlertSummary {
    const total = this.alerts.length;
    const active = this.alerts.filter(a => a.status === AlertStatus.ACTIVE).length;
    const acknowledged = this.alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length;
    const resolved = this.alerts.filter(a => a.status === AlertStatus.RESOLVED).length;
    const dismissed = this.alerts.filter(a => a.status === AlertStatus.DISMISSED).length;

    const bySeverity = {
      [AlertSeverity.INFO]: this.alerts.filter(a => a.severity === AlertSeverity.INFO).length,
      [AlertSeverity.WARNING]: this.alerts.filter(a => a.severity === AlertSeverity.WARNING).length,
      [AlertSeverity.ERROR]: this.alerts.filter(a => a.severity === AlertSeverity.ERROR).length,
      [AlertSeverity.CRITICAL]: this.alerts.filter(a => a.severity === AlertSeverity.CRITICAL).length
    };

    const byType = Object.values(AlertType).reduce((acc, type) => {
      acc[type] = this.alerts.filter(a => a.type === type).length;
      return acc;
    }, {} as Record<AlertType, number>);

    const recentAlerts = this.alerts
      .filter(a => this.isRecentAlert(a, 86400000)) // Last 24 hours
      .slice(0, 10);

    return {
      total,
      active,
      acknowledged,
      resolved,
      dismissed,
      bySeverity,
      byType,
      recentAlerts
    };
  }

  getThresholds(): AlertThreshold[] {
    return [...this.thresholds];
  }

  getConfiguration(): AlertConfiguration {
    return { ...this.configuration, thresholds: [...this.thresholds] };
  }

  // Event handling
  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }

  // Auto-monitoring
  startMonitoring(dataCallback: () => Promise<{ business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }>): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const data = await dataCallback();
        
        if (data.business) {
          this.checkBusinessMetrics(data.business);
        }
        
        if (data.financial) {
          this.checkFinancialMetrics(data.financial);
        }
      } catch (error) {
        console.error('Error during alert monitoring:', error);
      }
    }, this.configuration.globalSettings.autoRefreshInterval);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const alertService = new AlertService();
export default alertService;