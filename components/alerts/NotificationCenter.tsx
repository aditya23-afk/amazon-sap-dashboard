import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Clear as DismissIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  NotificationImportant as CriticalIcon
} from '@mui/icons-material';
import { Alert, AlertSeverity, AlertStatus, AlertType } from '../../types/alerts';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
  onClearAll: () => void;
  onRefresh?: () => void;
  onOpenSettings?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ height: '100%', overflow: 'auto' }}>
    {value === index && children}
  </div>
);

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  alerts,
  onAcknowledge,
  onResolve,
  onDismiss,
  onClearAll,
  onRefresh,
  onOpenSettings
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [showResolved, setShowResolved] = useState(false);

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

  const filterAlerts = (alertList: Alert[]): Alert[] => {
    return alertList.filter(alert => {
      // Status filter based on tab
      const statusMatch = (() => {
        switch (currentTab) {
          case 0: return alert.status === AlertStatus.ACTIVE;
          case 1: return alert.status === AlertStatus.ACKNOWLEDGED;
          case 2: return showResolved ? alert.status === AlertStatus.RESOLVED : alert.status !== AlertStatus.DISMISSED;
          default: return true;
        }
      })();

      // Severity filter
      const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
      
      // Type filter
      const typeMatch = typeFilter === 'all' || alert.type === typeFilter;

      return statusMatch && severityMatch && typeMatch;
    });
  };

  const filteredAlerts = filterAlerts(alerts);
  const activeAlerts = alerts.filter(a => a.status === AlertStatus.ACTIVE);
  const acknowledgedAlerts = alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED);
  const otherAlerts = alerts.filter(a => a.status === AlertStatus.RESOLVED || a.status === AlertStatus.DISMISSED);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const formatAlertTime = (timestamp: string): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const renderAlertItem = (alert: Alert) => (
    <ListItem
      key={alert.id}
      sx={{
        borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
        mb: 1,
        backgroundColor: alert.status === AlertStatus.ACTIVE ? 'rgba(244, 67, 54, 0.05)' : 'transparent',
        borderRadius: 1
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getSeverityIcon(alert.severity)}
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {alert.title}
            </Typography>
            <Chip
              label={alert.status}
              size="small"
              sx={{
                backgroundColor: `${getStatusColor(alert.status)}20`,
                color: getStatusColor(alert.status),
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {alert.message}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatAlertTime(alert.triggeredAt)}
              {alert.metadata?.currentValue && alert.metadata?.thresholdValue && (
                <span> • Current: {alert.metadata.currentValue}, Threshold: {alert.metadata.thresholdValue}</span>
              )}
            </Typography>
          </Box>
        }
      />
      
      <ListItemSecondaryAction>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {alert.status === AlertStatus.ACTIVE && (
            <>
              <Tooltip title="Acknowledge">
                <IconButton
                  size="small"
                  onClick={() => onAcknowledge(alert.id)}
                  sx={{ color: '#ff9800' }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Resolve">
                <IconButton
                  size="small"
                  onClick={() => onResolve(alert.id)}
                  sx={{ color: '#4caf50' }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {alert.status === AlertStatus.ACKNOWLEDGED && (
            <Tooltip title="Resolve">
              <IconButton
                size="small"
                onClick={() => onResolve(alert.id)}
                sx={{ color: '#4caf50' }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Dismiss">
            <IconButton
              size="small"
              onClick={() => onDismiss(alert.id)}
              sx={{ color: '#757575' }}
            >
              <DismissIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Notification Center</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onRefresh && (
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={onRefresh}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Filter">
                <IconButton size="small" onClick={handleFilterClick}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              {onOpenSettings && (
                <Tooltip title="Settings">
                  <IconButton size="small" onClick={onOpenSettings}>
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Tabs */}
          <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
            <Tab
              label={
                <Badge badgeContent={activeAlerts.length} color="error" max={99}>
                  Active
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={acknowledgedAlerts.length} color="warning" max={99}>
                  Acknowledged
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={otherAlerts.length} color="default" max={99}>
                  History
                </Badge>
              }
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <TabPanel value={currentTab} index={0}>
            <List sx={{ p: 1 }}>
              {filteredAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No active alerts
                  </Typography>
                </Box>
              ) : (
                filteredAlerts.map(renderAlertItem)
              )}
            </List>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <List sx={{ p: 1 }}>
              {filteredAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No acknowledged alerts
                  </Typography>
                </Box>
              ) : (
                filteredAlerts.map(renderAlertItem)
              )}
            </List>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Box sx={{ p: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showResolved}
                    onChange={(e) => setShowResolved(e.target.checked)}
                    size="small"
                  />
                }
                label="Show resolved alerts"
                sx={{ mb: 1 }}
              />
              <List>
                {filteredAlerts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No alerts in history
                    </Typography>
                  </Box>
                ) : (
                  filteredAlerts.map(renderAlertItem)
                )}
              </List>
            </Box>
          </TabPanel>
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClearAll}
            disabled={alerts.length === 0}
          >
            Clear All Alerts
          </Button>
        </Box>
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={handleFilterClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Severity</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setSeverityFilter('all'); handleFilterClose(); }}>
          All Severities
        </MenuItem>
        {Object.values(AlertSeverity).map(severity => (
          <MenuItem
            key={severity}
            onClick={() => { setSeverityFilter(severity); handleFilterClose(); }}
          >
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem disabled>
          <Typography variant="subtitle2">Filter by Type</Typography>
        </MenuItem>
        <MenuItem onClick={() => { setTypeFilter('all'); handleFilterClose(); }}>
          All Types
        </MenuItem>
        {Object.values(AlertType).map(type => (
          <MenuItem
            key={type}
            onClick={() => { setTypeFilter(type); handleFilterClose(); }}
          >
            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </MenuItem>
        ))}
      </Menu>
    </Drawer>
  );
};

export default NotificationCenter;