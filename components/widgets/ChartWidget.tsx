import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  Line,
  Bar,
  Pie,
  Doughnut
} from 'react-chartjs-2';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BaseWidget } from './BaseWidget';
import { ChartWidgetProps, ChartType } from '../../types';
import TouchEnabledChart, { TouchGesture, getMobileChartOptions } from '../charts/TouchEnabledChart';
import ChartFallback from '../fallback/ChartFallback';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ARIA_LABELS } from '../../utils/accessibility';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Gauge Chart Component (custom implementation)
const GaugeChart: React.FC<{ 
  data: any; 
  options: any; 
  height?: number;
}> = ({ 
  data, 
  options, 
  height = 200 
}) => {
  const theme = useTheme();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get the value from data (assuming single dataset with single value)
    const value = data.datasets[0]?.data[0] || 0;
    const maxValue = options.scales?.r?.max || 100;
    const percentage = Math.min(value / maxValue, 1);

    // Canvas dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Draw gauge background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
    ctx.lineWidth = 20;
    ctx.strokeStyle = theme.palette.grey[200];
    ctx.stroke();

    // Draw gauge fill
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + (Math.PI * percentage));
    ctx.lineWidth = 20;
    ctx.strokeStyle = data.datasets[0]?.backgroundColor || theme.palette.primary.main;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = theme.palette.text.primary;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(value)}`, centerX, centerY - 10);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = theme.palette.text.secondary;
    ctx.fillText(data.datasets[0]?.label || '', centerX, centerY + 15);
  }, [data, options, theme]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
      role="img"
      aria-label={`Gauge chart showing ${data.datasets[0]?.label || 'value'}: ${Math.round(value)} out of ${maxValue}`}
    />
  );
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  chartType,
  data,
  options = {},
  height = 300,
  width,
  interactive = true,
  ...baseProps
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [renderError, setRenderError] = React.useState<Error | null>(null);
  const { handleRenderingError } = useErrorHandler();

  // Handle touch gestures for mobile interactions
  const handleGesture = React.useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'pinch':
        if (gesture.scale && interactive) {
          setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * gesture.scale!)));
        }
        break;
      case 'pan':
        if (gesture.deltaX && gesture.deltaY && interactive) {
          setPanOffset(prev => ({
            x: prev.x + gesture.deltaX!,
            y: prev.y + gesture.deltaY!,
          }));
        }
        break;
      case 'tap':
        // Handle tap interactions (could trigger data point selection)
        console.log('Chart tapped at:', gesture.currentX, gesture.currentY);
        break;
      case 'swipe':
        // Handle swipe gestures (could navigate between time periods)
        if (Math.abs(gesture.deltaX!) > Math.abs(gesture.deltaY!)) {
          console.log('Horizontal swipe:', gesture.deltaX! > 0 ? 'right' : 'left');
        }
        break;
    }
  }, [interactive]);

  // Default chart options with theme integration
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: interactive ? 'index' : 'none' as const
    },
    plugins: {
      legend: {
        display: true,
        position: isMobile ? 'bottom' : 'top' as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 15 : 20,
          color: theme.palette.text.primary,
          font: {
            size: isMobile ? 11 : 12,
          },
        }
      },
      tooltip: {
        enabled: interactive,
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 12 : 14,
        },
        bodyFont: {
          size: isMobile ? 11 : 12,
        },
      }
    },
    scales: chartType === ChartType.PIE || chartType === ChartType.DOUGHNUT || chartType === ChartType.GAUGE ? {} : {
      x: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: isMobile ? 10 : 12,
          },
          maxRotation: isMobile ? 45 : 0,
          minRotation: 0,
        }
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: isMobile ? 10 : 12,
          },
        },
        beginAtZero: true
      }
    },
    elements: {
      point: {
        radius: isMobile ? 3 : 4,
        hoverRadius: isMobile ? 6 : 8,
        hitRadius: isMobile ? 8 : 10,
      },
      line: {
        borderWidth: isMobile ? 2 : 3,
        tension: 0.1,
      },
      bar: {
        borderRadius: isMobile ? 2 : 4,
      },
    },
  };

  // Apply mobile optimizations if on mobile device
  const baseOptions = isMobile ? getMobileChartOptions(defaultOptions) : defaultOptions;

  // Generate chart description for screen readers
  const generateChartDescription = () => {
    const datasets = data.datasets || [];
    const labels = data.labels || [];
    
    if (datasets.length === 0) return 'Empty chart';
    
    const datasetDescriptions = datasets.map((dataset, index) => {
      const dataPoints = dataset.data || [];
      const total = dataPoints.reduce((sum: number, value: any) => sum + (typeof value === 'number' ? value : 0), 0);
      const average = dataPoints.length > 0 ? total / dataPoints.length : 0;
      
      return `Dataset ${index + 1}: ${dataset.label || 'Unnamed'}, ${dataPoints.length} data points, average value ${average.toFixed(2)}`;
    }).join('. ');
    
    return `${chartType} chart with ${datasets.length} dataset${datasets.length > 1 ? 's' : ''} and ${labels.length} categories. ${datasetDescriptions}`;
  };

  // Merge default options with provided options
  const mergedOptions = {
    ...baseOptions,
    ...options,
    plugins: {
      ...baseOptions.plugins,
      ...options.plugins
    },
    scales: {
      ...baseOptions.scales,
      ...options.scales
    }
  };

  const renderChart = () => {
    try {
      const commonProps = {
        data,
        options: mergedOptions,
        height,
        width
      };

      switch (chartType) {
        case ChartType.LINE:
          return <Line {...commonProps} />;
        case ChartType.BAR:
          return <Bar {...commonProps} />;
        case ChartType.PIE:
          return <Pie {...commonProps} />;
        case ChartType.DOUGHNUT:
          return <Doughnut {...commonProps} />;
        case ChartType.GAUGE:
          return <GaugeChart {...commonProps} />;
        default:
          throw new Error(`Unsupported chart type: ${chartType}`);
      }
    } catch (error) {
      const renderingError = error as Error;
      setRenderError(renderingError);
      handleRenderingError(`ChartWidget-${chartType}`, renderingError);
      
      // Return fallback component
      return (
        <ChartFallback
          error={renderingError}
          data={data}
          title={baseProps.title}
          onRetry={() => {
            setRenderError(null);
            if (baseProps.onRefresh) {
              baseProps.onRefresh();
            }
          }}
          height={height}
          variant="summary"
        />
      );
    }
  };

  // Create fallback component for BaseWidget
  const ChartWidgetFallback: React.FC<{ error?: any; onRetry?: () => void }> = ({ error, onRetry }) => (
    <ChartFallback
      error={error}
      data={data}
      title={baseProps.title}
      onRetry={onRetry}
      height={height}
      variant="table"
    />
  );

  return (
    <BaseWidget 
      {...baseProps}
      fallbackComponent={ChartWidgetFallback}
    >
      {renderError ? (
        <ChartFallback
          error={renderError}
          data={data}
          title={baseProps.title}
          onRetry={() => {
            setRenderError(null);
            if (baseProps.onRefresh) {
              baseProps.onRefresh();
            }
          }}
          height={height}
          variant="summary"
        />
      ) : (
        <>
          <Box
            role="img"
            aria-label={`${ARIA_LABELS.CHART_WIDGET}: ${generateChartDescription()}`}
            tabIndex={0}
            sx={{
              '&:focus': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <TouchEnabledChart
              onGesture={handleGesture}
              enablePinchZoom={interactive && isMobile}
              enablePan={interactive && isMobile}
              enableSwipe={interactive && isMobile}
              style={{
                height: isMobile ? Math.min(height, 250) : height,
                width: '100%',
                position: 'relative',
                padding: isMobile ? 8 : 16,
                transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
            >
              {renderChart()}
            </TouchEnabledChart>
            
            {/* Hidden table for screen readers */}
            <Box className="sr-only">
              <table>
                <caption>{`Data table for ${baseProps.title} ${chartType} chart`}</caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    {data.datasets?.map((dataset, index) => (
                      <th key={index} scope="col">{dataset.label || `Dataset ${index + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.labels?.map((label, labelIndex) => (
                    <tr key={labelIndex}>
                      <th scope="row">{label}</th>
                      {data.datasets?.map((dataset, datasetIndex) => (
                        <td key={datasetIndex}>
                          {Array.isArray(dataset.data) ? dataset.data[labelIndex] : dataset.data}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
          
          {/* Mobile gesture hints */}
          {isMobile && interactive && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                Pinch to zoom • Drag to pan • Swipe to navigate
              </Typography>
            </Box>
          )}
          
          {/* Chart metadata */}
          {data.metadata && (
            <Box sx={{ px: 2, pb: 1 }}>
              {data.metadata.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block',
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  }}
                >
                  {data.metadata.description}
                </Typography>
              )}
              {data.metadata.lastUpdated && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'block', 
                    mt: 0.5,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  }}
                >
                  Last updated: {new Date(data.metadata.lastUpdated).toLocaleString()}
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </BaseWidget>
  );
};

export default ChartWidget;