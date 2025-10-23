import React, { forwardRef } from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { ARIA_LABELS } from '../../utils/accessibility';

interface AccessibleButtonProps extends Omit<ButtonProps, 'aria-label'> {
  ariaLabel?: string;
  loading?: boolean;
  loadingText?: string;
  description?: string;
}

/**
 * Accessible button component with proper ARIA attributes and keyboard support
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    ariaLabel, 
    loading = false, 
    loadingText = 'Loading', 
    description,
    children,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      // Ensure button can be activated with Enter and Space
      if (event.key === 'Enter' || event.key === ' ') {
        if (!loading && !disabled) {
          event.preventDefault();
          (event.target as HTMLButtonElement).click();
        }
      }
    };

    return (
      <Button
        ref={ref}
        {...props}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={description ? `${props.id}-description` : undefined}
        aria-busy={loading}
        className={`accessible-button ${props.className || ''}`}
        sx={{
          minHeight: 44,
          minWidth: 44,
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
          ...props.sx,
        }}
      >
        {loading && (
          <CircularProgress 
            size={16} 
            sx={{ mr: 1 }} 
            aria-label={loadingText}
          />
        )}
        {children}
        
        {/* Hidden description for screen readers */}
        {description && (
          <span 
            id={`${props.id}-description`}
            className="sr-only"
          >
            {description}
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;