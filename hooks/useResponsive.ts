import { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

export interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  networkSpeed: 'fast' | 'slow' | 'offline';
}

export interface ResponsiveConfig {
  mobileBreakpoint?: 'xs' | 'sm' | 'md';
  tabletBreakpoint?: 'sm' | 'md' | 'lg';
  enableNetworkDetection?: boolean;
  enableOrientationDetection?: boolean;
}

export const useResponsive = (config: ResponsiveConfig = {}): ResponsiveState => {
  const {
    mobileBreakpoint = 'sm',
    tabletBreakpoint = 'md',
    enableNetworkDetection = true,
    enableOrientationDetection = true,
  } = config;

  const theme = useTheme();
  
  // Media queries
  const isMobile = useMediaQuery(theme.breakpoints.down(mobileBreakpoint));
  const isTablet = useMediaQuery(theme.breakpoints.between(mobileBreakpoint, tabletBreakpoint));
  const isDesktop = useMediaQuery(theme.breakpoints.up(tabletBreakpoint));
  
  // Screen size detection
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [networkSpeed, setNetworkSpeed] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [touchDevice, setTouchDevice] = useState(false);

  // Determine screen size
  const getScreenSize = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    return 'xl';
  };

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    setTouchDevice(checkTouchDevice());
  }, []);

  // Orientation detection
  useEffect(() => {
    if (!enableOrientationDetection) return;

    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [enableOrientationDetection]);

  // Network speed detection
  useEffect(() => {
    if (!enableNetworkDetection) return;

    const updateNetworkSpeed = () => {
      if (!navigator.onLine) {
        setNetworkSpeed('offline');
        return;
      }

      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        const { effectiveType, downlink } = connection;
        
        if (effectiveType === '4g' && downlink > 1.5) {
          setNetworkSpeed('fast');
        } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 1.5)) {
          setNetworkSpeed('slow');
        } else {
          setNetworkSpeed('slow');
        }
      } else {
        // Fallback: assume fast connection if no network API
        setNetworkSpeed('fast');
      }
    };

    const handleOnline = () => updateNetworkSpeed();
    const handleOffline = () => setNetworkSpeed('offline');

    updateNetworkSpeed(); // Initial check
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableNetworkDetection]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize: getScreenSize(),
    orientation,
    touchDevice,
    networkSpeed,
  };
};

// Hook for responsive grid columns
export const useResponsiveColumns = (
  mobileColumns: number = 1,
  tabletColumns: number = 2,
  desktopColumns: number = 4
) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile) return mobileColumns;
  if (isTablet) return tabletColumns;
  return desktopColumns;
};

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    container: isMobile ? 1 : isTablet ? 2 : 3,
    item: isMobile ? 8 : isTablet ? 12 : 16,
    section: isMobile ? 16 : isTablet ? 24 : 32,
  };
};

// Hook for responsive font sizes
export const useResponsiveFontSizes = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    h1: isMobile ? '1.75rem' : isTablet ? '2rem' : '2.5rem',
    h2: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem',
    h3: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
    h4: isMobile ? '1.1rem' : isTablet ? '1.25rem' : '1.5rem',
    h5: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.25rem',
    h6: isMobile ? '0.9rem' : isTablet ? '1rem' : '1rem',
    body1: isMobile ? '0.875rem' : '1rem',
    body2: isMobile ? '0.75rem' : '0.875rem',
    caption: isMobile ? '0.7rem' : '0.75rem',
  };
};

export default useResponsive;