import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { dataCacheService, CacheStats } from '@/services/dataCacheService';
import { realTimeDataService } from '@/services/realTimeDataService';
import { autoRefreshService, RefreshJob } from '@/services/autoRefreshService';
import { configService } from '@/services/configService';

interface PerformanceMetrics {
  cacheStats: CacheStats;
  connectionStatus: string;
  activeJobs: RefreshJob[];
  memoryUsage: number;
  lastUpdate: string;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheStats: {
      totalEntries: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      memoryUsage: 0
    },
    connectionStatus: 'disconnected',
    activeJobs: [],
    memoryUsage: 0,
    lastUpdate: new Date().toISOString()
  });

  const [expanded, setExpanded] = useState<string | false>(false);

  const updateMetrics = () => {
    const cacheStats = dataCacheService.getStats();
    const connectionStatus = realTimeDataService.getConnectionStatus();
    const activeJobs = autoRefreshService.getAllJobs();
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0;

    setMetrics({
      cacheStats,
      connectionStatus,
      activeJobs,
      memoryUsage,
      lastUpdate: new Date().toISOString()
    });
  };

  useEffect(() => {
    updateMetrics();
    
    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
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

  const getJobStatusColor = (job: RefreshJob) => {
    if (job.isRunning) return 'info';
    if (job.errors > 0) return 'error';
    if (job.config.enabled) return 'success';
    return 'default';
  };

  if (!configService.debugMode) {
    return null; // Only show in debug mode
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <SpeedIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Performance Monitor</Typography>
          </Box>
          <Tooltip title="Refresh Metrics">
            <IconButton onClick={updateMetrics} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <StorageIcon color="primary" />
                <Typography variant="h6">{metrics.cacheStats.totalEntries}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Cache Entries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <TimelineIcon color="primary" />
                <Typography variant="h6">{metrics.cacheStats.hitRate.toFixed(1)}%</Typography>
                <Typography variant="caption" color="textSecondary">
                  Cache Hit Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <NetworkIcon color="primary" />
                <Chip 
                  label={metrics.connectionStatus}
                  color={getConnectionStatusColor(metrics.connectionStatus) as any}
                  size="small"
                />
                <Typography variant="caption" color="textSecondary" display="block">
                  Connection
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <SpeedIcon color="primary" />
                <Typography variant="h6">{formatBytes(metrics.memoryUsage)}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Memory Usage
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Detailed Sections */}
        <Accordion 
          expanded={expanded === 'cache'} 
          onChange={handleAccordionChange('cache')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Cache Statistics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Cache Performance
                </Typography>
                <Box mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Hit Rate: {metrics.cacheStats.hitRate.toFixed(1)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.cacheStats.hitRate} 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Typography variant="body2">
                  Total Hits: {metrics.cacheStats.totalHits}
                </Typography>
                <Typography variant="body2">
                  Total Misses: {metrics.cacheStats.totalMisses}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Memory Usage
                </Typography>
                <Typography variant="body2">
                  Cache Size: {formatBytes(metrics.cacheStats.memoryUsage)}
                </Typography>
                <Typography variant="body2">
                  Total Entries: {metrics.cacheStats.totalEntries}
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion 
          expanded={expanded === 'jobs'} 
          onChange={handleAccordionChange('jobs')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Auto-Refresh Jobs ({metrics.activeJobs.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Interval</TableCell>
                    <TableCell>Success Count</TableCell>
                    <TableCell>Errors</TableCell>
                    <TableCell>Last Run</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics.activeJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.id}</TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={job.isRunning ? 'Running' : job.config.enabled ? 'Active' : 'Disabled'}
                          color={getJobStatusColor(job) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDuration(job.config.interval)}</TableCell>
                      <TableCell>{job.successCount}</TableCell>
                      <TableCell>{job.errors}</TableCell>
                      <TableCell>
                        {job.lastRun ? new Date(job.lastRun).toLocaleTimeString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {metrics.activeJobs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No active jobs
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        <Box mt={2}>
          <Typography variant="caption" color="textSecondary">
            Last updated: {new Date(metrics.lastUpdate).toLocaleTimeString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;