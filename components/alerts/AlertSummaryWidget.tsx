import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  NotificationImportant as CriticalIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AlertSeverity, AlertStatus } from '../../types/alerts';
import { useAlertContext } from './AlertProvider';
import AlertIndicator from './AlertIndicator';

interface AlertSummaryWidgetProps {
  title?: string;
  showConfiguration?: boolean;
  compact?: boolean;
  className?: string;
}

const AlertSummaryWidget: React.FC<AlertSummaryWidgetProps> = ({
  title = 'Alert Summary',
  showConfiguration = true,
  compact = false,
  className
}) => {
  const {
    alerts,
    activeAlertsCount,
    showNotificationCenter,
    getAlertSummary
  } = useAlertContext();

  const summary = getAlertSummary();

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.INFO: return <InfoIcon sx={{ color: '#2196f3' }} />;
      case AlertSeverity.WARNING: return <WarningIcon sx={{ color: '#ff9800' }} />;
      case AlertSeverity.ERROR: return <ErrorIcon sx={{ color: '#f44336' }} />;
      case AlertSeverity.CRITICAL: return <CriticalIcon sx={{ color: '#d32f2f' }} />;
      default: return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.INFO: return '#2196f3';
      case AlertSeverity.WARNING: return '#ff9800';
      case AlertSeverity.ERROR: return '#f44336';
      case AlertSeverity.CRITICAL: return '#d32f2f';
      default: return '#757575';
    }
  };

  const getStatusColor = (status: AlertStatus): string => {
    switch (status) {
      case AlertStatus.ACTIVE: return '#f44336';
      case AlertStatus.ACKNOWLEDGED: return '#ff9800';
      case AlertStatus.RESOLVED: return '#4caf50';
      case AlertStatus.DISMISSED: return '#757575';
      default: return '#757575';
    }
  };

  const renderCompactView = () => (
    <Card className={className} sx={{ minHeight: 120 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <AlertIndicator
              alerts={alerts}
              variant="compact"
              onClick={showNotificationCenter}
            />
            {showConfiguration && (
              <Tooltip title="Alert Settings">
                <IconButton size="small" onClick={showConfiguration}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {summary.active}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {summary.acknowledged}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Acknowledged
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderFullView = () => (
    <Card className={className}>
      <CardHeader
        title={title}
        action={
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Open Notification Center">
              <IconButton onClick={showNotificationCenter}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            {showConfiguration && (
              <Tooltip title="Alert Settings">
                <IconButton onClick={showConfiguration}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <CardContent>
        {/* Alert Status Overview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Alert Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: getStatusColor(AlertStatus.ACTIVE) }}>
                  {summary.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: getStatusColor(AlertStatus.ACKNOWLEDGED) }}>
                  {summary.acknowledged}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Acknowledged
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" sx={{ color: getStatusColor(AlertStatus.RESOLVED) }}>
                  {summary.resolved}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="text.secondary">
                  {summary.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Severity Breakdown */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            By Severity
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(summary.bySeverity).map(([severity, count]) => (
              <Grid item xs={3} key={severity}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: `${getSeverityColor(severity as AlertSeverity)}10`,
                    border: `1px solid ${getSeverityColor(severity as AlertSeverity)}30`
                  }}
                >
                  {getSeverityIcon(severity as AlertSeverity)}
                  <Box>
                    <Typography variant="h6" sx={{ color: getSeverityColor(severity as AlertSeverity) }}>
                      {count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Recent Alerts */}
        {summary.recentAlerts.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Recent Alerts
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {summary.recentAlerts.slice(0, 3).map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    backgroundColor: 'background.paper',
                    border: 1,
                    borderColor: 'divider'
                  }}
                >
                  {getSeverityIcon(alert.severity)}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {alert.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {alert.message}
                    </Typography>
                  </Box>
                  <Chip
                    label={alert.status}
                    size="small"
                    sx={{
                      backgroundColor: `${getStatusColor(alert.status)}20`,
                      color: getStatusColor(alert.status),
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              ))}
            </Box>
            {summary.recentAlerts.length > 3 && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={showNotificationCenter}
              >
                View {summary.recentAlerts.length - 3} more alerts
              </Typography>
            )}
          </Box>
        )}

        {summary.total === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No alerts at this time
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return compact ? renderCompactView() : renderFullView();
};

export default AlertSummaryWidget;