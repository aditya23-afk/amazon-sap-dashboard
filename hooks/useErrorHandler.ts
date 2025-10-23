import { useCallback } from 'react';
import { useNotifications } from '../components/notifications/NotificationProvider';
import { AppError, ErrorType, ErrorSeverity } from '../types/error';
import { ErrorUtils } from '../utils/errorUtils';

interface UseErrorHandlerOptions {
  showNotifications?: boolean;
  logErrors?: boolean;
  onError?: (error: AppError) => void;
}

interface ErrorHandlerResult {
  handleError: (error: Error | AppError, context?: Partial<AppError['context']>) => void;
  handleApiError: (error: any, endpoint?: string) => void;
  handleNetworkError: (error: Error) => void;
  handleValidationError: (field: string, message: string) => void;
  handleRenderingError: (component: string, error: Error) => void;
  createRetryAction: (operation: () => Promise<void>, errorMessage?: string) => () => Promise<void>;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}): ErrorHandlerResult => {
  const { showNotifications = true, logErrors = true, onError } = options;
  const { showNotification } = useNotifications();

  const processError = useCallback((error: AppError) => {
    // Log error if enabled
    if (logErrors) {
      ErrorUtils.logError(error);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }

    // Show notification if enabled
    if (showNotifications) {
      const notificationType = getNotificationType(error.severity);
      const userFriendlyMessage = ErrorUtils.getUserFriendlyMessage(error);
      
      const actions = [];
      
      // Add retry action if error is recoverable and has retry function
      if (error.recoverable && error.retryAction) {
        actions.push({
          label: 'Retry',
          action: error.retryAction,
          variant: 'contained' as const
        });
      }

      showNotification({
        type: notificationType,
        title: getErrorTitle(error.type),
        message: userFriendlyMessage,
        duration: getNotificationDuration(error.severity),
        persistent: error.severity === ErrorSeverity.CRITICAL,
        actions: actions.length > 0 ? actions : undefined
      });
    }
  }, [showNotifications, logErrors, onError, showNotification]);

  const handleError = useCallback((error: Error | AppError, context?: Partial<AppError['context']>) => {
    let appError: AppError;
    
    if ('id' in error && 'type' in error) {
      // Already an AppError
      appError = error as AppError;
      if (context) {
        appError.context = { ...appError.context, ...context };
      }
    } else {
      // Convert Error to AppError
      appError = ErrorUtils.fromError(error as Error, undefined, context);
    }
    
    processError(appError);
  }, [processError]);

  const handleApiError = useCallback((error: any, endpoint?: string) => {
    const appError = ErrorUtils.fromApiError(error, endpoint);
    processError(appError);
  }, [processError]);

  const handleNetworkError = useCallback((error: Error) => {
    const appError = ErrorUtils.fromNetworkError(error);
    processError(appError);
  }, [processError]);

  const handleValidationError = useCallback((field: string, message: string) => {
    const appError = ErrorUtils.fromValidationError(field, message);
    processError(appError);
  }, [processError]);

  const handleRenderingError = useCallback((component: string, error: Error) => {
    const appError = ErrorUtils.fromRenderingError(component, error);
    processError(appError);
  }, [processError]);

  const createRetryAction = useCallback((
    operation: () => Promise<void>,
    errorMessage: string = 'Operation failed'
  ) => {
    return async () => {
      try {
        await operation();
        
        // Show success notification
        if (showNotifications) {
          showNotification({
            type: 'success',
            title: 'Success',
            message: 'Operation completed successfully',
            duration: 3000
          });
        }
      } catch (error) {
        // Handle retry failure
        handleError(error as Error, { action: 'retry_operation' });
      }
    };
  }, [handleError, showNotifications, showNotification]);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
    handleRenderingError,
    createRetryAction
  };
};

// Helper functions
function getNotificationType(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      return 'error';
    case ErrorSeverity.MEDIUM:
      return 'warning';
    case ErrorSeverity.LOW:
      return 'info';
    default:
      return 'error';
  }
}

function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.API:
      return 'Data Error';
    case ErrorType.TIMEOUT:
      return 'Timeout Error';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.RENDERING:
      return 'Display Error';
    default:
      return 'Error';
  }
}

function getNotificationDuration(severity: ErrorSeverity): number {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 0; // Persistent
    case ErrorSeverity.HIGH:
      return 8000;
    case ErrorSeverity.MEDIUM:
      return 6000;
    case ErrorSeverity.LOW:
      return 4000;
    default:
      return 6000;
  }
}

export default useErrorHandler;