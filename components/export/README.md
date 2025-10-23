# Export Functionality

This module provides comprehensive export and reporting capabilities for the Amazon SAP Dashboard.

## Features

### 1. PDF Export
- High-quality PDF generation using jsPDF and html2canvas
- Configurable page orientation (portrait/landscape)
- Multiple page sizes (A4, Letter, Legal)
- Quality settings (low, medium, high)
- Automatic scaling and positioning

### 2. Excel Export
- Export business metrics to structured Excel worksheets
- Multiple sheets for different data categories
- Chart data export with proper formatting
- Raw data export capabilities
- Uses SheetJS (xlsx) library

### 3. Image Export
- Export charts and widgets as PNG or JPEG images
- High-resolution output options
- Transparent background support
- Individual chart export capability

### 4. Print Support
- Print-optimized CSS styling
- Automatic hiding of non-essential elements
- Page break optimization
- Multiple paper size support
- Print preview functionality

### 5. Email Sharing
- Pre-filled email client integration
- Multiple recipient support
- Customizable subject and message
- Attachment preparation (requires server-side implementation)

## Components

### ExportPanel
Full-featured export dialog with all options:
```tsx
import { ExportPanel } from '../components/export';

<ExportPanel
  open={isOpen}
  onClose={() => setIsOpen(false)}
  dashboardElementId="dashboard-content"
  data={dashboardData}
  title="My Dashboard"
/>
```

### ExportButton
Quick export button with dropdown menu:
```tsx
import { ExportButton } from '../components/export';

<ExportButton
  dashboardElementId="dashboard-content"
  data={dashboardData}
  title="Dashboard"
  variant="button" // or "menu"
  size="medium"
/>
```

## Hooks

### useExport
React hook for programmatic export functionality:
```tsx
import { useExport } from '../hooks/useExport';

const { 
  isExporting, 
  exportResult, 
  error,
  exportToPDF,
  exportToExcel,
  exportToImage,
  printDashboard 
} = useExport();

// Export to PDF
await exportToPDF('element-id', { 
  orientation: 'landscape',
  quality: 'high' 
});

// Export to Excel
await exportToExcel(data, { 
  filename: 'report.xlsx' 
});
```

## Services

### ExportService
Core service handling all export operations:
```tsx
import { exportService } from '../services/exportService';

// PDF Export
const result = await exportService.exportToPDF('element-id', options);

// Excel Export
const result = await exportService.exportToExcel(data, options);

// Image Export
const result = await exportService.exportChartAsImage('chart-id', 'png');

// Print
exportService.preparePrintVersion('element-id');

// Email
await exportService.shareViaEmail(emailOptions);
```

## Installation

Required dependencies:
```bash
npm install jspdf html2canvas xlsx
```

## Usage Examples

### Basic PDF Export
```tsx
import { exportService } from '../services/exportService';

const handleExportPDF = async () => {
  const result = await exportService.exportToPDF('dashboard-content', {
    filename: 'dashboard-report.pdf',
    orientation: 'landscape',
    quality: 'high'
  });
  
  if (result.success) {
    console.log(`Exported: ${result.filename}`);
  } else {
    console.error(`Export failed: ${result.error}`);
  }
};
```

### Excel Data Export
```tsx
const handleExportExcel = async () => {
  const businessData = {
    revenue: { current: 1000000, previous: 900000 },
    orders: { total: 5000, completed: 4800 }
  };
  
  const result = await exportService.exportToExcel(businessData, {
    filename: 'business-metrics.xlsx'
  });
};
```

### Widget-Level Export
```tsx
import { BaseWidget } from '../widgets/BaseWidget';

<BaseWidget
  id="revenue-widget"
  title="Revenue Metrics"
  exportable={true}
  exportData={revenueData}
>
  {/* Widget content */}
</BaseWidget>
```

## Print Styles

The module includes comprehensive print CSS that:
- Hides navigation and interactive elements
- Optimizes layout for printing
- Ensures proper page breaks
- Maintains chart quality
- Provides print-friendly colors

## Error Handling

All export functions return a standardized result object:
```tsx
interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  downloadUrl?: string;
  error?: string;
}
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with some limitations on file downloads)
- Mobile browsers: Limited support for file downloads

## Security Considerations

- All exports are client-side only
- No data is sent to external servers
- Email sharing opens local email client
- File downloads use browser's built-in security

## Performance Notes

- Large dashboards may take time to render for PDF export
- High-quality exports use more memory
- Excel exports with large datasets may be slow
- Consider pagination for very large data sets

## Customization

### Custom Export Options
```tsx
const customOptions: ExportOptions = {
  format: ExportFormat.PDF,
  orientation: 'portrait',
  pageSize: 'a4',
  quality: 'high',
  includeCharts: true,
  includeData: false,
  filename: 'custom-report.pdf'
};
```

### Custom Print Styles
Add custom CSS classes:
```css
.no-print { display: none !important; }
.print-break { page-break-before: always !important; }
.print-only { display: none; }

@media print {
  .print-only { display: block !important; }
}
```

## Testing

The export functionality includes comprehensive unit tests covering:
- PDF generation
- Excel export with different data types
- Image export
- Error handling
- Email sharing
- Print preparation

Run tests with:
```bash
npm test exportService
```