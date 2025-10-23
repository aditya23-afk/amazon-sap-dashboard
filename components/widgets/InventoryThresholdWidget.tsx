import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Warning, Error as ErrorIcon, CheckCircle, Notifications } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber } from '../../utils/formatters';
import { BusinessMetrics, AlertLevel, InventoryCategory } from '../../types';

interface InventoryThresholdWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

interface ThresholdAlert {
  category: InventoryCategory;
  alertType: 'low_stock' | 'out_of_stock' | 'threshold_breach';
  severity: AlertLevel;
  message: string;
}

export const InventoryThresholdWidget: React.FC<InventoryThresholdWidgetProps> = ({
  id,
  title = 'Inventory Threshold Alerts',
  refreshable = true,
  onRefresh
}) => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [thresholdAlerts, setThresholdAlerts] = useState<ThresholdAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThresholdData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate business metrics
      const metrics = mockDataGenerator.generateBusinessMetrics();
      setBusinessMetrics(metrics);
      
      // Generate threshold alerts
      const alerts: ThresholdAlert[] = [];
      
      metrics.inventory.categories.forEach(category => {
        // Check for out of stock
        if (category.outOfStockItems > 0) {
          alerts.push({
            category,
            alertType: 'out_of_stock',
            severity: AlertLevel.CRITICAL,
            message: `${category.outOfStockItems} items are out of stock`
          });
        }
        
        // Check for low stock
        if (category.lowStockItems > 0) {
          alerts.push({
            category,
            alertType: 'low_stock',
            severity: AlertLevel.HIGH,
            message: `${category.lowStockItems} items are below minimum threshold`
          });
        }
        
        // Check for threshold breach (when low stock + out of stock > 10% of total)
        const criticalRatio = (category.lowStockItems + category.outOfStockItems) / category.totalItems;
        if (criticalRatio > 0.1) {
          alerts.push({
            category,
            alertType: 'threshold_breach',
            severity: AlertLevel.HIGH,
            message: `${(criticalRatio * 100).toFixed(1)}% of inventory is at risk`
          });
        }
      });
      
      // Sort alerts by severity
      alerts.sort((a, b) => {
        const severityOrder = { [AlertLevel.CRITICAL]: 4, [AlertLevel.HIGH]: 3, [AlertLevel.MEDIUM]: 2, [AlertLevel.LOW]: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
      
      setThresholdAlerts(alerts);
      
    } catch (err) {
      setError('Failed to load threshold data');
      console.error('Threshold data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThresholdData();
  }, []);

  const handleRefresh = async () => {
    await loadThresholdData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getAlertSeverityColor = (severity: AlertLevel): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case AlertLevel.CRITICAL:
        return 'error';
      case AlertLevel.HIGH:
        return 'warning';
      case AlertLevel.MEDIUM:
        return 'info';
      case AlertLevel.LOW:
      default:
        return 'success';
    }
  };

  const getAlertIcon = (severity: AlertLevel) => {
    switch (severity) {
      case AlertLevel.CRITICAL:
        return <ErrorIcon />;
      case AlertLevel.HIGH:
        return <Warning />;
      case AlertLevel.MEDIUM:
        return <Notifications />;
      case AlertLevel.LOW:
      default:
        return <CheckCircle />;
    }
  };

  const getAlertTypeLabel = (type: string): string => {
    switch (type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'threshold_breach':
        return 'Threshold Breach';
      default:
        return 'Alert';
    }
  };

  const getCriticalAlerts = () => thresholdAlerts.filter(alert => alert.severity === AlertLevel.CRITICAL);
  const getHighAlerts = () => thresholdAlerts.filter(alert => alert.severity === AlertLevel.HIGH);

  return (
    <BaseWidget
      id={id}
      title={title}
      loading={loading}
      error={error}
      refreshable={refreshable}
      onRefresh={handleRefresh}
    >
      <Box sx={{ p: 2 }}>
        {/* Alert Summary */}
        <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light', borderRadius: 1, opacity: 0.1 }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {getCriticalAlerts().length}
            </Typography>
            <Typography variant="body2" color="error.main">
              Critical
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1, opacity: 0.1 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {getHighAlerts().length}
            </Typography>
            <Typography variant="body2" color="warning.main">
              High Priority
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1, opacity: 0.1 }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {thresholdAlerts.length}
            </Typography>
            <Typography variant="body2" color="info.main">
              Total Alerts
            </Typography>
          </Box>
        </Box>

        {/* Critical Alerts Banner */}
        {getCriticalAlerts().length > 0 && (
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="subtitle2" gutterBottom>
              {getCriticalAlerts().length} Critical Alert{getCriticalAlerts().length > 1 ? 's' : ''} Require Immediate Action
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {getCriticalAlerts().slice(0, 3).map((alert, index) => (
                <Chip
                  key={index}
                  label={`${alert.category.name}: ${alert.message}`}
                  color="error"
                  size="small"
                />
              ))}
              {getCriticalAlerts().length > 3 && (
                <Chip
                  label={`+${getCriticalAlerts().length - 3} more`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Alert>
        )}

        {/* Alerts Table */}
        {thresholdAlerts.length > 0 ? (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Alert Type</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell align="right">Total Items</TableCell>
                  <TableCell align="right">Threshold</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {thresholdAlerts.slice(0, 8).map((alert, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {alert.category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getAlertTypeLabel(alert.alertType)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getAlertIcon(alert.severity)}
                        label={alert.severity.toUpperCase()}
                        color={getAlertSeverityColor(alert.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(alert.category.totalItems)}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(alert.category.threshold)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
            All inventory levels are within acceptable thresholds
          </Alert>
        )}

        {/* Threshold Configuration Summary */}
        {businessMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Threshold Monitoring Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitoring {businessMetrics.inventory.categories.length} product categories • 
              {businessMetrics.inventory.lowStock} items below threshold • 
              {businessMetrics.inventory.outOfStock} items out of stock
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Alert system checks inventory levels every 15 minutes and triggers notifications 
              when items fall below configured thresholds or go out of stock.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default InventoryThresholdWidget;