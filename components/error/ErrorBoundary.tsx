import React, { Component, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Card,
  CardContent,
  Stack,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { ErrorBoundaryState, AppError } from '../../types/error';
import { ErrorUtils } from '../../utils/errorUtils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: AppError, retry: () => void) => ReactNode;
  onError?: (error: AppError) => void;
  isolate?: boolean; // If true, only catches errors from direct children
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorUtils.fromError(error, undefined, {
      component: 'ErrorBoundary',
      action: 'component_render'
    });

    // Log the error
    ErrorUtils.logError(appError);

    // Update state with error info
    this.setState({
      errorInfo,
      error
    });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(appError, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: AppError, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to an error tracking service
    console.error('Error reported to tracking service:', {
      error,
      errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const appError = ErrorUtils.fromError(this.state.error);
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(appError, this.handleRetry);
      }

      // Default error UI
      return <ErrorFallbackUI error={appError} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackUIProps {
  error: AppError;
  onRetry: () => void;
  variant?: 'minimal' | 'detailed' | 'fullscreen';
}

const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({ 
  error, 
  onRetry, 
  variant = 'detailed' 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyError = async () => {
    const errorDetails = {
      id: error.id,
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      details: error.details
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (variant === 'minimal') {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        <AlertTitle>Something went wrong</AlertTitle>
        {ErrorUtils.getUserFriendlyMessage(error)}
        <Button size="small" onClick={onRetry} sx={{ mt: 1 }}>
          Try Again
        </Button>
      </Alert>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          p: 3,
          bgcolor: 'background.default'
        }}
      >
        <Card sx={{ maxWidth: 600, width: '100%' }}>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <BugReportIcon sx={{ fontSize: 64, color: 'error.main' }} />
              
              <Typography variant="h4" component="h1" textAlign="center">
                Oops! Something went wrong
              </Typography>
              
              <Typography variant="body1" color="text.secondary" textAlign="center">
                {ErrorUtils.getUserFriendlyMessage(error)}
              </Typography>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={onRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                >
                  Go Home
                </Button>
                <Button
                  variant="text"
                  onClick={handleReload}
                >
                  Reload Page
                </Button>
              </Stack>

              <Box sx={{ width: '100%' }}>
                <Button
                  size="small"
                  onClick={() => setShowDetails(!showDetails)}
                  endIcon={
                    <ExpandMoreIcon
                      sx={{
                        transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}
                    />
                  }
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>

                <Collapse in={showDetails}>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                      Error ID: {error.id}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                      Type: {error.type}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                      Time: {new Date(error.timestamp).toLocaleString()}
                    </Typography>
                    {error.code && (
                      <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                        Code: {error.code}
                      </Typography>
                    )}
                    
                    <Button
                      size="small"
                      onClick={handleCopyError}
                      sx={{ mt: 1 }}
                    >
                      {copied ? 'Copied!' : 'Copy Error Details'}
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Default detailed variant
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error">
        <AlertTitle>Something went wrong</AlertTitle>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {ErrorUtils.getUserFriendlyMessage(error)}
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Try Again
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleReload}
          >
            Reload Page
          </Button>
        </Stack>

        <Box>
          <Button
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
              />
            }
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>

          <Collapse in={showDetails}>
            <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="caption" component="div">
                Error ID: {error.id}
              </Typography>
              <Typography variant="caption" component="div">
                Type: {error.type} | Time: {new Date(error.timestamp).toLocaleString()}
              </Typography>
              {error.code && (
                <Typography variant="caption" component="div">
                  Code: {error.code}
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>
      </Alert>
    </Box>
  );
};

export default ErrorBoundary;