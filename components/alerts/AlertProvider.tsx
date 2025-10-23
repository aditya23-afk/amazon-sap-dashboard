import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { Alert, AlertConfiguration, AlertThreshold } from '../../types/alerts';
import { BusinessMetrics, FinancialMetrics, CustomerMetrics } from '../../types';
import NotificationCenter from './NotificationCenter';
import AlertConfigurationPanel from './AlertConfigurationPanel';

interface AlertContextType {
  alerts: Alert[];
  configuration: AlertConfiguration;
  isMonitoring: boolean;
  activeAlertsCount: number;
  showNotificationCenter: () => void;
  hideNotificationCenter: () => void;
  showConfiguration: () => void;
  hideConfiguration: () => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  updateThreshold: (threshold: AlertThreshold) => void;
  deleteThreshold: (thresholdId: string) => void;
  updateGlobalSettings: (settings: Partial<AlertConfiguration['globalSettings']>) => void;
  checkMetrics: (metrics: { business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }) => void;
  startMonitoring: (dataCallback: () => Promise<{ business?: BusinessMetrics; financial?: FinancialMetrics; customer?: CustomerMetrics }>) => void;
  stopMonitoring: () => void;
  getAlertSummary: () => ReturnType<typeof useAlerts>['getAlertSummary'];
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: React.ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const {
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
  } = useAlerts();

  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [configurationOpen, setConfigurationOpen] = useState(false);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  // Update active alerts count
  useEffect(() => {
    setActiveAlertsCount(getActiveAlertsCount());
  }, [alerts, getActiveAlertsCount]);

  const showNotificationCenter = () => setNotificationCenterOpen(true);
  const hideNotificationCenter = () => setNotificationCenterOpen(false);
  const showConfiguration = () => setConfigurationOpen(true);
  const hideConfiguration = () => setConfigurationOpen(false);

  const handleRefreshAlerts = () => {
    // This would typically trigger a data refresh
    // For now, we'll just close and reopen to simulate refresh
    console.log('Refreshing alerts...');
  };

  const contextValue: AlertContextType = {
    alerts,
    configuration,
    isMonitoring,
    activeAlertsCount,
    showNotificationCenter,
    hideNotificationCenter,
    showConfiguration,
    hideConfiguration,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    clearAllAlerts,
    updateThreshold,
    deleteThreshold,
    updateGlobalSettings,
    checkMetrics,
    startMonitoring,
    stopMonitoring,
    getAlertSummary
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Center */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={hideNotificationCenter}
        alerts={alerts}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
        onDismiss={dismissAlert}
        onClearAll={clearAllAlerts}
        onRefresh={handleRefreshAlerts}
        onOpenSettings={showConfiguration}
      />

      {/* Configuration Panel */}
      <AlertConfigurationPanel
        open={configurationOpen}
        onClose={hideConfiguration}
        configuration={configuration}
        onUpdateThreshold={updateThreshold}
        onDeleteThreshold={deleteThreshold}
        onUpdateGlobalSettings={updateGlobalSettings}
      />
    </AlertContext.Provider>
  );
};

export const useAlertContext = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
};

export default AlertProvider;