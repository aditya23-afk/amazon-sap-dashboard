import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Chip,
  IconButton,
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useDashboardCustomization } from '../../hooks/useDashboardCustomization';

interface WidgetCustomizationProps {
  className?: string;
}

const WidgetCustomization: React.FC<WidgetCustomizationProps> = ({ className }) => {
  const {
    toggleWidgetVisibility,
    moveWidget,
    saveLayout,
    loadLayout,
    deleteLayout,
    resetToDefault,
    state: { dashboard },
  } = useDashboardCustomization();

  const { layout, savedLayouts, currentLayoutId } = dashboard;
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleToggleVisibility = (widgetId: string) => {
    toggleWidgetVisibility(widgetId);
  };

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    moveWidget(widgetId, direction);
  };

  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName.trim());
      setLayoutName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoadLayout = (layoutId: string) => {
    loadLayout(layoutId);
  };

  const handleDeleteLayout = (layoutId: string) => {
    deleteLayout(layoutId);
    setDeleteConfirmId(null);
  };

  const handleResetToDefault = () => {
    resetToDefault();
  };

  const getWidgetTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      'kpi': 'KPI Widget',
      'line-chart': 'Line Chart',
      'bar-chart': 'Bar Chart',
      'pie-chart': 'Pie Chart',
      'doughnut-chart': 'Doughnut Chart',
      'gauge-chart': 'Gauge Chart',
    };
    return typeLabels[type] || type;
  };

  const visibleWidgets = layout.filter(widget => widget.visible);
  const hiddenWidgets = layout.filter(widget => !widget.visible);

  return (
    <Box className={className}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Widget Customization
        </Typography>

        {/* Layout Management */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Layout Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={() => setSaveDialogOpen(true)}
              size="small"
            >
              Save Layout
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestoreIcon />}
              onClick={handleResetToDefault}
              size="small"
            >
              Reset to Default
            </Button>
          </Box>

          {/* Saved Layouts */}
          {savedLayouts.length > 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Saved Layouts:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {savedLayouts.map(layout => (
                  <Chip
                    key={layout.id}
                    label={layout.name}
                    variant={currentLayoutId === layout.id ? 'filled' : 'outlined'}
                    color={currentLayoutId === layout.id ? 'primary' : 'default'}
                    onClick={() => handleLoadLayout(layout.id)}
                    onDelete={!layout.isDefault ? () => setDeleteConfirmId(layout.id) : undefined}
                    deleteIcon={<DeleteIcon />}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Widget Visibility and Ordering */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Widget Order & Visibility
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Use arrow buttons to reorder widgets, toggle visibility with the switch
          </Typography>

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {layout.map((widget, index) => (
              <ListItem
                key={widget.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveWidget(widget.id, 'up')}
                      disabled={index === 0}
                      sx={{ p: 0.5 }}
                    >
                      <ArrowUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveWidget(widget.id, 'down')}
                      disabled={index === layout.length - 1}
                      sx={{ p: 0.5 }}
                    >
                      <ArrowDownIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <DragIcon color="action" sx={{ ml: 1 }} />
                </Box>
                
                <ListItemText
                  primary={widget.config.title}
                  secondary={getWidgetTypeLabel(widget.type)}
                  sx={{
                    opacity: widget.visible ? 1 : 0.6,
                  }}
                />
                
                <ListItemSecondaryAction>
                  <Tooltip title={widget.visible ? 'Hide widget' : 'Show widget'}>
                    <Switch
                      edge="end"
                      checked={widget.visible}
                      onChange={() => handleToggleVisibility(widget.id)}
                      color="primary"
                    />
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Summary */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Summary: {visibleWidgets.length} visible, {hiddenWidgets.length} hidden
          </Typography>
        </Box>
      </Paper>

      {/* Save Layout Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Current Layout</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Layout Name"
            fullWidth
            variant="outlined"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Enter a name for this layout..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveLayout}
            variant="contained"
            disabled={!layoutName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        maxWidth="sm"
      >
        <DialogTitle>Delete Layout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this layout? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button
            onClick={() => deleteConfirmId && handleDeleteLayout(deleteConfirmId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WidgetCustomization;