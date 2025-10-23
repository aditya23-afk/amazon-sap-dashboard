import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Button, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { NotificationOptions } from '../../types/error';

interface Notification extends NotificationOptions {
  id: string;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  queue: Notification[];
  maxVisible: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'PROCESS_QUEUE' };

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => string;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialState: NotificationState = {
  notifications: [],
  queue: [],
  maxVisible: 3
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const notification = action.payload;
      
      // If we're at max capacity, queue the notification
      if (state.notifications.length >= state.maxVisible) {
        return {
          ...state,
          queue: [...state.queue, notification]
        };
      }
      
      return {
        ...state,
        notifications: [...state.notifications, notification]
      };
    }
    
    case 'REMOVE_NOTIFICATION': {
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      
      // Process queue if we have space
      if (filteredNotifications.length < state.maxVisible && state.queue.length > 0) {
        const [nextNotification, ...remainingQueue] = state.queue;
        return {
          ...state,
          notifications: [...filteredNotifications, nextNotification],
          queue: remainingQueue
        };
      }
      
      return {
        ...state,
        notifications: filteredNotifications
      };
    }
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        queue: []
      };
    
    case 'PROCESS_QUEUE': {
      if (state.queue.length === 0 || state.notifications.length >= state.maxVisible) {
        return state;
      }
      
      const availableSlots = state.maxVisible - state.notifications.length;
      const notificationsToShow = state.queue.slice(0, availableSlots);
      const remainingQueue = state.queue.slice(availableSlots);
      
      return {
        ...state,
        notifications: [...state.notifications, ...notificationsToShow],
        queue: remainingQueue
      };
    }
    
    default:
      return state;
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const showNotification = useCallback((options: NotificationOptions): string => {
    const id = options.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notification: Notification = {
      ...options,
      id,
      timestamp: Date.now(),
      duration: options.duration ?? (options.type === 'error' ? 6000 : 4000)
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto-hide non-persistent notifications
    if (!notification.persistent && notification.duration && notification.duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, notification.duration);
    }
    
    return id;
  }, []);

  const hideNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    hideNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={state.notifications}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onClose }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        maxWidth: 400,
        width: '100%'
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </Box>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const handleClose = () => {
    onClose(notification.id);
  };

  const handleActionClick = (action: () => void) => {
    action();
    if (!notification.persistent) {
      handleClose();
    }
  };

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ position: 'relative', transform: 'none !important' }}
    >
      <Alert
        severity={notification.type}
        onClose={handleClose}
        sx={{ width: '100%', alignItems: 'flex-start' }}
        action={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
            {notification.actions?.map((action, index) => (
              <Button
                key={index}
                size="small"
                variant={action.variant || 'text'}
                onClick={() => handleActionClick(action.action)}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                {action.label}
              </Button>
            ))}
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ p: 0.25 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle sx={{ mb: notification.message ? 1 : 0 }}>
          {notification.title}
        </AlertTitle>
        {notification.message && (
          <Box component="div" sx={{ fontSize: '0.875rem' }}>
            {notification.message}
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;