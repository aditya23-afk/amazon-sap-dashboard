import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Warning } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatPercentage, formatCurrency } from '../../utils/formatters';
import { ChartType, ChartData, FinancialMetrics, TrendDirection } from '../../types';

interface FinancialVarianceWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const FinancialVarianceWidget: React.FC<FinancialVarianceWidgetProps> = ({
  id,
  title = 'Financial Variance Indicators',
  refreshable = true,
  onRefresh
}) => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [varianceData, setVarianceData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVarianceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate financial metrics
      const metrics = mockDataGenerator.generateFinancialMetrics();
      setFinancialMetrics(metrics);
      
      // Create variance comparison chart
      const categories = ['Budget', 'Forecast', 'Previous Period'];
      const variances = [
        metrics.variance.budget,
        metrics.variance.forecast,
        metrics.variance.previousPeriod
      ];
      
      const chartData: ChartData = {
        labels: categories,
        datasets: [{
          label: 'Variance (%)',
          data: variances.map((value, index) => ({
            x: categories[index] || `Category ${index}`,
            y: value
          })),
          backgroundColor: variances.map(variance => 
            variance >= 0 ? 'rgba(76, 175, 80, 0.6)' : 'rgba(244, 67, 54, 0.6)'
          ),
          borderColor: variances.map(variance => 
            variance >= 0 ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'
          ),
          borderWidth: 2
        }],
        metadata: {
          title: 'Financial Variance Analysis',
          description: 'Percentage deviation from budget, forecast, and previous period',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setVarianceData(chartData);
      
    } catch (err) {
      setError('Failed to load variance data');
      console.error('Variance data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVarianceData();
  }, []);

  const handleRefresh = async () => {
    await loadVarianceData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getVarianceStatus = (variance: number): {
    severity: 'success' | 'warning' | 'error';
    icon: React.ReactElement;
    label: string;
  } => {
    const absVariance = Math.abs(variance);
    
    if (absVariance <= 2) {
      return {
        severity: 'success',
        icon: <TrendingFlat />,
        label: 'On Track'
      };
    } else if (absVariance <= 5) {
      return {
        severity: 'warning',
        icon: variance > 0 ? <TrendingUp /> : <TrendingDown />,
        label: 'Minor Deviation'
      };
    } else {
      return {
        severity: 'error',
        icon: <Warning />,
        label: 'Significant Deviation'
      };
    }
  };

  const getTrendDirection = (variance: number): TrendDirection => {
    if (Math.abs(variance) <= 1) return TrendDirection.STABLE;
    return variance > 0 ? TrendDirection.UP : TrendDirection.DOWN;
  };

  const getVarianceColor = (variance: number): string => {
    if (Math.abs(variance) <= 2) return '#4caf50';
    if (Math.abs(variance) <= 5) return '#ff9800';
    return '#f44336';
  };

  return (
    <BaseWidget
      id={id}
      title={title}
      loading={loading}
      error={error}
      refreshable={refreshable}
      onRefresh={handleRefresh}
    >
      <Box sx={{ p: 2 }}>
        {/* Variance KPIs */}
        {financialMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-budget-variance`}
              title="vs Budget"
              value={Math.abs(financialMetrics.variance.budget)}
              unit="%"
              format="number"
              trend={getTrendDirection(financialMetrics.variance.budget)}
              color={getVarianceColor(financialMetrics.variance.budget)}
            />
            <KPIWidget
              id={`${id}-forecast-variance`}
              title="vs Forecast"
              value={Math.abs(financialMetrics.variance.forecast)}
              unit="%"
              format="number"
              trend={getTrendDirection(financialMetrics.variance.forecast)}
              color={getVarianceColor(financialMetrics.variance.forecast)}
            />
            <KPIWidget
              id={`${id}-period-variance`}
              title="vs Previous Period"
              value={Math.abs(financialMetrics.variance.previousPeriod)}
              unit="%"
              format="number"
              trend={getTrendDirection(financialMetrics.variance.previousPeriod)}
              color={getVarianceColor(financialMetrics.variance.previousPeriod)}
            />
          </Box>
        )}

        {/* Variance Chart */}
        {varianceData && (
          <Box sx={{ height: 250, mb: 3 }}>
            <ChartWidget
              id={`${id}-chart`}
              title=""
              chartType={ChartType.BAR}
              data={varianceData}
              height={250}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const value = context.parsed.y;
                        const sign = value >= 0 ? '+' : '';
                        return `Variance: ${sign}${formatPercentage(Math.abs(value))}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: any) => `${value > 0 ? '+' : ''}${value}%`
                    },
                    title: {
                      display: true,
                      text: 'Variance (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Comparison Category'
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Variance Status Alerts */}
        {financialMetrics && (
          <Box sx={{ mb: 2 }}>
            {Math.abs(financialMetrics.variance.budget) > 5 && (
              <Alert 
                severity={getVarianceStatus(financialMetrics.variance.budget).severity}
                icon={getVarianceStatus(financialMetrics.variance.budget).icon}
                sx={{ mb: 1 }}
              >
                Budget variance of {formatPercentage(Math.abs(financialMetrics.variance.budget))} 
                {financialMetrics.variance.budget > 0 ? ' above' : ' below'} target
              </Alert>
            )}
            
            {Math.abs(financialMetrics.variance.forecast) > 5 && (
              <Alert 
                severity={getVarianceStatus(financialMetrics.variance.forecast).severity}
                icon={getVarianceStatus(financialMetrics.variance.forecast).icon}
                sx={{ mb: 1 }}
              >
                Forecast variance of {formatPercentage(Math.abs(financialMetrics.variance.forecast))} 
                {financialMetrics.variance.forecast > 0 ? ' above' : ' below'} projection
              </Alert>
            )}
          </Box>
        )}

        {/* Variance Summary */}
        {financialMetrics && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`Budget: ${financialMetrics.variance.budget >= 0 ? '+' : ''}${formatPercentage(financialMetrics.variance.budget)}`}
              color={getVarianceStatus(financialMetrics.variance.budget).severity}
              size="small"
            />
            <Chip
              label={`Forecast: ${financialMetrics.variance.forecast >= 0 ? '+' : ''}${formatPercentage(financialMetrics.variance.forecast)}`}
              color={getVarianceStatus(financialMetrics.variance.forecast).severity}
              size="small"
            />
            <Chip
              label={`Previous: ${financialMetrics.variance.previousPeriod >= 0 ? '+' : ''}${formatPercentage(financialMetrics.variance.previousPeriod)}`}
              color={getVarianceStatus(financialMetrics.variance.previousPeriod).severity}
              size="small"
            />
          </Box>
        )}

        {/* Performance Insights */}
        {financialMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Performance Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.abs(financialMetrics.variance.budget) <= 2 
                ? "Performance is well within budget expectations."
                : Math.abs(financialMetrics.variance.budget) <= 5
                ? "Minor budget deviation detected. Monitor closely."
                : "Significant budget variance requires immediate attention."
              }
              {' '}
              Revenue is {financialMetrics.variance.previousPeriod >= 0 ? 'up' : 'down'} {formatPercentage(Math.abs(financialMetrics.variance.previousPeriod))} compared to the previous period.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default FinancialVarianceWidget;