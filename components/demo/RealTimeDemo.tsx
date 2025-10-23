import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useBusinessMetrics, useRevenueData, useInventoryData, useCustomerData } from '@/hooks/useRealTimeData';
import { dataCacheService } from '@/services/dataCacheService';
import { autoRefreshService } from '@/services/autoRefreshService';
import { realTimeDataService } from '@/services/realTimeDataService';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import PerformanceMonitor from '@/components/common/PerformanceMonitor';

const RealTimeDemo: React.FC = () => {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // minutes
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Use real-time data hooks
  const [metricsState, metricsActions] = useBusinessMetrics({
    enableRealTime: realTimeEnabled,
    enableAutoRefresh: autoRefreshEnabled,
    refreshInterval: refreshInterval * 60 * 1000,
    cacheEnabled: true
  });

  const [revenueState, revenueActions] = useRevenueData({
    enableRealTime: realTimeEnabled,
    enableAutoRefresh: autoRefreshEnabled,
    refreshInterval: refreshInterval * 60 * 1000,
    cacheEnabled: true
  });

  const [inventoryState, inventoryActions] = useInventoryData({
    enableRealTime: realTimeEnabled,
    enableAutoRefresh: autoRefreshEnabled,
    refreshInterval: refreshInterval * 60 * 1000,
    cacheEnabled: true
  });

  const [customerState, customerActions] = useCustomerData({
    enableRealTime: realTimeEnabled,
    enableAutoRefresh: autoRefreshEnabled,
    refreshInterval: refreshInterval * 60 * 1000,
    cacheEnabled: true
  });

  const handleRefreshAll = async () => {
    await Promise.all([
      metricsActions.refresh(),
      revenueActions.refresh(),
      inventoryActions.refresh(),
      customerActions.refresh()
    ]);
  };

  const handleClearCache = () => {
    dataCacheService.clear();
  };

  const handleToggleAutoRefresh = (enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
    
    // Update global auto-refresh configuration
    autoRefreshService.updateGlobalConfig({
      enabled,
      interval: refreshInterval * 60 * 1000
    });
  };

  const handleIntervalChange = (value: number) => {
    setRefreshInterval(value);
    
    // Update global auto-refresh configuration
    autoRefreshService.updateGlobalConfig({
      interval: value * 60 * 1000
    });
  };

  const handleToggleRealTime = (enabled: boolean) => {
    setRealTimeEnabled(enabled);
    
    if (enabled) {
      realTimeDataService.connect();
    } else {
      realTimeDataService.disconnect();
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'connecting': return 'warning';
      case 'disconnected': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Real-Time Data Demo
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        This demo showcases the real-time data updates, caching, and auto-refresh functionality.
      </Typography>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Controls
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeEnabled}
                    onChange={(e) => handleToggleRealTime(e.target.checked)}
                  />
                }
                label="Real-Time Updates"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefreshEnabled}
                    onChange={(e) => handleToggleAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto Refresh"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Typography gutterBottom>
                Refresh Interval: {refreshInterval} minutes
              </Typography>
              <Slider
                value={refreshInterval}
                onChange={(_, value) => handleIntervalChange(value as number)}
                min={1}
                max={30}
                step={1}
                marks={[
                  { value: 1, label: '1m' },
                  { value: 5, label: '5m' },
                  { value: 15, label: '15m' },
                  { value: 30, label: '30m' }
                ]}
                disabled={!autoRefreshEnabled}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Box display="flex" gap={1}>
                <Tooltip title="Refresh All Data">
                  <IconButton onClick={handleRefreshAll} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear Cache">
                  <IconButton onClick={handleClearCache} color="secondary">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NetworkIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Connection</Typography>
              <Chip 
                label={metricsState.connectionStatus}
                color={getConnectionStatusColor(metricsState.connectionStatus) as any}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SpeedIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Auto Refresh</Typography>
              <Chip 
                label={autoRefreshEnabled ? 'Enabled' : 'Disabled'}
                color={autoRefreshEnabled ? 'success' : 'default'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Cache</Typography>
              <Typography variant="body2">
                {dataCacheService.getStats().totalEntries} entries
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RefreshIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6">Last Update</Typography>
              <Typography variant="body2">
                {formatLastUpdated(metricsState.lastUpdated)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Status
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                {metricsState.loading ? <RefreshIcon /> : <StorageIcon />}
              </ListItemIcon>
              <ListItemText
                primary="Business Metrics"
                secondary={
                  <Box>
                    <Typography variant="body2" component="span">
                      Status: {metricsState.loading ? 'Loading...' : metricsState.data ? 'Loaded' : 'No Data'}
                    </Typography>
                    {metricsState.error && (
                      <Typography variant="body2" color="error" component="div">
                        Error: {metricsState.error}
                      </Typography>
                    )}
                    {metricsState.lastUpdated && (
                      <Typography variant="body2" color="textSecondary" component="div">
                        Last updated: {formatLastUpdated(metricsState.lastUpdated)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Chip 
                label={metricsState.refreshing ? 'Refreshing' : 'Ready'}
                color={metricsState.refreshing ? 'warning' : 'success'}
                size="small"
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                {revenueState.loading ? <RefreshIcon /> : <StorageIcon />}
              </ListItemIcon>
              <ListItemText
                primary="Revenue Data"
                secondary={
                  <Box>
                    <Typography variant="body2" component="span">
                      Status: {revenueState.loading ? 'Loading...' : revenueState.data ? 'Loaded' : 'No Data'}
                    </Typography>
                    {revenueState.error && (
                      <Typography variant="body2" color="error" component="div">
                        Error: {revenueState.error}
                      </Typography>
                    )}
                    {revenueState.lastUpdated && (
                      <Typography variant="body2" color="textSecondary" component="div">
                        Last updated: {formatLastUpdated(revenueState.lastUpdated)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Chip 
                label={revenueState.refreshing ? 'Refreshing' : 'Ready'}
                color={revenueState.refreshing ? 'warning' : 'success'}
                size="small"
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                {inventoryState.loading ? <RefreshIcon /> : <StorageIcon />}
              </ListItemIcon>
              <ListItemText
                primary="Inventory Data"
                secondary={
                  <Box>
                    <Typography variant="body2" component="span">
                      Status: {inventoryState.loading ? 'Loading...' : inventoryState.data ? 'Loaded' : 'No Data'}
                    </Typography>
                    {inventoryState.error && (
                      <Typography variant="body2" color="error" component="div">
                        Error: {inventoryState.error}
                      </Typography>
                    )}
                    {inventoryState.lastUpdated && (
                      <Typography variant="body2" color="textSecondary" component="div">
                        Last updated: {formatLastUpdated(inventoryState.lastUpdated)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Chip 
                label={inventoryState.refreshing ? 'Refreshing' : 'Ready'}
                color={inventoryState.refreshing ? 'warning' : 'success'}
                size="small"
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                {customerState.loading ? <RefreshIcon /> : <StorageIcon />}
              </ListItemIcon>
              <ListItemText
                primary="Customer Data"
                secondary={
                  <Box>
                    <Typography variant="body2" component="span">
                      Status: {customerState.loading ? 'Loading...' : customerState.data ? 'Loaded' : 'No Data'}
                    </Typography>
                    {customerState.error && (
                      <Typography variant="body2" color="error" component="div">
                        Error: {customerState.error}
                      </Typography>
                    )}
                    {customerState.lastUpdated && (
                      <Typography variant="body2" color="textSecondary" component="div">
                        Last updated: {formatLastUpdated(customerState.lastUpdated)}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Chip 
                label={customerState.refreshing ? 'Refreshing' : 'Ready'}
                color={customerState.refreshing ? 'warning' : 'success'}
                size="small"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Sample Data Display */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Metrics Sample
              </Typography>
              {metricsState.loading ? (
                <SkeletonLoader variant="kpi" />
              ) : metricsState.data ? (
                <Box>
                  <Typography variant="body2">
                    Revenue: ${metricsState.data.revenue.current.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Orders: {metricsState.data.orders.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Active Customers: {metricsState.data.customers.active.toLocaleString()}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">No data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Data Sample
              </Typography>
              {revenueState.loading ? (
                <SkeletonLoader variant="chart" height={200} />
              ) : revenueState.data ? (
                <Box>
                  <Typography variant="body2">
                    Data Points: {revenueState.data.labels.length}
                  </Typography>
                  <Typography variant="body2">
                    Datasets: {revenueState.data.datasets.length}
                  </Typography>
                  <Typography variant="body2">
                    Last Updated: {revenueState.data.metadata?.lastUpdated ? 
                      new Date(revenueState.data.metadata.lastUpdated).toLocaleTimeString() : 'Unknown'}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">No data available</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Monitor */}
      <PerformanceMonitor />
    </Box>
  );
};

export default RealTimeDemo;