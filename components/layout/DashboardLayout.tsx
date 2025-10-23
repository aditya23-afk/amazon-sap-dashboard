import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Box, 
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { LazyComponents } from '../../routes/LazyRoutes';
import { useResponsive, useResponsiveSpacing } from '../../hooks/useResponsive';
import SkipLink from '../common/SkipLink';
import LiveRegion from '../common/LiveRegion';
import { useLiveRegion, useKeyboardMode } from '../../hooks/useAccessibility';
import { ARIA_LABELS } from '../../utils/accessibility';

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { touchDevice, networkSpeed, orientation } = useResponsive();
  const spacing = useResponsiveSpacing();
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Accessibility hooks
  const { message: liveMessage, priority, announce } = useLiveRegion();
  const isKeyboardMode = useKeyboardMode();

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
      announce(mobileOpen ? 'Navigation menu closed' : 'Navigation menu opened');
    } else {
      setSidebarOpen(!sidebarOpen);
      announce(sidebarOpen ? 'Sidebar collapsed' : 'Sidebar expanded');
    }
  };

  const handleMobileToggle = () => {
    setMobileOpen(!mobileOpen);
    announce(mobileOpen ? 'Navigation menu closed' : 'Navigation menu opened');
  };

  // Update sidebar state when screen size changes
  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const drawerWidth = 240;
  const collapsedWidth = 60;

  return (
    <Box 
      sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}
      className={isKeyboardMode ? 'keyboard-navigation-active' : ''}
    >
      {/* Skip to content link for keyboard users */}
      <SkipLink targetId="dashboard-main-content" />
      
      {/* Live region for screen reader announcements */}
      <LiveRegion message={liveMessage} priority={priority} />

      <Header onMenuClick={handleSidebarToggle} />

      <Sidebar 
        open={sidebarOpen} 
        onToggle={handleSidebarToggle}
        mobileOpen={mobileOpen}
        onMobileToggle={handleMobileToggle}
      />

      <Box
        id="dashboard-main-content"
        component="main"
        className="dashboard-container"
        role="main"
        aria-label={ARIA_LABELS.DASHBOARD_MAIN}
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          p: spacing.container,
          mt: 8,
          ml: {
            xs: 0,
            md: sidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
          },
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          width: {
            xs: '100%',
            md: `calc(100% - ${sidebarOpen ? drawerWidth : collapsedWidth}px)`,
          },
          // Focus styles for skip link target
          '&:focus': {
            outline: 'none',
          },
          // Optimize for touch devices
          ...(touchDevice && {
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
          }),
          // Adjust for orientation changes on mobile
          ...(isMobile && orientation === 'landscape' && {
            mt: 6,
            p: 1,
          }),
          // Optimize for slow networks
          ...(networkSpeed === 'slow' && {
            '& img': {
              loading: 'lazy',
            },
          }),
        }}
      >
        <Fade in timeout={300}>
          <Box>
            <Routes>
              <Route path="/" element={<LazyComponents.Overview />} />
              <Route path="/revenue" element={<LazyComponents.Revenue />} />
              <Route path="/inventory" element={<LazyComponents.Inventory />} />
              <Route path="/customers" element={<LazyComponents.Customers />} />
              <Route path="/customer-service" element={<LazyComponents.CustomerServiceDashboard />} />
              <Route path="/financial" element={<LazyComponents.FinancialDashboard />} />
              <Route path="/inventory-dashboard" element={<LazyComponents.InventoryDashboard />} />
              <Route path="/reports" element={<LazyComponents.Reports />} />
              <Route path="/settings" element={<LazyComponents.Settings />} />
              <Route path="/realtime-demo" element={<LazyComponents.RealTimeDemo />} />
              <Route path="/error-demo" element={<LazyComponents.ErrorHandlingDemo />} />
              <Route path="/alert-demo" element={<LazyComponents.AlertDemo />} />
              <Route path="/widget-demo" element={<LazyComponents.WidgetDemo />} />
            </Routes>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default DashboardLayout;