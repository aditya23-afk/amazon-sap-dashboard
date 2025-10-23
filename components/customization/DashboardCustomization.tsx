import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Widgets as WidgetsIcon,
  Palette as PaletteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useDashboardCustomization } from '../../hooks/useDashboardCustomization';
import WidgetCustomization from './WidgetCustomization';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customization-tabpanel-${index}`}
      aria-labelledby={`customization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DashboardCustomizationProps {
  className?: string;
}

const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({ className }) => {
  const {
    updatePreferences,
    setRefreshInterval,
    setTheme,
    saveToStorage,
    loadFromStorage,
    state: { dashboard, ui },
    isStorageAvailable,
  } = useDashboardCustomization();

  const { userPreferences, refreshInterval } = dashboard;
  const { theme } = ui;
  
  const [activeTab, setActiveTab] = useState(0);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [tempRefreshInterval, setTempRefreshInterval] = useState(refreshInterval / 1000 / 60); // Convert to minutes

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAutoRefreshToggle = (checked: boolean) => {
    updatePreferences({ autoRefresh: checked });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };

  const handleRefreshIntervalChange = (_event: Event, value: number | number[]) => {
    setTempRefreshInterval(Array.isArray(value) ? value[0] : value);
  };

  const handleRefreshIntervalSave = () => {
    const intervalMs = tempRefreshInterval * 60 * 1000; // Convert minutes to milliseconds
    setRefreshInterval(intervalMs);
    setShowSaveAlert(true);
  };

  const savePreferencesToLocalStorage = () => {
    saveToStorage();
    setShowSaveAlert(true);
  };

  const loadPreferencesFromLocalStorage = () => {
    loadFromStorage();
    // Update temp refresh interval from loaded state
    const savedInterval = refreshInterval / 1000 / 60;
    setTempRefreshInterval(savedInterval);
    setShowSaveAlert(true);
  };

  const refreshIntervalOptions = [
    { value: 1, label: '1 minute' },
    { value: 2, label: '2 minutes' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  return (
    <Box className={className}>
      <Paper elevation={1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="customization tabs">
            <Tab
              icon={<WidgetsIcon />}
              label="Widgets"
              id="customization-tab-0"
              aria-controls="customization-tabpanel-0"
            />
            <Tab
              icon={<SettingsIcon />}
              label="Settings"
              id="customization-tab-1"
              aria-controls="customization-tabpanel-1"
            />
            <Tab
              icon={<PaletteIcon />}
              label="Appearance"
              id="customization-tab-2"
              aria-controls="customization-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Widgets Tab */}
        <TabPanel value={activeTab} index={0}>
          <WidgetCustomization />
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Dashboard Settings
          </Typography>

          {/* Auto Refresh Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Auto Refresh
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={userPreferences.autoRefresh}
                  onChange={(e) => handleAutoRefreshToggle(e.target.checked)}
                />
              }
              label="Enable automatic data refresh"
              sx={{ mb: 2 }}
            />

            {userPreferences.autoRefresh && (
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Refresh Interval: {tempRefreshInterval} minutes
                </Typography>
                <Slider
                  value={tempRefreshInterval}
                  onChange={handleRefreshIntervalChange}
                  min={1}
                  max={60}
                  step={1}
                  marks={refreshIntervalOptions}
                  valueLabelDisplay="auto"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefreshIntervalSave}
                  size="small"
                >
                  Apply Refresh Interval
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Preferences Persistence */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Preferences Management
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Save your customizations to browser storage or load previously saved settings.
              {!isStorageAvailable && ' (Browser storage is not available)'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={savePreferencesToLocalStorage}
                disabled={!isStorageAvailable}
              >
                Save Preferences
              </Button>
              <Button
                variant="outlined"
                onClick={loadPreferencesFromLocalStorage}
                disabled={!isStorageAvailable}
              >
                Load Saved Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Appearance Settings
          </Typography>

          {/* Theme Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Theme
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={theme}
                label="Theme"
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Color Scheme Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Color Scheme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The dashboard uses Material-UI's color system. Charts and widgets automatically
              adapt to the selected theme for optimal visibility and accessibility.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Success Alert */}
      <Snackbar
        open={showSaveAlert}
        autoHideDuration={3000}
        onClose={() => setShowSaveAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSaveAlert(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardCustomization;