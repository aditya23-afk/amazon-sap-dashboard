import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Fab,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions,
  FormControlLabel,
  Slider,
  Alert as MuiAlert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  AlertThreshold,
  AlertType,
  AlertSeverity,
  AlertCondition,
  NotificationSettings,
  AlertConfiguration
} from '../../types/alerts';

interface AlertConfigurationPanelProps {
  open: boolean;
  onClose: () => void;
  configuration: AlertConfiguration;
  onUpdateThreshold: (threshold: AlertThreshold) => void;
  onDeleteThreshold: (thresholdId: string) => void;
  onUpdateGlobalSettings: (settings: Partial<AlertConfiguration['globalSettings']>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
  </div>
);

const AlertConfigurationPanel: React.FC<AlertConfigurationPanelProps> = ({
  open,
  onClose,
  configuration,
  onUpdateThreshold,
  onDeleteThreshold,
  onUpdateGlobalSettings
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(configuration.globalSettings);

  useEffect(() => {
    setGlobalSettings(configuration.globalSettings);
  }, [configuration.globalSettings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateThreshold = () => {
    const newThreshold: AlertThreshold = {
      id: `threshold_${Date.now()}`,
      type: AlertType.INVENTORY_LOW_STOCK,
      name: 'New Alert Threshold',
      description: '',
      enabled: true,
      conditions: [
        { field: 'value', operator: 'gt', value: 0 }
      ],
      severity: AlertSeverity.WARNING,
      notificationSettings: {
        showToast: true,
        showInCenter: true,
        playSound: false,
        persistent: false,
        autoResolve: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingThreshold(newThreshold);
    setIsCreating(true);
  };

  const handleEditThreshold = (threshold: AlertThreshold) => {
    setEditingThreshold({ ...threshold });
    setIsCreating(false);
  };

  const handleSaveThreshold = () => {
    if (editingThreshold) {
      onUpdateThreshold(editingThreshold);
      setEditingThreshold(null);
      setIsCreating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingThreshold(null);
    setIsCreating(false);
  };

  const handleDeleteThreshold = (thresholdId: string) => {
    if (window.confirm('Are you sure you want to delete this alert threshold?')) {
      onDeleteThreshold(thresholdId);
    }
  };

  const handleGlobalSettingsChange = (key: keyof AlertConfiguration['globalSettings'], value: any) => {
    const newSettings = { ...globalSettings, [key]: value };
    setGlobalSettings(newSettings);
    onUpdateGlobalSettings({ [key]: value });
  };

  const updateThresholdField = (field: keyof AlertThreshold, value: any) => {
    if (editingThreshold) {
      setEditingThreshold({ ...editingThreshold, [field]: value });
    }
  };

  const updateCondition = (index: number, field: keyof AlertCondition, value: any) => {
    if (editingThreshold) {
      const newConditions = [...editingThreshold.conditions];
      newConditions[index] = { ...newConditions[index], [field]: value };
      setEditingThreshold({ ...editingThreshold, conditions: newConditions });
    }
  };

  const addCondition = () => {
    if (editingThreshold) {
      const newCondition: AlertCondition = {
        field: 'value',
        operator: 'gt',
        value: 0
      };
      setEditingThreshold({
        ...editingThreshold,
        conditions: [...editingThreshold.conditions, newCondition]
      });
    }
  };

  const removeCondition = (index: number) => {
    if (editingThreshold && editingThreshold.conditions.length > 1) {
      const newConditions = editingThreshold.conditions.filter((_, i) => i !== index);
      setEditingThreshold({ ...editingThreshold, conditions: newConditions });
    }
  };

  const updateNotificationSettings = (field: keyof NotificationSettings, value: any) => {
    if (editingThreshold) {
      setEditingThreshold({
        ...editingThreshold,
        notificationSettings: {
          ...editingThreshold.notificationSettings,
          [field]: value
        }
      });
    }
  };

  const renderThresholdEditor = () => {
    if (!editingThreshold) return null;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isCreating ? 'Create New Alert Threshold' : 'Edit Alert Threshold'}
          </Typography>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
            <TextField
              label="Name"
              value={editingThreshold.name}
              onChange={(e) => updateThresholdField('name', e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={editingThreshold.type}
                onChange={(e) => updateThresholdField('type', e.target.value)}
              >
                {Object.values(AlertType).map(type => (
                  <MenuItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={editingThreshold.description}
              onChange={(e) => updateThresholdField('description', e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ gridColumn: '1 / -1' }}
            />

            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={editingThreshold.severity}
                onChange={(e) => updateThresholdField('severity', e.target.value)}
              >
                {Object.values(AlertSeverity).map(severity => (
                  <MenuItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.enabled}
                  onChange={(e) => updateThresholdField('enabled', e.target.checked)}
                />
              }
              label="Enabled"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Conditions
          </Typography>

          {editingThreshold.conditions.map((condition, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                label="Field"
                value={condition.field}
                onChange={(e) => updateCondition(index, 'field', e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                >
                  <MenuItem value="gt">&gt;</MenuItem>
                  <MenuItem value="gte">&gt;=</MenuItem>
                  <MenuItem value="lt">&lt;</MenuItem>
                  <MenuItem value="lte">&lt;=</MenuItem>
                  <MenuItem value="eq">=</MenuItem>
                  <MenuItem value="neq">≠</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Value"
                type="number"
                value={condition.value}
                onChange={(e) => updateCondition(index, 'value', parseFloat(e.target.value) || 0)}
                size="small"
                sx={{ width: 100 }}
              />

              <TextField
                label="Unit"
                value={condition.unit || ''}
                onChange={(e) => updateCondition(index, 'unit', e.target.value)}
                size="small"
                sx={{ width: 80 }}
              />

              <IconButton
                size="small"
                onClick={() => removeCondition(index)}
                disabled={editingThreshold.conditions.length === 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addCondition}
            size="small"
            sx={{ mt: 1 }}
          >
            Add Condition
          </Button>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Notification Settings
          </Typography>

          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: '1fr 1fr' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.notificationSettings.showToast}
                  onChange={(e) => updateNotificationSettings('showToast', e.target.checked)}
                />
              }
              label="Show Toast"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.notificationSettings.showInCenter}
                  onChange={(e) => updateNotificationSettings('showInCenter', e.target.checked)}
                />
              }
              label="Show in Center"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.notificationSettings.playSound}
                  onChange={(e) => updateNotificationSettings('playSound', e.target.checked)}
                />
              }
              label="Play Sound"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.notificationSettings.persistent}
                  onChange={(e) => updateNotificationSettings('persistent', e.target.checked)}
                />
              }
              label="Persistent"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editingThreshold.notificationSettings.autoResolve}
                  onChange={(e) => updateNotificationSettings('autoResolve', e.target.checked)}
                />
              }
              label="Auto Resolve"
            />

            {editingThreshold.notificationSettings.autoResolve && (
              <TextField
                label="Auto Resolve Delay (minutes)"
                type="number"
                value={editingThreshold.notificationSettings.autoResolveDelay || 60}
                onChange={(e) => updateNotificationSettings('autoResolveDelay', parseInt(e.target.value) || 60)}
                size="small"
              />
            )}
          </Box>
        </CardContent>

        <CardActions>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSaveThreshold}
            variant="contained"
          >
            Save
          </Button>
          <Button
            startIcon={<CancelIcon />}
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          Alert Configuration
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Alert Thresholds" />
          <Tab label="Global Settings" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {renderThresholdEditor()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Alert Thresholds</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleCreateThreshold}
              variant="contained"
              disabled={editingThreshold !== null}
            >
              Add Threshold
            </Button>
          </Box>

          <List>
            {configuration.thresholds.map((threshold) => (
              <ListItem
                key={threshold.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{threshold.name}</Typography>
                      <Chip
                        label={threshold.severity}
                        size="small"
                        color={
                          threshold.severity === AlertSeverity.CRITICAL ? 'error' :
                          threshold.severity === AlertSeverity.ERROR ? 'error' :
                          threshold.severity === AlertSeverity.WARNING ? 'warning' : 'info'
                        }
                      />
                      {!threshold.enabled && (
                        <Chip label="Disabled" size="small" variant="outlined" />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {threshold.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {threshold.type.replace(/_/g, ' ')} • 
                        Conditions: {threshold.conditions.length}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Switch
                      checked={threshold.enabled}
                      onChange={(e) => onUpdateThreshold({ ...threshold, enabled: e.target.checked })}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEditThreshold(threshold)}
                      disabled={editingThreshold !== null}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteThreshold(threshold.id)}
                      disabled={editingThreshold !== null}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" gutterBottom>
            Global Alert Settings
          </Typography>

          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.enableSounds}
                  onChange={(e) => handleGlobalSettingsChange('enableSounds', e.target.checked)}
                />
              }
              label="Enable Alert Sounds"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.enableToasts}
                  onChange={(e) => handleGlobalSettingsChange('enableToasts', e.target.checked)}
                />
              }
              label="Enable Toast Notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.enableNotificationCenter}
                  onChange={(e) => handleGlobalSettingsChange('enableNotificationCenter', e.target.checked)}
                />
              }
              label="Enable Notification Center"
            />

            <Box>
              <Typography gutterBottom>
                Maximum Alerts in Center: {globalSettings.maxAlertsInCenter}
              </Typography>
              <Slider
                value={globalSettings.maxAlertsInCenter}
                onChange={(e, value) => handleGlobalSettingsChange('maxAlertsInCenter', value)}
                min={10}
                max={200}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Auto Refresh Interval: {globalSettings.autoRefreshInterval / 1000}s
              </Typography>
              <Slider
                value={globalSettings.autoRefreshInterval / 1000}
                onChange={(e, value) => handleGlobalSettingsChange('autoRefreshInterval', (value as number) * 1000)}
                min={10}
                max={300}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography gutterBottom>
                Default Notification Duration: {globalSettings.defaultNotificationDuration / 1000}s
              </Typography>
              <Slider
                value={globalSettings.defaultNotificationDuration / 1000}
                onChange={(e, value) => handleGlobalSettingsChange('defaultNotificationDuration', (value as number) * 1000)}
                min={1}
                max={30}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertConfigurationPanel;