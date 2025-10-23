import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Chip,
  Alert as MuiAlert
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  NotificationImportant as CriticalIcon
} from '@mui/icons-material';
import { useAlertContext } from '../alerts';
import { AlertType, AlertSeverity } from '../../types/alerts';
import { mockDataGenerator } from '../../services/mockDataService';

const AlertDemo: React.FC = () => {
  const { checkMetrics, alerts, activeAlertsCount } = useAlertContext();
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const triggerLowStockAlert = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    // Force low stock condition
    businessMetrics.inventory.lowStock = 1500; // Above threshold of 1000
    businessMetrics.inventory.outOfStock = 50;
    
    checkMetrics({ business: businessMetrics });
    setLastCheck(new Date());
  };

  const triggerOutOfStockAlert = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    // Force out of stock condition
    businessMetrics.inventory.outOfStock = 150; // Above threshold of 100
    businessMetrics.inventory.lowStock = 800;
    
    checkMetrics({ business: businessMetrics });
    setLastCheck(new Date());
  };

  const triggerFinancialAlert = () => {
    const financialMetrics = mockDataGenerator.generateFinancialMetrics();
    // Force financial target missed
    financialMetrics.variance.budget = -15; // Below threshold of -10%
    
    checkMetrics({ financial: financialMetrics });
    setLastCheck(new Date());
  };

  const triggerCustomerSatisfactionAlert = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    // Force low customer satisfaction
    businessMetrics.customers.satisfaction = 3.2; // Below threshold of 3.5
    
    checkMetrics({ business: businessMetrics });
    setLastCheck(new Date());
  };

  const triggerHighSupportTicketsAlert = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    // Force high support tickets
    businessMetrics.customers.supportTickets.open = 1800; // Above threshold of 1500
    
    checkMetrics({ business: businessMetrics });
    setLastCheck(new Date());
  };

  const triggerWarehouseCapacityAlert = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    // Force warehouse capacity warning
    businessMetrics.inventory.utilizationRate = 92; // Above threshold of 90%
    
    checkMetrics({ business: businessMetrics });
    setLastCheck(new Date());
  };

  const triggerMultipleAlerts = () => {
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    const financialMetrics = mockDataGenerator.generateFinancialMetrics();
    
    // Trigger multiple conditions
    businessMetrics.inventory.lowStock = 1200;
    businessMetrics.inventory.outOfStock = 120;
    businessMetrics.customers.satisfaction = 3.1;
    businessMetrics.customers.supportTickets.open = 1600;
    financialMetrics.variance.budget = -12;
    
    checkMetrics({ 
      business: businessMetrics,
      financial: financialMetrics
    });
    setLastCheck(new Date());
  };

  const demoButtons = [
    {
      label: 'Low Stock Alert',
      description: 'Trigger when inventory levels fall below threshold',
      severity: AlertSeverity.WARNING,
      action: triggerLowStockAlert,
      icon: <WarningIcon />
    },
    {
      label: 'Out of Stock Alert',
      description: 'Trigger when items are completely out of stock',
      severity: AlertSeverity.ERROR,
      action: triggerOutOfStockAlert,
      icon: <ErrorIcon />
    },
    {
      label: 'Financial Target Missed',
      description: 'Trigger when revenue falls below target',
      severity: AlertSeverity.ERROR,
      action: triggerFinancialAlert,
      icon: <ErrorIcon />
    },
    {
      label: 'Low Customer Satisfaction',
      description: 'Trigger when satisfaction drops below acceptable level',
      severity: AlertSeverity.WARNING,
      action: triggerCustomerSatisfactionAlert,
      icon: <WarningIcon />
    },
    {
      label: 'High Support Tickets',
      description: 'Trigger when support ticket volume exceeds threshold',
      severity: AlertSeverity.WARNING,
      action: triggerHighSupportTicketsAlert,
      icon: <WarningIcon />
    },
    {
      label: 'Warehouse Capacity',
      description: 'Trigger when warehouse utilization exceeds safe threshold',
      severity: AlertSeverity.WARNING,
      action: triggerWarehouseCapacityAlert,
      icon: <WarningIcon />
    }
  ];

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.INFO: return 'info';
      case AlertSeverity.WARNING: return 'warning';
      case AlertSeverity.ERROR: return 'error';
      case AlertSeverity.CRITICAL: return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Alert System Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Test the alert and notification system by triggering different alert conditions.
        Alerts will appear in the notification center and as toast notifications.
      </Typography>

      {/* Current Status */}
      <MuiAlert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Active Alerts: <strong>{activeAlertsCount}</strong> | 
          Total Alerts: <strong>{alerts.length}</strong>
          {lastCheck && (
            <span> | Last Check: {lastCheck.toLocaleTimeString()}</span>
          )}
        </Typography>
      </MuiAlert>

      {/* Demo Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {demoButtons.map((demo, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {demo.icon}
                  <Typography variant="h6" component="div">
                    {demo.label}
                  </Typography>
                </Box>
                <Chip
                  label={demo.severity}
                  size="small"
                  color={getSeverityColor(demo.severity) as any}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {demo.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={demo.action}
                  color={getSeverityColor(demo.severity) as any}
                >
                  Trigger Alert
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Bulk Actions */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="error"
          onClick={triggerMultipleAlerts}
          startIcon={<CriticalIcon />}
        >
          Trigger Multiple Alerts
        </Button>
      </Box>

      {/* Recent Alerts Display */}
      {alerts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Alerts (Last 5)
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {alerts.slice(0, 5).map((alert) => (
              <Card key={alert.id} sx={{ mb: 1, borderLeft: `4px solid ${
                alert.severity === AlertSeverity.CRITICAL ? '#d32f2f' :
                alert.severity === AlertSeverity.ERROR ? '#f44336' :
                alert.severity === AlertSeverity.WARNING ? '#ff9800' : '#2196f3'
              }` }}>
                <CardContent sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2">
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {alert.message}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={getSeverityColor(alert.severity) as any}
                      />
                      <Chip
                        label={alert.status}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AlertDemo;