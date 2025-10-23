import React from 'react';
import {
  Badge,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Typography
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  NotificationImportant as CriticalIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { AlertSeverity, Alert } from '../../types/alerts';

interface AlertIndicatorProps {
  alerts: Alert[];
  variant?: 'badge' | 'chip' | 'icon' | 'compact';
  severity?: AlertSeverity;
  showCount?: boolean;
  onClick?: () => void;
  className?: string;
}

const AlertIndicator: React.FC<AlertIndicatorProps> = ({
  alerts,
  variant = 'badge',
  severity,
  showCount = true,
  onClick,
  className
}) => {
  // Filter alerts by severity if specified
  const filteredAlerts = severity 
    ? alerts.filter(alert => alert.severity === severity)
    : alerts;

  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'active');
  const count = activeAlerts.length;

  if (count === 0) {
    return null;
  }

  const getSeverityColor = (sev: AlertSeverity): string => {
    switch (sev) {
      case AlertSeverity.INFO: return '#2196f3';
      case AlertSeverity.WARNING: return '#ff9800';
      case AlertSeverity.ERROR: return '#f44336';
      case AlertSeverity.CRITICAL: return '#d32f2f';
      default: return '#757575';
    }
  };

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case AlertSeverity.INFO: return <InfoIcon />;
      case AlertSeverity.WARNING: return <WarningIcon />;
      case AlertSeverity.ERROR: return <ErrorIcon />;
      case AlertSeverity.CRITICAL: return <CriticalIcon />;
      default: return <CircleIcon />;
    }
  };

  const getHighestSeverity = (): AlertSeverity => {
    if (activeAlerts.some(a => a.severity === AlertSeverity.CRITICAL)) return AlertSeverity.CRITICAL;
    if (activeAlerts.some(a => a.severity === AlertSeverity.ERROR)) return AlertSeverity.ERROR;
    if (activeAlerts.some(a => a.severity === AlertSeverity.WARNING)) return AlertSeverity.WARNING;
    return AlertSeverity.INFO;
  };

  const displaySeverity = severity || getHighestSeverity();
  const color = getSeverityColor(displaySeverity);
  const icon = getSeverityIcon(displaySeverity);

  const tooltipContent = (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        Active Alerts ({count})
      </Typography>
      {activeAlerts.slice(0, 5).map((alert, index) => (
        <Typography key={alert.id} variant="body2" sx={{ mb: 0.5 }}>
          • {alert.title}
        </Typography>
      ))}
      {activeAlerts.length > 5 && (
        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
          +{activeAlerts.length - 5} more alerts
        </Typography>
      )}
    </Box>
  );

  const renderIndicator = () => {
    switch (variant) {
      case 'badge':
        return (
          <Badge
            badgeContent={showCount ? count : undefined}
            color="error"
            variant={showCount ? 'standard' : 'dot'}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: color,
                color: 'white'
              }
            }}
          >
            <IconButton
              onClick={onClick}
              size="small"
              sx={{ color: color }}
              className={className}
            >
              {icon}
            </IconButton>
          </Badge>
        );

      case 'chip':
        return (
          <Chip
            icon={icon}
            label={showCount ? `${count} Alert${count !== 1 ? 's' : ''}` : 'Alerts'}
            onClick={onClick}
            size="small"
            sx={{
              backgroundColor: `${color}20`,
              color: color,
              borderColor: color,
              '& .MuiChip-icon': {
                color: color
              }
            }}
            variant="outlined"
            className={className}
          />
        );

      case 'icon':
        return (
          <IconButton
            onClick={onClick}
            size="small"
            sx={{ color: color }}
            className={className}
          >
            {icon}
          </IconButton>
        );

      case 'compact':
        return (
          <Box
            onClick={onClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: onClick ? 'pointer' : 'default',
              padding: '2px 6px',
              borderRadius: 1,
              backgroundColor: `${color}10`,
              border: `1px solid ${color}40`
            }}
            className={className}
          >
            <Box sx={{ color: color, display: 'flex', fontSize: '16px' }}>
              {icon}
            </Box>
            {showCount && (
              <Typography variant="caption" sx={{ color: color, fontWeight: 'bold' }}>
                {count}
              </Typography>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Tooltip title={tooltipContent} arrow placement="bottom">
      {renderIndicator()}
    </Tooltip>
  );
};

export default AlertIndicator;