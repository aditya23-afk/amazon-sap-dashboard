import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Alert,
  Button,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Refresh as RefreshIcon, SignalWifi4Bar, SignalWifi2Bar, SignalWifi1Bar } from '@mui/icons-material';

export interface LoadingStage {
  id: string;
  label: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number; // in milliseconds
}

export interface ProgressiveLoaderProps {
  children: React.ReactNode;
  loadingStages: LoadingStage[];
  onStageLoad: (stageId: string) => Promise<any>;
  fallbackContent?: React.ReactNode;
  showNetworkStatus?: boolean;
  enableOfflineMode?: boolean;
}

export interface NetworkStatus {
  online: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  loadingStages,
  onStageLoad,
  fallbackContent,
  showNetworkStatus = true,
  enableOfflineMode = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loadedStages, setLoadedStages] = useState<Set<string>>(new Set());
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setNetworkStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
      });
    };

    const handleOnline = () => {
      updateNetworkStatus();
      setIsOfflineMode(false);
    };

    const handleOffline = () => {
      updateNetworkStatus();
      if (enableOfflineMode) {
        setIsOfflineMode(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode]);

  // Progressive loading logic
  const loadStage = useCallback(async (stage: LoadingStage) => {
    if (loadedStages.has(stage.id) || !networkStatus.online) return;

    setCurrentStage(stage.id);
    setError(null);

    try {
      await onStageLoad(stage.id);
      setLoadedStages((prev: Set<string>) => new Set([...prev, stage.id]));
    } catch (err) {
      setError(`Failed to load ${stage.label}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCurrentStage(null);
    }
  }, [loadedStages, networkStatus.online, onStageLoad]);

  // Load stages based on priority and network conditions
  useEffect(() => {
    if (!networkStatus.online && !enableOfflineMode) return;

    const sortedStages = [...loadingStages].sort((a: LoadingStage, b: LoadingStage) => {
      const priorityOrder: Record<'critical' | 'high' | 'medium' | 'low', number> = { critical: 1, high: 2, medium: 3, low: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Determine how many stages to load based on network speed
    const getStageLimit = () => {
      if (isOfflineMode) return 0;
      
      switch (networkStatus.effectiveType) {
        case '4g':
          return sortedStages.length; // Load all stages
        case '3g':
          return Math.min(sortedStages.length, 6); // Load most stages
        case '2g':
          return Math.min(sortedStages.length, 3); // Load critical and high priority only
        case 'slow-2g':
          return Math.min(sortedStages.length, 2); // Load critical only
        default:
          return Math.min(sortedStages.length, 4); // Conservative default
      }
    };

    const stageLimit = getStageLimit();
    const stagesToLoad = sortedStages.slice(0, stageLimit);

    // Load stages sequentially with delays based on network speed
    const loadSequentially = async () => {
      for (const stage of stagesToLoad) {
        if (!loadedStages.has(stage.id)) {
          await loadStage(stage);
          
          // Add delay between stages for slower connections
          if (networkStatus.effectiveType === '2g' || networkStatus.effectiveType === 'slow-2g') {
            await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 500));
          }
        }
      }
    };

    loadSequentially();
  }, [loadingStages, loadStage, networkStatus, isOfflineMode, loadedStages, enableOfflineMode]);

  const getNetworkIcon = () => {
    if (!networkStatus.online) return null;
    
    switch (networkStatus.effectiveType) {
      case '4g':
        return <SignalWifi4Bar color="success" />;
      case '3g':
        return <SignalWifi2Bar color="warning" />;
      case '2g':
      case 'slow-2g':
        return <SignalWifi1Bar color="error" />;
      default:
        return <SignalWifi2Bar color="info" />;
    }
  };

  const getLoadingProgress = () => {
    const totalStages = loadingStages.length;
    const completedStages = loadedStages.size;
    return (completedStages / totalStages) * 100;
  };

  const criticalStagesLoaded = loadingStages
    .filter(stage => stage.priority === 'critical')
    .every(stage => loadedStages.has(stage.id));

  const handleRetry = () => {
    setError(null);
    setLoadedStages(new Set());
  };

  // Offline mode
  if (isOfflineMode && enableOfflineMode) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          You're currently offline. Showing cached content.
        </Alert>
        {fallbackContent || (
          <Box>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        )}
      </Box>
    );
  }

  // Error state
  if (error && !criticalStagesLoaded) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
        >
          Retry Loading
        </Button>
      </Box>
    );
  }

  // Loading state
  if (!criticalStagesLoaded || currentStage) {
    return (
      <Box sx={{ p: 2 }}>
        {/* Network status indicator */}
        {showNetworkStatus && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            {getNetworkIcon()}
            <Typography variant="caption" color="text.secondary">
              {networkStatus.online 
                ? `${networkStatus.effectiveType?.toUpperCase()} connection`
                : 'Offline'
              }
            </Typography>
          </Box>
        )}

        {/* Loading progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              {currentStage 
                ? `Loading ${loadingStages.find((s: LoadingStage) => s.id === currentStage)?.label}...`
                : 'Preparing dashboard...'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(getLoadingProgress())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getLoadingProgress()}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Loading skeletons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: isMobile ? 2 : 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={isMobile ? 200 : 150}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>

        {/* Network optimization tip */}
        {(networkStatus.effectiveType === '2g' || networkStatus.effectiveType === 'slow-2g') && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Slow connection detected. Loading essential content first.
          </Alert>
        )}
      </Box>
    );
  }

  // Render children when critical stages are loaded
  return (
    <Box>
      {/* Show partial loading indicator if non-critical stages are still loading */}
      {loadedStages.size < loadingStages.length && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={getLoadingProgress()}
            sx={{ height: 2 }}
          />
        </Box>
      )}
      
      {children}
      
      {/* Show error for non-critical stages */}
      {error && criticalStagesLoaded && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2 }}
          action={
            <Button size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          Some content failed to load: {error}
        </Alert>
      )}
    </Box>
  );
};

export default ProgressiveLoader;