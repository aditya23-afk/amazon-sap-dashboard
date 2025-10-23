# Dashboard Layout Components

This directory contains the core layout components for the Amazon SAP Dashboard, implementing a responsive design with navigation structure.

## Components

### DashboardLayout
The main layout component that orchestrates the entire dashboard structure:
- **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes
- **React Router Integration**: Handles routing between different dashboard views
- **State Management**: Manages sidebar open/close state for different screen sizes
- **Automatic Responsive Behavior**: Sidebar automatically collapses on mobile devices

### Header
The top navigation bar component:
- **Fixed Position**: Stays at the top during scrolling
- **Menu Toggle**: Button to open/close sidebar
- **Responsive Typography**: Adjusts font size based on screen size
- **Action Icons**: Notifications and settings (hidden on mobile)

### Sidebar
The navigation sidebar component:
- **Collapsible Design**: Can be expanded or collapsed
- **Mobile Responsive**: Transforms to overlay drawer on mobile devices
- **Navigation Menu**: Links to different dashboard sections with active state highlighting
- **User Profile Section**: Displays user information and profile menu
- **React Router Integration**: Uses React Router for navigation

### UserProfile
User profile component displayed in the sidebar:
- **Collapsed State**: Shows only avatar when sidebar is collapsed
- **Expanded State**: Shows full user information and role
- **Profile Menu**: Dropdown menu with profile, settings, and logout options
- **Responsive Design**: Adapts to sidebar state

## Features Implemented

### ✅ Responsive Dashboard Layout
- Mobile-first responsive design
- Breakpoints for mobile (< 900px), tablet, and desktop
- Automatic sidebar behavior based on screen size
- Smooth transitions between layout states

### ✅ Navigation Structure with React Router
- Route-based navigation between dashboard views
- Active route highlighting in sidebar
- Proper URL management for different dashboard sections
- Mobile-friendly navigation with automatic drawer closing

### ✅ Collapsible Sidebar
- Toggle functionality for desktop users
- Automatic collapse on mobile devices
- Smooth animations and transitions
- Icon-only mode when collapsed

### ✅ User Profile Section
- User information display
- Profile menu with common actions
- Responsive behavior based on sidebar state
- Professional styling with Material-UI components

### ✅ Mobile, Tablet, and Desktop Layouts
- **Mobile (< 900px)**: Overlay sidebar, compact header, touch-friendly navigation
- **Tablet (900px - 1200px)**: Collapsible sidebar, optimized spacing
- **Desktop (> 1200px)**: Full sidebar, expanded layout, all features visible

## Pages/Views Created

1. **Overview** (`/`) - Dashboard overview with KPIs
2. **Revenue** (`/revenue`) - Financial analytics and revenue trends
3. **Inventory** (`/inventory`) - Supply chain and inventory management
4. **Customers** (`/customers`) - Customer analytics and satisfaction metrics
5. **Reports** (`/reports`) - Comprehensive reports and export functionality

## Technical Implementation

### Responsive Breakpoints
```typescript
breakpoints: {
  values: {
    xs: 0,      // Mobile portrait
    sm: 600,    // Mobile landscape
    md: 900,    // Tablet
    lg: 1200,   // Desktop
    xl: 1536,   // Large desktop
  },
}
```

### State Management
- Uses React hooks for local component state
- Responsive behavior with `useMediaQuery` hook
- Automatic state updates on screen size changes

### Navigation Integration
- React Router DOM for client-side routing
- Programmatic navigation with `useNavigate`
- Active route detection with `useLocation`

### Material-UI Integration
- Consistent theming across all components
- Responsive utilities and breakpoint system
- Smooth transitions and animations
- Accessibility features built-in

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **Requirement 6.1**: Responsive design for desktop, tablet, and mobile
- **Requirement 6.3**: Mobile device optimization with touch interactions
- **Requirement 5.2**: User customization through sidebar toggle and preferences

## Usage

```tsx
import { DashboardLayout } from './components/layout';

function App() {
  return <DashboardLayout />;
}
```

The layout automatically handles:
- Route management
- Responsive behavior
- Sidebar state management
- Mobile navigation
- User profile display

## Testing

Unit tests are provided for:
- DashboardLayout component functionality
- Sidebar navigation and responsive behavior
- User interaction handling
- Route navigation testing

Run tests with: `npm test`