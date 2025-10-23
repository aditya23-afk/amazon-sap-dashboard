import { useEffect, useRef, useState, useCallback } from 'react';
import { FocusManager, ScreenReader, KEYBOARD_KEYS } from '../utils/accessibility';

/**
 * Hook for managing focus trapping in modals and dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<() => void>();

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save current focus
    restoreFocusRef.current = FocusManager.saveFocus();
    
    // Trap focus in container
    const cleanup = FocusManager.trapFocus(containerRef.current);

    return () => {
      cleanup();
      // Restore focus when trap is deactivated
      if (restoreFocusRef.current) {
        restoreFocusRef.current();
      }
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for keyboard navigation in lists and grids
 */
export const useKeyboardNavigation = (
  items: any[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    columns?: number;
    loop?: boolean;
    onSelect?: (index: number) => void;
  } = {}
) => {
  const { orientation = 'vertical', columns = 1, loop = true, onSelect } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!items.length) return;

    let newIndex = focusedIndex;
    const maxIndex = items.length - 1;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_UP:
        if (orientation === 'grid') {
          newIndex = Math.max(0, focusedIndex - columns);
        } else if (orientation === 'vertical') {
          newIndex = loop ? (focusedIndex > 0 ? focusedIndex - 1 : maxIndex) : Math.max(0, focusedIndex - 1);
        }
        break;

      case KEYBOARD_KEYS.ARROW_DOWN:
        if (orientation === 'grid') {
          newIndex = Math.min(maxIndex, focusedIndex + columns);
        } else if (orientation === 'vertical') {
          newIndex = loop ? (focusedIndex < maxIndex ? focusedIndex + 1 : 0) : Math.min(maxIndex, focusedIndex + 1);
        }
        break;

      case KEYBOARD_KEYS.ARROW_LEFT:
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = loop ? (focusedIndex > 0 ? focusedIndex - 1 : maxIndex) : Math.max(0, focusedIndex - 1);
        }
        break;

      case KEYBOARD_KEYS.ARROW_RIGHT:
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = loop ? (focusedIndex < maxIndex ? focusedIndex + 1 : 0) : Math.min(maxIndex, focusedIndex + 1);
        }
        break;

      case KEYBOARD_KEYS.HOME:
        newIndex = 0;
        break;

      case KEYBOARD_KEYS.END:
        newIndex = maxIndex;
        break;

      case KEYBOARD_KEYS.ENTER:
      case KEYBOARD_KEYS.SPACE:
        if (onSelect) {
          event.preventDefault();
          onSelect(focusedIndex);
          return;
        }
        break;

      default:
        return;
    }

    if (newIndex !== focusedIndex) {
      event.preventDefault();
      setFocusedIndex(newIndex);
    }
  }, [focusedIndex, items.length, orientation, columns, loop, onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
  };
};

/**
 * Hook for screen reader announcements
 */
export const useScreenReader = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    ScreenReader.announce(message, priority);
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading,
  };
};

/**
 * Hook for managing live regions
 */
export const useLiveRegion = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((newMessage: string, newPriority: 'polite' | 'assertive' = 'polite') => {
    setMessage(newMessage);
    setPriority(newPriority);
    
    // Clear message after announcement
    setTimeout(() => setMessage(''), 1000);
  }, []);

  return {
    message,
    priority,
    announce,
  };
};

/**
 * Hook for detecting keyboard navigation mode
 */
export const useKeyboardMode = () => {
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.TAB) {
        setIsKeyboardMode(true);
        document.body.classList.add('keyboard-navigation-active');
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardMode(false);
      document.body.classList.remove('keyboard-navigation-active');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardMode;
};

/**
 * Hook for managing ARIA attributes
 */
export const useAriaAttributes = (
  element: HTMLElement | null,
  attributes: Record<string, string | boolean | undefined>
) => {
  useEffect(() => {
    if (!element) return;

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined) {
        element.removeAttribute(key);
      } else {
        element.setAttribute(key, String(value));
      }
    });
  }, [element, attributes]);
};

/**
 * Hook for accessible form validation
 */
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { announceError } = useScreenReader();

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors((prev: Record<string, string>) => ({ ...prev, [fieldName]: error }));
    announceError(`${fieldName}: ${error}`);
  }, [announceError]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors((prev: Record<string, string>) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getFieldProps = useCallback((fieldName: string) => ({
    'aria-invalid': !!errors[fieldName],
    'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
  }), [errors]);

  const getErrorProps = useCallback((fieldName: string) => ({
    id: `${fieldName}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }), []);

  return {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    getFieldProps,
    getErrorProps,
  };
};

/**
 * Hook for accessible data loading states
 */
export const useAccessibleLoading = (isLoading: boolean, loadingMessage?: string) => {
  const { announce } = useScreenReader();

  useEffect(() => {
    if (isLoading) {
      announce(loadingMessage || 'Loading data', 'polite');
    }
  }, [isLoading, loadingMessage, announce]);

  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
  };
};