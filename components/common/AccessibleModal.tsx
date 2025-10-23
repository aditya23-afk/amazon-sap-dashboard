import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogProps, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useFocusTrap } from '../../hooks/useAccessibility';
import { ARIA_LABELS, KEYBOARD_KEYS } from '../../utils/accessibility';

interface AccessibleModalProps extends Omit<DialogProps, 'aria-labelledby' | 'aria-describedby'> {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  closeButtonAriaLabel?: string;
}

/**
 * Accessible modal component with proper focus management and ARIA attributes
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  title,
  description,
  onClose,
  children,
  actions,
  closeButtonAriaLabel = ARIA_LABELS.CLOSE_DIALOG,
  open,
  ...props
}) => {
  const focusTrapRef = useFocusTrap(open);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.ESCAPE && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined;

  return (
    <Dialog
      {...props}
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      role="dialog"
      aria-modal="true"
      sx={{
        '& .MuiDialog-paper': {
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
        },
        ...props.sx,
      }}
    >
      <Box ref={focusTrapRef} className="focus-trap">
        <DialogTitle 
          id={titleId}
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pr: 1,
          }}
        >
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label={closeButtonAriaLabel}
            sx={{
              '&:focus-visible': {
                outline: '3px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {description && (
            <Typography 
              id={descriptionId}
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {description}
            </Typography>
          )}
          {children}
        </DialogContent>

        {actions && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            {actions}
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
};

export default AccessibleModal;