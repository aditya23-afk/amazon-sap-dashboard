import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  Download as DownloadIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { ChartData, ChartDataPoint } from '../../types';
import { AppError } from '../../types/error';
import { ErrorUtils } from '../../utils/errorUtils';

interface ChartFallbackProps {
  error?: AppError;
  data?: ChartData;
  title?: string;
  onRetry?: () => void;
  onExport?: () => void;
  variant?: 'table' | 'summary' | 'minimal';
  height?: number;
}

export const ChartFallback: React.FC<ChartFallbackProps> = ({
  error,
  data,
  title = 'Chart',
  onRetry,
  onExport,
  variant = 'table',
  height = 300
}) => {
  const [showTable, setShowTable] = React.useState(variant === 'table');

  // If we have an error but no data, show error state
  if (error && !data) {
    return (
      <ChartErrorFallback
        error={error}
        title={title}
        onRetry={onRetry}
        height={height}
      />
    );
  }

  // If we have data but chart failed to render, show data fallback
  if (data) {
    return (
      <ChartDataFallback
        data={data}
        title={title}
        onRetry={onRetry}
        onExport={onExport}
        showTable={showTable}
        onToggleTable={() => setShowTable(!showTable)}
        height={height}
        variant={variant}
      />
    );
  }

  // Default fallback when no data and no specific error
  return (
    <ChartEmptyFallback
      title={title}
      onRetry={onRetry}
      height={height}
    />
  );
};

interface ChartErrorFallbackProps {
  error: AppError;
  title: string;
  onRetry?: () => void;
  height: number;
}

const ChartErrorFallback: React.FC<ChartErrorFallbackProps> = ({
  error,
  title,
  onRetry,
  height
}) => {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        border: '1px dashed',
        borderColor: 'error.main',
        borderRadius: 1,
        bgcolor: 'error.light',
        color: 'error.contrastText'
      }}
    >
      <ErrorIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
      
      <Typography variant="h6" gutterBottom textAlign="center">
        Unable to load {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
        {ErrorUtils.getUserFriendlyMessage(error)}
      </Typography>
      
      {onRetry && ErrorUtils.shouldRetry(error) && (
        <Button
          variant="contained"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

interface ChartDataFallbackProps {
  data: ChartData;
  title: string;
  onRetry?: () => void;
  onExport?: () => void;
  showTable: boolean;
  onToggleTable: () => void;
  height: number;
  variant: 'table' | 'summary' | 'minimal';
}

const ChartDataFallback: React.FC<ChartDataFallbackProps> = ({
  data,
  title,
  onRetry,
  onExport,
  showTable,
  onToggleTable,
  height,
  variant
}) => {
  if (variant === 'minimal') {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          border: '1px dashed',
          borderColor: 'warning.main',
          borderRadius: 1,
          bgcolor: 'warning.light'
        }}
      >
        <ChartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7 }} />
        <Typography variant="body2" textAlign="center">
          Chart unavailable - {data.datasets.length} dataset(s) available
        </Typography>
        {onRetry && (
          <Button size="small" onClick={onRetry} sx={{ mt: 1 }}>
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (variant === 'summary') {
    return (
      <Card sx={{ height }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">{title} - Data Summary</Typography>
            <Stack direction="row" spacing={1}>
              {onExport && (
                <Tooltip title="Export Data">
                  <IconButton size="small" onClick={onExport}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              {onRetry && (
                <Tooltip title="Retry Chart">
                  <IconButton size="small" onClick={onRetry}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Chart visualization failed. Showing data summary instead.
          </Alert>

          <Box sx={{ maxHeight: height - 150, overflow: 'auto' }}>
            {data.datasets.map((dataset, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {dataset.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dataset.data.length} data points
                  {dataset.data.length > 0 && (
                    <>
                      {' • '}
                      Range: {Math.min(...dataset.data.map(d => d.y))} - {Math.max(...dataset.data.map(d => d.y))}
                    </>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Table variant (default)
  return (
    <Box sx={{ height, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={showTable ? "Show Summary" : "Show Table"}>
            <IconButton size="small" onClick={onToggleTable}>
              <TableIcon />
            </IconButton>
          </Tooltip>
          {onExport && (
            <Tooltip title="Export Data">
              <IconButton size="small" onClick={onExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          )}
          {onRetry && (
            <Tooltip title="Retry Chart">
              <IconButton size="small" onClick={onRetry}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 1 }}>
        Chart visualization unavailable. Displaying data in {showTable ? 'table' : 'summary'} format.
      </Alert>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {showTable ? (
          <ChartDataTable data={data} />
        ) : (
          <ChartDataSummary data={data} />
        )}
      </Box>
    </Box>
  );
};

interface ChartEmptyFallbackProps {
  title: string;
  onRetry?: () => void;
  height: number;
}

const ChartEmptyFallback: React.FC<ChartEmptyFallbackProps> = ({
  title,
  onRetry,
  height
}) => {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        border: '1px dashed',
        borderColor: 'grey.400',
        borderRadius: 1,
        bgcolor: 'grey.50'
      }}
    >
      <ChartIcon sx={{ fontSize: 48, mb: 2, color: 'grey.400' }} />
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No data available
      </Typography>
      
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>
        {title} data is not available at the moment.
      </Typography>
      
      {onRetry && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          Refresh
        </Button>
      )}
    </Box>
  );
};

const ChartDataTable: React.FC<{ data: ChartData }> = ({ data }) => {
  // Flatten data for table display
  const tableData: Array<{ label: string; dataset: string; x: string | number; y: number }> = [];
  
  data.datasets.forEach(dataset => {
    dataset.data.forEach(point => {
      tableData.push({
        label: point.label || String(point.x),
        dataset: dataset.label,
        x: point.x,
        y: point.y
      });
    });
  });

  return (
    <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Dataset</TableCell>
            <TableCell>Label</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.dataset}</TableCell>
              <TableCell>{row.label}</TableCell>
              <TableCell align="right">{row.y.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const ChartDataSummary: React.FC<{ data: ChartData }> = ({ data }) => {
  return (
    <Box sx={{ p: 2 }}>
      {data.datasets.map((dataset, index) => {
        const values = dataset.data.map(d => d.y);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = values.length > 0 ? sum / values.length : 0;
        const min = values.length > 0 ? Math.min(...values) : 0;
        const max = values.length > 0 ? Math.max(...values) : 0;

        return (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {dataset.label}
              </Typography>
              
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Data Points
                  </Typography>
                  <Typography variant="h6">
                    {dataset.data.length}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Average
                  </Typography>
                  <Typography variant="h6">
                    {avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Range
                  </Typography>
                  <Typography variant="h6">
                    {min.toLocaleString()} - {max.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6">
                    {sum.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default ChartFallback;