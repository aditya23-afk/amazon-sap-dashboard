import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { ExportButton, ExportPanel } from '../components/export';
import { useExport } from '../hooks/useExport';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Reports: React.FC = () => {
  const [exportPanelOpen, setExportPanelOpen] = useState(false);
  const { isExporting, exportResult, error } = useExport();
  const dashboardData = useSelector((state: RootState) => state.data);

  const exportFeatures = [
    {
      title: 'PDF Export',
      description: 'Export dashboard as high-quality PDF document',
      icon: <PdfIcon color="error" />,
      features: ['High-resolution charts', 'Print-optimized layout', 'Multiple page sizes', 'Landscape/Portrait orientation']
    },
    {
      title: 'Excel Export',
      description: 'Export raw data to Excel spreadsheets',
      icon: <ExcelIcon color="success" />,
      features: ['Multiple worksheets', 'Formatted data tables', 'Chart data included', 'Filter information']
    },
    {
      title: 'Image Export',
      description: 'Export charts and widgets as images',
      icon: <ImageIcon color="info" />,
      features: ['PNG and JPEG formats', 'High-resolution output', 'Individual chart export', 'Transparent backgrounds']
    },
    {
      title: 'Print Support',
      description: 'Print-optimized dashboard layouts',
      icon: <PrintIcon color="warning" />,
      features: ['Print-friendly styling', 'Page break optimization', 'Hide non-essential elements', 'Multiple paper sizes']
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports & Export
        </Typography>
        <ExportButton
          dashboardElementId="reports-demo-content"
          data={dashboardData}
          title="Reports Dashboard"
          variant="button"
        />
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        This page demonstrates the export and reporting functionality. Use the export button above or the individual export options below to test different export formats.
      </Alert>

      {/* Export Status */}
      {isExporting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Export in progress...
        </Alert>
      )}

      {exportResult && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Export completed: {exportResult.filename} ({(exportResult.size / 1024).toFixed(1)} KB)
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Export failed: {error}
        </Alert>
      )}

      <Grid container spacing={3} id="reports-demo-content">
        {/* Export Features Overview */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Available Export Formats
          </Typography>
          <Grid container spacing={2}>
            {exportFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {feature.icon}
                      <Typography variant="h6" sx={{ ml: 1 }}>
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {feature.description}
                    </Typography>
                    <List dense>
                      {feature.features.map((item, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={item} 
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Sample Report Data */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample Business Metrics
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Revenue</Typography>
                <Typography variant="h4" color="success.main">$2.4M</Typography>
                <Chip label="+12.5%" color="success" size="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Orders</Typography>
                <Typography variant="h4" color="primary.main">15,847</Typography>
                <Chip label="+8.3%" color="success" size="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Customers</Typography>
                <Typography variant="h4" color="info.main">8,932</Typography>
                <Chip label="+5.7%" color="success" size="small" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Satisfaction</Typography>
                <Typography variant="h4" color="warning.main">94.2%</Typography>
                <Chip label="+2.1%" color="success" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Export Options
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose from various export formats to share your dashboard data:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                startIcon={<PdfIcon />}
                variant="outlined"
                fullWidth
                onClick={() => setExportPanelOpen(true)}
              >
                Advanced Export Options
              </Button>
              <Button
                startIcon={<EmailIcon />}
                variant="outlined"
                fullWidth
                onClick={() => setExportPanelOpen(true)}
              >
                Email Sharing
              </Button>
              <Button
                startIcon={<PrintIcon />}
                variant="outlined"
                fullWidth
                onClick={() => window.print()}
              >
                Print Dashboard
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Export Instructions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              How to Use Export Features
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Quick Export
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use the export button in the header for quick PDF, Excel, or image exports with default settings.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Advanced Export
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Advanced Export Options" to customize export settings, including format, quality, and orientation.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Email Sharing
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share reports via email with customizable subject lines and recipient lists.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <ExportPanel
        open={exportPanelOpen}
        onClose={() => setExportPanelOpen(false)}
        dashboardElementId="reports-demo-content"
        data={dashboardData}
        title="Reports Dashboard"
      />
    </Box>
  );
};

export default Reports;