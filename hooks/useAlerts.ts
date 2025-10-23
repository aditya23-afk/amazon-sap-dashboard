import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertConfiguration, AlertThreshold } from '../types/alerts';
import { alertService } from '../services/alertService';
import { useNotifications } from '../components/notifications/NotificationProvider';
import { BusinessMetrics, FinancialMetrics, CustomerMetrics } from '../types';

interface UseAlertsReturn {
  alerts: Alert[];
  configuration: AlertConfiguration;
  isMonitoring: boolean;
  startMonitoring: (dataCallback: () => Promise<{ business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }>) => void;
  stopMonitoring: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  updateThreshold: (threshold: AlertThreshold) => void;
  deleteThreshold: (thresholdId: string) => void;
  updateGlobalSettings: (settings: Partial<AlertConfiguration['globalSettings']>) => void;
  checkMetrics: (metrics: { business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }) => void;
  getActiveAlertsCount: () => number;
  getAlertSummary: () => ReturnType<typeof alertService.getAlertSummary>;
}

export const useAlerts = (): UseAlertsReturn => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [configuration, setConfiguration] = useState<AlertConfiguration>(alertService.getConfiguration());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { showNotification } = useNotifications();

  // Subscribe to alert service updates
  useEffect(() => {
    const unsubscribe = alertService.subscribe((updatedAlerts) => {
      setAlerts(updatedAlerts);
      
      // Show toast notifications for new active alerts
      const newActiveAlerts = updatedAlerts.filter(alert => 
        alert.status === 'active' && 
        !alerts.some(existing => existing.id === alert.id)
      );

      newActiveAlerts.forEach(alert => {
        const threshold = configuration.thresholds.find(t => t.id === alert.thresholdId);
        if (threshold?.notificationSettings.showToast && configuration.globalSettings.enableToasts) {
          showNotification({
            type: alert.severity === 'critical' || alert.severity === 'error' ? 'error' : 
                  alert.severity === 'warning' ? 'warning' : 'info',
            title: alert.title,
            message: alert.message,
            duration: threshold.notificationSettings.persistent ? 0 : configuration.globalSettings.defaultNotificationDuration,
            persistent: threshold.notificationSettings.persistent,
            actions: [
              {
                label: 'Acknowledge',
                action: () => acknowledgeAlert(alert.id),
                variant: 'outlined'
              },
              {
                label: 'Resolve',
                action: () => resolveAlert(alert.id),
                variant: 'contained'
              }
            ]
          });

          // Play sound if enabled
          if (threshold.notificationSettings.playSound && configuration.globalSettings.enableSounds) {
            playAlertSound(alert.severity);
          }
        }
      });
    });

    // Initialize alerts
    setAlerts(alertService.getAlerts());

    return unsubscribe;
  }, [alerts, configuration, showNotification]);

  // Update configuration when it changes
  useEffect(() => {
    setConfiguration(alertService.getConfiguration());
  }, []);

  const playAlertSound = (severity: string) => {
    try {
      // Create a simple beep sound based on severity
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different severities
      const frequency = severity === 'critical' ? 800 : 
                       severity === 'error' ? 600 : 
                       severity === 'warning' ? 400 : 300;

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play alert sound:', error);
    }
  };

  const startMonitoring = useCallback((dataCallback: () => Promise<{ business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }>) => {
    alertService.startMonitoring(dataCallback);
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    alertService.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    alertService.acknowledgeAlert(alertId, 'user');
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    alertService.resolveAlert(alertId, 'user');
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    alertService.dismissAlert(alertId, 'user');
  }, []);

  const clearAllAlerts = useCallback(() => {
    alertService.clearAllAlerts();
  }, []);

  const updateThreshold = useCallback((threshold: AlertThreshold) => {
    alertService.updateThreshold(threshold);
    setConfiguration(alertService.getConfiguration());
  }, []);

  const deleteThreshold = useCallback((thresholdId: string) => {
    alertService.deleteThreshold(thresholdId);
    setConfiguration(alertService.getConfiguration());
  }, []);

  const updateGlobalSettings = useCallback((settings: Partial<AlertConfiguration['globalSettings']>) => {
    alertService.updateGlobalSettings(settings);
    setConfiguration(alertService.getConfiguration());
  }, []);

  const checkMetrics = useCallback((metrics: { business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }) => {
    if (metrics.business) {
      alertService.checkBusinessMetrics(metrics.business);
    }
    if (metrics.financial) {
      alertService.checkFinancialMetrics(metrics.financial);
    }
  }, []);

  const getActiveAlertsCount = useCallback(() => {
    return alertService.getActiveAlerts().length;
  }, []);

  const getAlertSummary = useCallback(() => {
    return alertService.getAlertSummary();
  }, []);

  return {
    alerts,
    configuration,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    clearAllAlerts,
    updateThreshold,
    deleteThreshold,
    updateGlobalSettings,
    checkMetrics,
    getActiveAlertsCount,
    getAlertSummary
  };
};