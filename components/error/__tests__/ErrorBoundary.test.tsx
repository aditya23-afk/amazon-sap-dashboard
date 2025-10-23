import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorBoundary from '../ErrorBoundary';
import { ErrorUtils } from '../../../utils/errorUtils';
import { ErrorType } from '../../../types/error';

const theme = createTheme();

const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    renderWithTheme(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        message: 'Test error'
      })
    );
  });

  it('allows retry functionality', () => {
    const { rerender } = renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Click retry button
    const retryButton = screen.getByText(/try again/i);
    fireEvent.click(retryButton);

    // Re-render with no error
    rerender(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('uses custom fallback when provided', () => {
    const customFallback = (error: any, retry: () => void) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={retry}>Custom retry</button>
      </div>
    );

    renderWithTheme(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/custom error: test error/i)).toBeInTheDocument();
    expect(screen.getByText(/custom retry/i)).toBeInTheDocument();
  });
});

describe('ErrorUtils', () => {
  it('creates error with correct properties', () => {
    const error = ErrorUtils.createError(
      ErrorType.API,
      'Test API error',
      { code: '500' }
    );

    expect(error).toMatchObject({
      type: ErrorType.API,
      message: 'Test API error',
      code: '500',
      recoverable: true
    });
    expect(error.id).toBeDefined();
    expect(error.timestamp).toBeDefined();
  });

  it('converts Error to AppError', () => {
    const originalError = new Error('Original error');
    const appError = ErrorUtils.fromError(originalError);

    expect(appError.message).toBe('Original error');
    expect(appError.type).toBeDefined();
    expect(appError.details?.originalError).toBe(originalError);
  });

  it('provides user-friendly messages', () => {
    const networkError = ErrorUtils.createError(ErrorType.NETWORK, 'Network failed');
    const message = ErrorUtils.getUserFriendlyMessage(networkError);

    expect(message).toContain('internet connection');
  });

  it('determines retry eligibility correctly', () => {
    const networkError = ErrorUtils.createError(ErrorType.NETWORK, 'Network failed');
    const validationError = ErrorUtils.createError(ErrorType.VALIDATION, 'Invalid input');

    expect(ErrorUtils.shouldRetry(networkError)).toBe(true);
    expect(ErrorUtils.shouldRetry(validationError)).toBe(false);
  });
});