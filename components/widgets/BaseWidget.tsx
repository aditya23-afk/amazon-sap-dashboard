import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  IconButton,
  Alert,
  Box,
  Typography,
  Skeleton
} from '@mui/material';
import { Refresh as RefreshIcon, MoreVert as MoreIcon } from '@mui/icons-material';
import { BaseWidgetProps } from '../../types';
import { AppError } from '../../types/error';
import ExportButton from '../export/ExportButton';
import ErrorBoundary from '../error/ErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { useAccessibleLoading, useScreenReader } from '../../hooks/useAccessibility';
import { ARIA_LABELS } from '../../utils/accessibility';

export const BaseWidget: React.FC<BaseWidgetProps & { 
  children: React.ReactNode;
  exportable?: boolean;
  exportData?: any;
  fallbackComponent?: React.ComponentType<{ error?: AppError; onRetry?: () => void }>;
}> = ({
  id,
  title,
  loading = false,
  error,
  refreshable = false,
  onRefresh,
  className,
  style,
  children,
  exportable = false,
  exportData,
  fallbackComponent: FallbackComponent
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const { handleError, createRetryAction } = useErrorHandler();
  const { announce, announceError } = useScreenReader();
  
  // Accessibility attributes for loading state
  const loadingProps = useAccessibleLoading(loading || isRefreshing, `Loading ${title}`);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    announce(`Refreshing ${title}`, 'polite');
    
    try {
      await onRefresh();
      announce(`${title} refreshed successfully`, 'polite');
    } catch (err) {
      const errorMessage = `Failed to refresh ${title}`;
      announceError(errorMessage);
      handleError(err as Error, { 
        component: title,
        action: 'widget_refresh'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderHeader = () => (
    <CardHeader
      title={
        <Typography 
          variant="h6" 
          component="h2" 
          id={`${id}-title`}
          sx={{ fontSize: '1.1rem', fontWeight: 600 }}
        >
          {title}
        </Typography>
      }
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {exportable && (
            <ExportButton
              dashboardElementId={id}
              data={exportData}
              title={title}
              variant="menu"
              size="small"
              aria-label={`Export ${title} data`}
            />
          )}
          {refreshable && (
            <IconButton
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              size="small"
              aria-label={`${ARIA_LABELS.REFRESH_DATA} for ${title}`}
              aria-describedby={loading || isRefreshing ? `${id}-loading` : undefined}
              sx={{
                '&:focus-visible': {
                  outline: '3px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <RefreshIcon 
                sx={{ 
                  animation: (loading || isRefreshing) ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
                aria-hidden="true"
              />
            </IconButton>
          )}
        </Box>
      }
      sx={{ pb: 1 }}
    />
  );

  const renderContent = () => {
    if (error) {
      // Use custom fallback component if provided
      if (FallbackComponent) {
        const retryAction = refreshable ? createRetryAction(async () => {
          await handleRefresh();
        }, `Failed to refresh ${title}`) : undefined;
        
        return (
          <CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
            <FallbackComponent 
              error={typeof error === 'string' ? undefined : error}
              onRetry={retryAction}
            />
          </CardContent>
        );
      }

      // Default error display
      return (
        <Alert 
          severity="error" 
          sx={{ m: 2 }}
          action={
            refreshable && (
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshIcon />
              </IconButton>
            )
          }
        >
          {typeof error === 'string' ? error : error?.message || 'An error occurred'}
        </Alert>
      );
    }

    if (loading) {
      return (
        <Box sx={{ p: 2 }}>
          <Skeleton 
            variant="rectangular" 
            height={200}
            aria-label={`Loading ${title} content`}
          />
          <span id={`${id}-loading`} className="sr-only">
            Loading {title} data, please wait
          </span>
        </Box>
      );
    }

    return (
      <CardContent sx={{ pt: 0, '&:last-child': { pb: 2 } }}>
        <ErrorBoundary
          onError={(error) => handleError(error, { 
            component: title,
            action: 'widget_render'
          })}
          fallback={(error, retry) => 
            FallbackComponent ? (
              <FallbackComponent error={error} onRetry={retry} />
            ) : (
              <Alert severity="error" sx={{ mt: 1 }}>
                Failed to render widget content
                <IconButton size="small" onClick={retry} sx={{ ml: 1 }}>
                  <RefreshIcon />
                </IconButton>
              </Alert>
            )
          }
        >
          {children}
        </ErrorBoundary>
      </CardContent>
    );
  };

  return (
    <Card
      id={id}
      className={`widget-card ${className || ''}`}
      component="section"
      role="region"
      aria-labelledby={`${id}-title`}
      aria-describedby={error ? `${id}-error` : undefined}
      {...loadingProps}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        '&:focus-within': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        ...style
      }}
      elevation={2}
    >
      {renderHeader()}
      {renderContent()}
      
      {/* Loading overlay */}
      {(loading || isRefreshing) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
          role="status"
          aria-label={`Loading ${title}`}
        >
          <CircularProgress 
            size={40} 
            aria-label="Loading indicator"
          />
        </Box>
      )}
    </Card>
  );
};

export default BaseWidget;