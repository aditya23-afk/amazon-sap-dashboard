# Widget Components

This directory contains the core widget components for the Amazon SAP Dashboard. These components provide the foundation for displaying business metrics, charts, and interactive visualizations.

## Components

### BaseWidget

The foundational component that provides common functionality for all widgets:

- Loading states with skeleton screens
- Error handling with retry functionality
- Refresh capability with loading indicators
- Consistent styling and layout

**Props:**
- `id`: Unique identifier for the widget
- `title`: Widget title displayed in header
- `loading`: Shows loading state when true
- `error`: Error message to display
- `refreshable`: Enables refresh button when true
- `onRefresh`: Callback function for refresh action
- `className`: Additional CSS classes
- `style`: Inline styles

### KPIWidget

Displays key performance indicators with trend information and target tracking:

- Large numeric display with formatting options
- Trend indicators with arrows and colors
- Target progress visualization
- Support for currency, percentage, and number formats

**Props:**
- All BaseWidget props plus:
- `value`: The numeric value to display
- `unit`: Unit of measurement (e.g., 'USD', '%', 'orders')
- `trend`: Trend direction (up, down, stable)
- `trendValue`: Numeric trend change
- `target`: Target value for progress tracking
- `format`: Display format ('number', 'currency', 'percentage')
- `precision`: Number of decimal places
- `color`: Custom color for the value display

### ChartWidget

Renders interactive charts using Chart.js:

- Support for line, bar, pie, doughnut, and gauge charts
- Responsive design with configurable dimensions
- Interactive features (zoom, pan, tooltips)
- Theme integration with Material-UI
- Custom gauge chart implementation

**Props:**
- All BaseWidget props plus:
- `chartType`: Type of chart to render
- `data`: Chart data in Chart.js format
- `options`: Chart.js configuration options
- `height`: Chart height in pixels
- `width`: Chart width in pixels
- `interactive`: Enable/disable user interactions

### WidgetConfigDialog

Configuration dialog for customizing widget appearance and behavior:

- Basic settings (title, data source, refresh interval)
- Chart-specific options (type, legend, grid, animation)
- Appearance customization (colors, fonts, borders)
- Real-time preview of changes

### WidgetFactory

Factory component for rendering widgets based on layout configuration:

- Automatic widget type detection
- Data binding and prop mapping
- Consistent refresh handling
- Error boundary integration

## Utilities

### widgetUtils.ts

Helper functions for widget management:

- `createDefaultWidgetConfig()`: Creates default configuration for widget types
- `createDefaultWidgetLayout()`: Creates layout configuration
- `getMinWidgetSize()` / `getMaxWidgetSize()`: Size constraints
- `validateWidgetConfig()`: Configuration validation
- `generateWidgetId()`: Unique ID generation
- `cloneWidgetLayout()`: Widget duplication
- `findNextAvailablePosition()`: Auto-positioning

## Usage Examples

### Basic KPI Widget

```tsx
import { KPIWidget } from './components/widgets';

<KPIWidget
  id="revenue-kpi"
  title="Total Revenue"
  value={1250000}
  unit="USD"
  format="currency"
  trend="up"
  trendValue={15.5}
  target={1200000}
  refreshable={true}
  onRefresh={() => fetchRevenueData()}
/>
```

### Chart Widget

```tsx
import { ChartWidget, ChartType } from './components/widgets';

const chartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue',
    data: [65000, 59000, 80000, 81000, 56000, 95000],
    borderColor: '#1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.1)'
  }]
};

<ChartWidget
  id="revenue-chart"
  title="Revenue Trend"
  chartType={ChartType.LINE}
  data={chartData}
  height={300}
  refreshable={true}
  onRefresh={() => fetchChartData()}
/>
```

### Using Widget Factory

```tsx
import { WidgetFactory } from './components/widgets';

const widgetLayout = {
  id: 'widget-1',
  type: WidgetType.KPI,
  position: { x: 0, y: 0, w: 4, h: 2 },
  visible: true,
  config: {
    title: 'Revenue',
    refreshInterval: 300000,
    customSettings: {
      format: 'currency',
      precision: 0
    }
  }
};

<WidgetFactory
  layout={widgetLayout}
  data={widgetData}
  onRefresh={handleRefresh}
/>
```

## Styling and Theming

All widgets integrate with Material-UI's theming system:

- Automatic color scheme adaptation
- Responsive breakpoints
- Consistent typography
- Dark/light mode support

## Performance Considerations

- Chart components use React.memo for optimization
- Large datasets are handled with virtualization
- Refresh operations include debouncing
- Error boundaries prevent widget crashes from affecting the entire dashboard

## Testing

The widgets include comprehensive test coverage:

- Unit tests for individual components
- Integration tests for data flow
- Visual regression tests for UI consistency
- Accessibility tests for WCAG compliance

Run tests with:
```bash
npm test -- --testPathPattern=widgets
```

## Demo

Use the `WidgetDemo` component to see all widgets in action:

```tsx
import { WidgetDemo } from './components/widgets';

<WidgetDemo />
```

This provides examples of all widget types with sample data and demonstrates the full range of features and customization options.