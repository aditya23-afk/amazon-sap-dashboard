import React, { useState } from 'react';
import {
  Box,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Typography,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Tune as TuneIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

export interface MobileWidget {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  component: React.ReactNode;
  visible: boolean;
}

export interface MobileOptimizedContainerProps {
  widgets: MobileWidget[];
  onWidgetVisibilityChange: (widgetId: string, visible: boolean) => void;
  children?: React.ReactNode;
}

export const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({
  widgets,
  onWidgetVisibilityChange,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [customizationOpen, setCustomizationOpen] = useState(false);

  // Sort widgets by priority and visibility
  const sortedWidgets = React.useMemo(() => {
    const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 1, medium: 2, low: 3 };
    return widgets
      .filter((widget: MobileWidget) => widget.visible)
      .sort((a: MobileWidget, b: MobileWidget) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [widgets]);

  // Limit widgets on mobile based on priority
  const visibleWidgets = React.useMemo(() => {
    if (!isMobile) return sortedWidgets;
    
    // On mobile, show high priority widgets first, then medium, then low
    const highPriority = sortedWidgets.filter((w: MobileWidget) => w.priority === 'high');
    const mediumPriority = sortedWidgets.filter((w: MobileWidget) => w.priority === 'medium');
    const lowPriority = sortedWidgets.filter((w: MobileWidget) => w.priority === 'low');
    
    // Show all high priority, up to 2 medium priority, and 1 low priority on mobile
    return [
      ...highPriority,
      ...mediumPriority.slice(0, 2),
      ...lowPriority.slice(0, 1),
    ];
  }, [sortedWidgets, isMobile]);

  const handleWidgetToggle = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      onWidgetVisibilityChange(widgetId, !widget.visible);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Main content */}
      <Box>
        {children || (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {visibleWidgets.map((widget: MobileWidget) => (
              <Box
                key={widget.id}
                sx={{
                  width: '100%',
                  minHeight: isMobile ? '300px' : 'auto',
                }}
              >
                {widget.component}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Mobile customization FAB */}
      {isMobile && (
        <Fab
          color="primary"
          size="medium"
          onClick={() => setCustomizationOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <TuneIcon />
        </Fab>
      )}

      {/* Widget customization drawer */}
      <Drawer
        anchor="bottom"
        open={customizationOpen}
        onClose={() => setCustomizationOpen(false)}
        PaperProps={{
          sx: {
            maxHeight: '70vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Customize Widgets</Typography>
            <IconButton onClick={() => setCustomizationOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isMobile && 'On mobile, high priority widgets are shown first. Toggle visibility to customize your view.'}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Widget list */}
          <List>
            {widgets.map((widget: MobileWidget) => (
              <ListItem
                key={widget.id}
                sx={{
                  borderLeft: `4px solid ${getPriorityColor(widget.priority)}`,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                }}
              >
                <ListItemIcon>
                  {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={widget.title}
                  secondary={`Priority: ${widget.priority}`}
                />
                <Switch
                  checked={widget.visible}
                  onChange={() => handleWidgetToggle(widget.id)}
                  color="primary"
                />
              </ListItem>
            ))}
          </List>

          {/* Info text */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Priority levels: High (red) • Medium (orange) • Low (blue)
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};

export default MobileOptimizedContainer;