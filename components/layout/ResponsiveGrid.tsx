import React from 'react';
import { Grid, Box, useTheme, useMediaQuery } from '@mui/material';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: number;
  priority?: 'high' | 'medium' | 'low';
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
}

export interface ResponsiveGridItemProps {
  children: React.ReactNode;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
  priority?: 'high' | 'medium' | 'low';
  mobileHidden?: boolean;
  tabletHidden?: boolean;
  desktopHidden?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 3,
}) => {
  return (
    <Grid container spacing={spacing} sx={{ width: '100%' }}>
      {children}
    </Grid>
  );
};

export const ResponsiveGridItem: React.FC<ResponsiveGridItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  priority = 'medium',
  mobileHidden = false,
  tabletHidden = false,
  desktopHidden = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Hide items based on screen size and priority
  const shouldHide = () => {
    if (isMobile && (mobileHidden || priority === 'low')) return true;
    if (isTablet && tabletHidden) return true;
    if (isDesktop && desktopHidden) return true;
    return false;
  };

  if (shouldHide()) {
    return null;
  }

  return (
    <Grid
      item
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      xl={xl}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // Priority-based ordering on mobile
        order: isMobile ? (priority === 'high' ? 1 : priority === 'medium' ? 2 : 3) : 'unset',
      }}
    >
      {children}
    </Grid>
  );
};

export default ResponsiveGrid;