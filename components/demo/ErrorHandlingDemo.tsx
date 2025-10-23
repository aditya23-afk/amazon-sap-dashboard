import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import {
  Error as ErrorIcon,
  NetworkCheck as NetworkIcon,
  Timer as TimerIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { useNotifications } from '../notifications/NotificationProvider';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ErrorUtils } from '../../utils/errorUtils';
import { ErrorType, ErrorSeverity } from '../../types/error';
import ChartFallback from '../fallback/ChartFallback';
import { ChartData } from '../../types';

const ErrorHandlingDemo: React.FC = () => {
  const { showNotification } = useNotifications();
  const { handleError, handleApiError, handleNetworkError, createRetryAction } = useErrorHandler();
  const [demoData] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sample Data',
      data: [
        { x: 'Jan', y: 65 },
        { x: 'Feb', y: 59 },
        { x: 'Mar', y: 80 },
        { x: 'Apr', y: 81 },
        { x: 'May', y: 56 }
      ],
      backgroundColor: '#1976d2'
    }]
  });

  const simulateNetworkError = () => {
    const error = new Error('Failed to fetch data from server');
    handleNetworkError(error);
  };

  const simulateApiError = () => {
    const apiError = {
      response: {
        status: 500,
        statusText: 'Internal Server Error',
        data: { message: 'Database connection failed' }
      },
      message: 'Request failed with status code 500'
    };
    handleApiError(apiError, '/api/dashboard/metrics');
  };

  const simulateTimeoutError = () => {
    const timeoutError = ErrorUtils.fromTimeoutError(5000);
    handleError(timeoutError);
  };

  const simulateValidationError = () => {
    const validationError = ErrorUtils.fromValidationError('dateRange', 'End date must be after start date');
    handleError(validationError);
  };

  const simulateRenderingError = () => {
    const renderError = ErrorUtils.fromRenderingError('ChartWidget', new Error('Chart.js failed to initialize'));
    handleError(renderError);
  };

  const simulateSuccessNotification = () => {
    showNotification({
      type: 'success',
      title: 'Data Updated',
      message: 'Dashboard data has been successfully refreshed',
      duration: 3000
    });
  };

  const simulateWarningNotification = () => {
    showNotification({
      type: 'warning',
      title: 'Performance Warning',
      message: 'Dashboard is loading slowly due to high data volume',
      duration: 5000
    });
  };

  const simulateInfoNotification = () => {
    showNotification({
      type: 'info',
      title: 'Maintenance Scheduled',
      message: 'System maintenance is scheduled for tonight at 2 AM EST',
      duration: 0, // Persistent
      persistent: true,
      actions: [
        {
          label: 'Learn More',
          action: () => console.log('Learn more clicked'),
          variant: 'outlined'
        }
      ]
    });
  };

  const simulateRetryableError = () => {
    const retryAction = createRetryAction(async () => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification({
        type: 'success',
        title: 'Retry Successful',
        message: 'Operation completed after retry'
      });
    }, 'Failed to save dashboard settings');

    const error = ErrorUtils.createError(
      ErrorType.API,
      'Failed to save dashboard settings',
      {
        code: '503',
        severity: ErrorSeverity.MEDIUM,
        recoverable: true,
        retryAction
      }
    );

    handleError(error);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Error Handling & Notifications Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This demo showcases the error handling and user feedback systems implemented in the dashboard.
      </Typography>

      <Stack spacing={3}>
        {/* Error Simulation Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Error Simulation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test different types of errors and see how they are handled:
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="outlined"
                startIcon={<NetworkIcon />}
                onClick={simulateNetworkError}
                color="error"
              >
                Network Error
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ErrorIcon />}
                onClick={simulateApiError}
                color="error"
              >
                API Error (500)
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<TimerIcon />}
                onClick={simulateTimeoutError}
                color="warning"
              >
                Timeout Error
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BugIcon />}
                onClick={simulateValidationError}
                color="info"
              >
                Validation Error
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<BugIcon />}
                onClick={simulateRenderingError}
                color="error"
              >
                Rendering Error
              </Button>
              
              <Button
                variant="contained"
                onClick={simulateRetryableError}
                color="primary"
              >
                Retryable Error
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Notification Types Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test different notification types and behaviors:
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                onClick={simulateSuccessNotification}
                color="success"
              >
                Success
              </Button>
              
              <Button
                variant="contained"
                onClick={simulateWarningNotification}
                color="warning"
              >
                Warning
              </Button>
              
              <Button
                variant="contained"
                onClick={simulateInfoNotification}
                color="info"
              >
                Info (Persistent)
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Chart Fallback Demo */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Chart Fallback Components
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Examples of fallback UI when charts fail to render:
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Table Fallback (with data):
            </Typography>
            <ChartFallback
              data={demoData}
              title="Revenue Chart"
              variant="table"
              height={200}
              onRetry={() => showNotification({
                type: 'info',
                title: 'Retry Triggered',
                message: 'Chart rendering retry initiated'
              })}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Summary Fallback (with data):
            </Typography>
            <ChartFallback
              data={demoData}
              title="Inventory Chart"
              variant="summary"
              height={150}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Error Fallback (no data):
            </Typography>
            <ChartFallback
              error={ErrorUtils.createError(ErrorType.RENDERING, 'Chart.js initialization failed')}
              title="Customer Metrics"
              height={150}
              onRetry={() => showNotification({
                type: 'info',
                title: 'Chart Retry',
                message: 'Attempting to re-render chart'
              })}
            />
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            Implementation Features:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Global error boundary catches unhandled component errors</li>
            <li>Retry mechanisms with exponential backoff for API calls</li>
            <li>Toast notifications with different severity levels</li>
            <li>Chart fallback components with table and summary views</li>
            <li>User-friendly error messages and recovery actions</li>
            <li>Persistent notifications for critical issues</li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};

export default ErrorHandlingDemo;