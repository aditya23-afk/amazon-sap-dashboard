import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import DashboardCustomization from '../customization/DashboardCustomization';
import ExportButton from '../export/ExportButton';
import { AlertIndicator, useAlertContext } from '../alerts';
import AccessibleModal from '../common/AccessibleModal';
import { ARIA_LABELS } from '../../utils/accessibility';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { alerts, showNotificationCenter, showConfiguration } = useAlertContext();

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  return (
    <>
    <AppBar
      position="fixed"
      component="header"
      role="banner"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'primary.main',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label={ARIA_LABELS.TOGGLE_SIDEBAR}
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            '&:focus-visible': {
              outline: '3px solid',
              outlineColor: 'common.white',
              outlineOffset: '2px',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="h1"
          sx={{
            flexGrow: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Amazon SAP Dashboard
        </Typography>

        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          role="toolbar"
          aria-label="Dashboard actions"
        >
          {!isMobile && (
            <>
              <ExportButton
                dashboardElementId="dashboard-main-content"
                title="Amazon SAP Dashboard"
                variant="menu"
                size="small"
                aria-label={ARIA_LABELS.EXPORT_DATA}
              />
              <AlertIndicator
                alerts={alerts}
                variant="badge"
                onClick={showNotificationCenter}
                aria-label={`Notifications: ${alerts.length} alerts`}
              />
              <IconButton 
                color="inherit" 
                aria-label="Open dashboard settings"
                onClick={handleSettingsClick}
                sx={{
                  '&:focus-visible': {
                    outline: '3px solid',
                    outlineColor: 'common.white',
                    outlineOffset: '2px',
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>

    {/* Settings Dialog */}
    <AccessibleModal
      open={settingsOpen}
      onClose={handleSettingsClose}
      title="Dashboard Settings"
      description="Customize your dashboard appearance and behavior"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
      actions={
        <Button 
          onClick={handleSettingsClose} 
          variant="contained"
          sx={{
            '&:focus-visible': {
              outline: '3px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          Done
        </Button>
      }
    >
      <DashboardCustomization />
    </AccessibleModal>
    </>
  );
};

export default Header;