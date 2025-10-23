import React from 'react';
import { Box } from '@mui/material';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  id?: string;
}

/**
 * Live region component for screen reader announcements
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({ 
  message, 
  priority = 'polite',
  id = 'live-region'
}) => {
  return (
    <Box
      id={id}
      aria-live={priority}
      aria-atomic="true"
      className="live-region sr-only"
      sx={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      {message}
    </Box>
  );
};

export default LiveRegion;