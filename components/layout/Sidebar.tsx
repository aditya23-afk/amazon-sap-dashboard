import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  NotificationImportant as AlertIcon,
} from '@mui/icons-material';
import UserProfile from '../common/UserProfile';
import { useKeyboardNavigation } from '../../hooks/useAccessibility';
import { ARIA_LABELS, KEYBOARD_KEYS } from '../../utils/accessibility';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const menuItems = [
  { text: 'Overview', icon: <DashboardIcon />, path: '/' },
  { text: 'Revenue', icon: <TrendingUpIcon />, path: '/revenue' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Real-Time Demo', icon: <SpeedIcon />, path: '/realtime-demo' },
  { text: 'Alert Demo', icon: <AlertIcon />, path: '/alert-demo' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  onToggle, 
  mobileOpen = false, 
  onMobileToggle 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const drawerWidth = 240;
  const collapsedWidth = 60;

  // Keyboard navigation for menu items
  const { containerRef, focusedIndex } = useKeyboardNavigation(menuItems, {
    orientation: 'vertical',
    onSelect: (index) => {
      handleNavigation(menuItems[index].path);
    },
  });

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile && onMobileToggle) {
      onMobileToggle();
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar />
      <Divider />
      <List 
        ref={containerRef}
        sx={{ flex: 1 }}
        role="navigation"
        aria-label={ARIA_LABELS.MAIN_NAVIGATION}
      >
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              onKeyDown={(event) => {
                if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
                  event.preventDefault();
                  handleNavigation(item.path);
                }
              }}
              tabIndex={focusedIndex === index ? 0 : -1}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              aria-label={`Navigate to ${item.text}`}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.light + '20',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light + '30',
                  },
                },
                '&:focus-visible': {
                  outline: '3px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: '2px',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                }}
                aria-hidden="true"
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.text}
                  sx={{
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  }}
                />
              )}
              {/* Screen reader text for collapsed state */}
              {!open && (
                <span className="sr-only">{item.text}</span>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <UserProfile collapsed={!open} />
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        aria-label="Mobile navigation menu"
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
      aria-label="Main navigation sidebar"
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;