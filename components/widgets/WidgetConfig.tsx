import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  Divider,
  Slider,
  Chip,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { WidgetConfig, ChartType } from '../../types';

interface WidgetConfigProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: WidgetConfig) => void;
  initialConfig?: Partial<WidgetConfig>;
  widgetType: 'kpi' | 'chart';
}

interface ConfigState extends WidgetConfig {
  // Extended properties for UI configuration
  chartType?: ChartType;
  showLegend?: boolean;
  showGrid?: boolean;
  animationEnabled?: boolean;
  colorScheme?: string[];
  fontSize?: number;
  borderRadius?: number;
}

const defaultColors = [
  '#1976d2', '#dc004e', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
];

export const WidgetConfigDialog: React.FC<WidgetConfigProps> = ({
  open,
  onClose,
  onSave,
  initialConfig = {},
  widgetType
}) => {
  const [config, setConfig] = React.useState<ConfigState>({
    title: '',
    refreshInterval: 300000, // 5 minutes default
    customSettings: {},
    dataSource: '',
    filters: {},
    // UI specific defaults
    chartType: ChartType.LINE,
    showLegend: true,
    showGrid: true,
    animationEnabled: true,
    colorScheme: defaultColors.slice(0, 4),
    fontSize: 14,
    borderRadius: 8,
    ...initialConfig
  });



  const handleInputChange = (field: keyof ConfigState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (field: keyof ConfigState) => (
    _event: Event,
    newValue: number | number[]
  ) => {
    setConfig(prev => ({
      ...prev,
      [field]: newValue
    }));
  };

  const addColor = () => {
    setConfig(prev => ({
      ...prev,
      colorScheme: [...(prev.colorScheme || []), defaultColors[0]]
    }));
  };

  const removeColor = (index: number) => {
    setConfig(prev => ({
      ...prev,
      colorScheme: prev.colorScheme?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSave = () => {
    // Clean up the config to only include relevant fields
    const cleanConfig: WidgetConfig = {
      title: config.title,
      refreshInterval: config.refreshInterval,
      customSettings: {
        ...config.customSettings,
        chartType: config.chartType,
        showLegend: config.showLegend,
        showGrid: config.showGrid,
        animationEnabled: config.animationEnabled,
        colorScheme: config.colorScheme,
        fontSize: config.fontSize,
        borderRadius: config.borderRadius
      },
      dataSource: config.dataSource,
      filters: config.filters
    };

    onSave(cleanConfig);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Configure {widgetType === 'kpi' ? 'KPI' : 'Chart'} Widget
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Settings */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Basic Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Widget Title"
                value={config.title}
                onChange={handleInputChange('title')}
                fullWidth
                required
              />
              
              <TextField
                label="Data Source"
                value={config.dataSource}
                onChange={handleInputChange('dataSource')}
                fullWidth
                placeholder="e.g., /api/revenue-data"
              />

              <FormControl fullWidth>
                <InputLabel>Refresh Interval</InputLabel>
                <Select
                  value={config.refreshInterval}
                  onChange={handleInputChange('refreshInterval')}
                  label="Refresh Interval"
                >
                  <MenuItem value={60000}>1 minute</MenuItem>
                  <MenuItem value={300000}>5 minutes</MenuItem>
                  <MenuItem value={600000}>10 minutes</MenuItem>
                  <MenuItem value={1800000}>30 minutes</MenuItem>
                  <MenuItem value={3600000}>1 hour</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* Chart-specific Settings */}
          {widgetType === 'chart' && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Chart Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={config.chartType}
                    onChange={handleInputChange('chartType')}
                    label="Chart Type"
                  >
                    <MenuItem value={ChartType.LINE}>Line Chart</MenuItem>
                    <MenuItem value={ChartType.BAR}>Bar Chart</MenuItem>
                    <MenuItem value={ChartType.PIE}>Pie Chart</MenuItem>
                    <MenuItem value={ChartType.DOUGHNUT}>Doughnut Chart</MenuItem>
                    <MenuItem value={ChartType.GAUGE}>Gauge Chart</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.showLegend}
                        onChange={handleInputChange('showLegend')}
                      />
                    }
                    label="Show Legend"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.showGrid}
                        onChange={handleInputChange('showGrid')}
                      />
                    }
                    label="Show Grid"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.animationEnabled}
                        onChange={handleInputChange('animationEnabled')}
                      />
                    }
                    label="Enable Animation"
                  />
                </Box>
              </Box>
            </Box>
          )}

          <Divider />

          {/* Appearance Settings */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Appearance
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Font Size: {config.fontSize}px
                </Typography>
                <Slider
                  value={config.fontSize}
                  onChange={handleSliderChange('fontSize')}
                  min={10}
                  max={24}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Border Radius: {config.borderRadius}px
                </Typography>
                <Slider
                  value={config.borderRadius}
                  onChange={handleSliderChange('borderRadius')}
                  min={0}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* Color Scheme */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Color Scheme
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PaletteIcon />}
                    onClick={addColor}
                  >
                    Add Color
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {config.colorScheme?.map((color, index) => (
                    <Chip
                      key={index}
                      label={color}
                      onDelete={() => removeColor(index)}
                      sx={{
                        backgroundColor: color,
                        color: '#fff',
                        '& .MuiChip-deleteIcon': {
                          color: '#fff'
                        }
                      }}
                      onClick={() => {
                        // Color picker functionality can be implemented later
                        console.log('Color picker for index:', index);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={!config.title.trim()}
        >
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetConfigDialog;