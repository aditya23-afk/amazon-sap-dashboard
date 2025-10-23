# Error Handling and User Feedback System

This directory contains the comprehensive error handling and user feedback system implemented for the Amazon SAP Dashboard. The system provides robust error recovery, user-friendly notifications, and fallback UI components.

## Components

### ErrorBoundary
A React error boundary component that catches JavaScript errors anywhere in the component tree and displays a fallback UI.

**Features:**
- Catches and logs unhandled component errors
- Provides user-friendly error messages
- Supports retry functionality
- Offers multiple display variants (minimal, detailed, fullscreen)
- Integrates with error tracking services
- Allows custom fallback components

**Usage:**
```tsx
import ErrorBoundary from './components/error/ErrorBoundary';

<ErrorBoundary
  onError={(error) => console.log('Error occurred:', error)}
  fallback={(error, retry) => <CustomErrorUI error={error} onRetry={retry} />}
>
  <YourComponent />
</ErrorBoundary>
```

### NotificationProvider
A context-based notification system that manages toast notifications throughout the application.

**Features:**
- Multiple notification types (success, error, warning, info)
- Queue management with configurable max visible notifications
- Auto-dismiss with customizable durations
- Persistent notifications for critical issues
- Action buttons for user interactions
- Responsive positioning

**Usage:**
```tsx
import { NotificationProvider, useNotifications } from './components/notifications/NotificationProvider';

// Wrap your app
<NotificationProvider>
  <App />
</NotificationProvider>

// Use in components
const { showNotification } = useNotifications();

showNotification({
  type: 'error',
  title: 'Connection Failed',
  message: 'Unable to connect to server',
  actions: [
    {
      label: 'Retry',
      action: () => retryConnection(),
      variant: 'contained'
    }
  ]
});
```

## Utilities

### ErrorUtils
A comprehensive utility class for creating, managing, and processing application errors.

**Key Methods:**
- `createError()` - Create structured AppError objects
- `fromError()` - Convert JavaScript Error to AppError
- `fromApiError()` - Handle API-specific errors
- `fromNetworkError()` - Handle network connectivity issues
- `getUserFriendlyMessage()` - Generate user-friendly error messages
- `shouldRetry()` - Determine if an error is retryable
- `withRetry()` - Execute operations with retry logic

### useErrorHandler Hook
A React hook that provides error handling functionality with automatic notifications.

**Features:**
- Automatic error logging and notification
- Context-aware error processing
- Retry action creation
- Integration with notification system

**Usage:**
```tsx
const { handleError, createRetryAction } = useErrorHandler();

// Handle different error types
handleApiError(apiError, '/api/endpoint');
handleNetworkError(networkError);
handleValidationError('email', 'Invalid email format');

// Create retry actions
const retryAction = createRetryAction(async () => {
  await saveData();
}, 'Failed to save data');
```

## Fallback Components

### ChartFallback
Provides fallback UI when chart components fail to render, offering multiple display options.

**Variants:**
- **Table**: Shows data in tabular format
- **Summary**: Displays statistical summary of data
- **Minimal**: Simple error message with retry option

**Features:**
- Data preservation when charts fail
- Export functionality for fallback data
- Retry mechanisms
- Responsive design

## Error Types and Severity

### Error Types
- `NETWORK` - Network connectivity issues
- `API` - Server/API related errors
- `TIMEOUT` - Request timeout errors
- `VALIDATION` - Data validation failures
- `RENDERING` - Component rendering failures
- `UNKNOWN` - Unclassified errors

### Error Severity Levels
- `LOW` - Minor issues, informational
- `MEDIUM` - Moderate issues, may affect functionality
- `HIGH` - Serious issues, significant impact
- `CRITICAL` - Severe issues, system-wide impact

## Retry Mechanisms

The system implements intelligent retry logic with:
- **Exponential Backoff**: Increasing delays between retry attempts
- **Jitter**: Random delay variation to prevent thundering herd
- **Conditional Retries**: Only retry appropriate error types
- **Max Attempts**: Configurable retry limits
- **User Control**: Manual retry options in UI

### Retry Configuration
```tsx
const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error) => error.recoverable
};
```

## Integration with Widgets

### BaseWidget Enhancement
The BaseWidget component has been enhanced with error handling:
- Error boundary integration
- Fallback component support
- Automatic error notification
- Retry functionality

### ChartWidget Enhancement
Chart widgets now include:
- Rendering error detection
- Automatic fallback to data tables
- Chart-specific error handling
- Data preservation on failure

## Best Practices

### Error Handling
1. **Always provide context** when handling errors
2. **Use appropriate error types** for different scenarios
3. **Implement retry logic** for recoverable errors
4. **Log errors** for debugging and monitoring
5. **Provide user-friendly messages** instead of technical details

### Notifications
1. **Choose appropriate severity levels** for different situations
2. **Use persistent notifications** for critical issues
3. **Provide action buttons** for user recovery options
4. **Keep messages concise** but informative
5. **Consider notification fatigue** - don't overwhelm users

### Fallback UI
1. **Preserve data** when possible in fallback components
2. **Provide alternative views** (table, summary) for failed charts
3. **Include retry options** in fallback UI
4. **Maintain consistent styling** with the rest of the application
5. **Test fallback scenarios** regularly

## Testing

The error handling system includes comprehensive tests:
- Error boundary behavior
- Notification system functionality
- Error utility functions
- Retry mechanisms
- Fallback component rendering

Run tests with:
```bash
npm test -- --testPathPattern="error"
```

## Demo

Visit `/error-demo` in the application to see the error handling system in action. The demo includes:
- Error simulation for different types
- Notification examples
- Fallback component demonstrations
- Interactive testing of retry mechanisms

## Configuration

### Environment Variables
- `REACT_APP_ERROR_TRACKING_ENABLED` - Enable/disable error tracking
- `REACT_APP_ERROR_TRACKING_DSN` - Error tracking service DSN
- `REACT_APP_NOTIFICATION_TIMEOUT` - Default notification timeout

### Runtime Configuration
Error handling behavior can be configured through the config service:
```tsx
import { configService } from '../services/configService';

configService.setErrorHandlingConfig({
  enableNotifications: true,
  enableRetry: true,
  maxRetryAttempts: 3,
  notificationTimeout: 5000
});
```

## Future Enhancements

Planned improvements include:
- Integration with external error tracking services (Sentry, Bugsnag)
- Advanced retry strategies (circuit breaker pattern)
- Error analytics and reporting
- A/B testing for error message effectiveness
- Offline error handling and queuing