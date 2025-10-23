# Dashboard Customization System

This module provides comprehensive dashboard customization features including widget visibility management, drag-and-drop reordering, layout persistence, and user preferences.

## Features

### Widget Visibility Toggle System
- Toggle individual widget visibility on/off
- Maintains widget state in Redux store
- Automatically saves preferences to localStorage
- Visual indicators for hidden widgets

### Widget Reordering Functionality
- Move widgets up/down in the layout order
- Simple arrow-based interface (fallback from drag-and-drop)
- Real-time preview of changes
- Persistent ordering across sessions

### Layout Management
- Save custom layouts with user-defined names
- Load previously saved layouts
- Delete custom layouts (except default)
- Reset to default layout option
- Multiple layout support with easy switching

### User Preference Persistence
- Automatic localStorage integration
- Manual save/load options
- Cross-session persistence
- Graceful fallback when localStorage unavailable

### Dashboard Settings
- Auto-refresh toggle and interval configuration
- Theme selection (light/dark mode)
- Refresh interval slider with preset options
- Settings persistence

## Components

### DashboardCustomization
Main customization interface with tabbed layout:
- **Widgets Tab**: Widget visibility and ordering controls
- **Settings Tab**: Auto-refresh and preference management
- **Appearance Tab**: Theme and visual settings

### WidgetCustomization
Dedicated widget management interface:
- Widget list with visibility toggles
- Up/down arrow controls for reordering
- Layout save/load/delete functionality
- Visual feedback for widget states

## Hooks

### useDashboardCustomization
Custom hook providing:
- Widget visibility management
- Layout operations (save/load/delete/reset)
- User preference updates
- localStorage integration
- Auto-save functionality

## Services

### PreferencesService
Utility service for localStorage operations:
- Save/load dashboard preferences
- Storage availability detection
- Error handling for storage operations
- Data validation and sanitization

## Usage

### Basic Widget Customization
```tsx
import { useDashboardCustomization } from '../hooks/useDashboardCustomization';

const MyComponent = () => {
  const { toggleWidgetVisibility, moveWidget } = useDashboardCustomization();
  
  // Toggle widget visibility
  const handleToggle = (widgetId: string) => {
    toggleWidgetVisibility(widgetId);
  };
  
  // Move widget up/down
  const handleMove = (widgetId: string, direction: 'up' | 'down') => {
    moveWidget(widgetId, direction);
  };
};
```

### Layout Management
```tsx
const { saveLayout, loadLayout, resetToDefault } = useDashboardCustomization();

// Save current layout
saveLayout('My Custom Layout');

// Load saved layout
loadLayout('layout-id');

// Reset to default
resetToDefault();
```

### Accessing Settings Dialog
The customization interface is accessible through:
1. Settings icon in the header (opens dialog)
2. Settings page route (`/settings`)
3. Direct component integration

## Data Structure

### Widget Layout
```typescript
interface WidgetLayout {
  id: string;
  type: WidgetType;
  position: { x: number; y: number; w: number; h: number };
  visible: boolean;
  config: WidgetConfig;
}
```

### Dashboard Layout
```typescript
interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetLayout[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### User Preferences
```typescript
interface UserPreferences {
  widgetVisibility: Record<string, boolean>;
  layoutOrder: string[];
  customSettings: Record<string, any>;
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
}
```

## Requirements Fulfilled

This implementation addresses the following requirements from task 7.2:

✅ **Widget visibility toggle system with user preferences**
- Individual widget show/hide functionality
- Persistent visibility state across sessions

✅ **Drag-and-drop widget reordering functionality**
- Implemented with up/down arrow controls (fallback approach)
- Real-time reordering with visual feedback

✅ **User preference persistence using localStorage**
- Automatic saving of all customizations
- Manual save/load options
- Cross-session persistence

✅ **Dashboard layout reset and default configuration options**
- Reset to default layout functionality
- Multiple saved layout support
- Default layout preservation

## Browser Compatibility

- Modern browsers with localStorage support
- Graceful degradation when localStorage unavailable
- Responsive design for mobile and desktop
- Accessibility features included

## Testing

Unit tests included for:
- Component rendering and interaction
- localStorage operations
- State management
- User preference handling

Run tests with:
```bash
npm test -- --testPathPattern=customization
```