import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { ExportOptions, ExportFormat, ExportResult, EmailShareOptions } from '../../types';
import { exportService } from '../../services/exportService';

interface ExportPanelProps {
  open: boolean;
  onClose: () => void;
  dashboardElementId: string;
  data?: any;
  title?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  open,
  onClose,
  dashboardElementId,
  data,
  title = 'Dashboard Export'
}) => {
  const [exportOptions, setExportOptions] = useState<Partial<ExportOptions>>({
    format: ExportFormat.PDF,
    orientation: 'landscape',
    pageSize: 'a4',
    quality: 'medium',
    includeCharts: true,
    includeData: true
  });

  const [emailOptions, setEmailOptions] = useState<Partial<EmailShareOptions>>({
    recipients: [],
    subject: `${title} - ${new Date().toLocaleDateString()}`,
    message: 'Please find the attached dashboard report.'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipientInput, setRecipientInput] = useState('');

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let exportResult: ExportResult;

      switch (exportOptions.format) {
        case ExportFormat.PDF:
          exportResult = await exportService.exportToPDF(dashboardElementId, exportOptions);
          break;
        case ExportFormat.EXCEL:
          if (!data) {
            throw new Error('No data available for Excel export');
          }
          exportResult = await exportService.exportToExcel(data, exportOptions);
          break;
        case ExportFormat.PNG:
        case ExportFormat.JPEG:
          exportResult = await exportService.exportChartAsImage(
            dashboardElementId,
            exportOptions.format === ExportFormat.PNG ? 'png' : 'jpeg',
            exportOptions
          );
          break;
        default:
          throw new Error('Unsupported export format');
      }

      if (exportResult.success) {
        setResult(exportResult);
      } else {
        setError(exportResult.error || 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    exportService.preparePrintVersion(dashboardElementId);
  };

  const handleEmailShare = async () => {
    if (emailOptions.recipients && emailOptions.recipients.length > 0) {
      const success = await exportService.shareViaEmail(emailOptions as EmailShareOptions);
      if (!success) {
        setError('Failed to open email client');
      }
    } else {
      setError('Please add at least one recipient');
    }
  };

  const addRecipient = () => {
    if (recipientInput.trim() && recipientInput.includes('@')) {
      setEmailOptions(prev => ({
        ...prev,
        recipients: [...(prev.recipients || []), recipientInput.trim()]
      }));
      setRecipientInput('');
    }
  };

  const removeRecipient = (email: string) => {
    setEmailOptions(prev => ({
      ...prev,
      recipients: prev.recipients?.filter(r => r !== email) || []
    }));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addRecipient();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <DownloadIcon />
          Export Dashboard
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Export Format Selection */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Export Format</FormLabel>
            <RadioGroup
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as ExportFormat }))}
            >
              <FormControlLabel 
                value={ExportFormat.PDF} 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <PdfIcon />
                    PDF Document
                  </Box>
                }
              />
              <FormControlLabel 
                value={ExportFormat.EXCEL} 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ExcelIcon />
                    Excel Spreadsheet
                  </Box>
                }
              />
              <FormControlLabel 
                value={ExportFormat.PNG} 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ImageIcon />
                    PNG Image
                  </Box>
                }
              />
              <FormControlLabel 
                value={ExportFormat.JPEG} 
                control={<Radio />} 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ImageIcon />
                    JPEG Image
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Export Options */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {(exportOptions.format === ExportFormat.PDF) && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Orientation</InputLabel>
                  <Select
                    value={exportOptions.orientation || 'landscape'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, orientation: e.target.value as 'portrait' | 'landscape' }))}
                    label="Orientation"
                  >
                    <MenuItem value="portrait">Portrait</MenuItem>
                    <MenuItem value="landscape">Landscape</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Page Size</InputLabel>
                  <Select
                    value={exportOptions.pageSize || 'a4'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, pageSize: e.target.value as 'a4' | 'letter' | 'legal' }))}
                    label="Page Size"
                  >
                    <MenuItem value="a4">A4</MenuItem>
                    <MenuItem value="letter">Letter</MenuItem>
                    <MenuItem value="legal">Legal</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            <FormControl fullWidth>
              <InputLabel>Quality</InputLabel>
              <Select
                value={exportOptions.quality || 'medium'}
                onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                label="Quality"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Filename (optional)"
              value={exportOptions.filename || ''}
              onChange={(e) => setExportOptions(prev => ({ ...prev, filename: e.target.value }))}
              placeholder="dashboard-export"
            />
          </Box>

          {/* Include Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Include in Export</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeCharts || false}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                />
              }
              label="Charts and Visualizations"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeData || false}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeData: e.target.checked }))}
                />
              }
              label="Raw Data"
            />
          </Box>

          <Divider />

          {/* Email Sharing Section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon />
                Email Sharing
              </Box>
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <TextField
                  fullWidth
                  label="Add Recipients"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address and press Enter"
                  helperText="Press Enter to add each email address"
                />
                
                {emailOptions.recipients && emailOptions.recipients.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {emailOptions.recipients.map((email) => (
                        <Chip
                          key={email}
                          label={email}
                          onDelete={() => removeRecipient(email)}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>

              <TextField
                fullWidth
                label="Subject"
                value={emailOptions.subject || ''}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, subject: e.target.value }))}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Message"
                value={emailOptions.message || ''}
                onChange={(e) => setEmailOptions(prev => ({ ...prev, message: e.target.value }))}
              />
            </Box>
          </Box>

          {/* Results and Errors */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert severity="success">
              Export completed successfully! File: {result.filename} ({(result.size / 1024).toFixed(1)} KB)
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        
        <Button
          onClick={handlePrint}
          startIcon={<PrintIcon />}
          variant="outlined"
        >
          Print
        </Button>

        <Button
          onClick={handleEmailShare}
          startIcon={<EmailIcon />}
          variant="outlined"
          disabled={!emailOptions.recipients?.length}
        >
          Share via Email
        </Button>

        <Button
          onClick={handleExport}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportPanel;