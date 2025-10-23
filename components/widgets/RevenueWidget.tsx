import React, { useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { dataTransformUtils } from '../../utils/dataTransform';
import { formatCurrency, formatTrend } from '../../utils/formatters';
import { ChartType, TimePeriod, TrendDirection, ChartData, FinancialMetrics } from '../../types';

interface RevenueWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const RevenueWidget: React.FC<RevenueWidgetProps> = ({
  id,
  title = 'Revenue Trends',
  refreshable = true,
  onRefresh
}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.MONTHLY);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate revenue trend data
      const rawRevenueData = mockDataGenerator.generateRevenueData(timePeriod);
      setRevenueData(rawRevenueData);
      
      // Generate financial metrics for KPIs
      const metrics = mockDataGenerator.generateFinancialMetrics();
      setFinancialMetrics(metrics);
      
    } catch (err) {
      setError('Failed to load revenue data');
      console.error('Revenue data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, [timePeriod]);

  const handleRefresh = async () => {
    await loadRevenueData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleTimePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: TimePeriod | null
  ) => {
    if (newPeriod) {
      setTimePeriod(newPeriod);
    }
  };

  const getTrendDirection = (growth: number): TrendDirection => {
    if (Math.abs(growth) < 1) return TrendDirection.STABLE;
    return growth > 0 ? TrendDirection.UP : TrendDirection.DOWN;
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
        {/* Time Period Selector */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={timePeriod}
            exclusive
            onChange={handleTimePeriodChange}
            size="small"
            aria-label="time period"
          >
            <ToggleButton value={TimePeriod.MONTHLY} aria-label="monthly">
              Monthly
            </ToggleButton>
            <ToggleButton value={TimePeriod.QUARTERLY} aria-label="quarterly">
              Quarterly
            </ToggleButton>
            <ToggleButton value={TimePeriod.YEARLY} aria-label="yearly">
              Yearly
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Revenue KPIs */}
        {financialMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-total-revenue`}
              title="Total Revenue"
              value={financialMetrics.revenue.total}
              unit={financialMetrics.revenue.currency}
              format="currency"
              trend={getTrendDirection(financialMetrics.revenue.growth)}
              trendValue={Math.abs(financialMetrics.revenue.growth)}
              color="#1976d2"
            />
            <KPIWidget
              id={`${id}-revenue-growth`}
              title="Revenue Growth"
              value={financialMetrics.revenue.growth}
              unit="%"
              format="percentage"
              trend={getTrendDirection(financialMetrics.revenue.growth)}
              color={financialMetrics.revenue.growth >= 0 ? "#4caf50" : "#f44336"}
            />
            <KPIWidget
              id={`${id}-forecast`}
              title="Forecast"
              value={financialMetrics.revenue.forecast}
              unit={financialMetrics.revenue.currency}
              format="currency"
              color="#ff9800"
            />
          </Box>
        )}

        {/* Revenue Trend Chart */}
        {revenueData && (
          <Box sx={{ height: 300 }}>
            <ChartWidget
              id={`${id}-chart`}
              title=""
              chartType={ChartType.LINE}
              data={revenueData}
              height={300}
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
                        return `Revenue: ${formatCurrency(value)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    ticks: {
                      callback: (value: any) => formatCurrency(value, 'USD').replace('$', '$')
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Revenue Summary */}
        {financialMetrics && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Revenue Growth: {formatTrend(financialMetrics.revenue.growth, getTrendDirection(financialMetrics.revenue.growth))}
              {' • '}
              Forecast: {formatCurrency(financialMetrics.revenue.forecast)}
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default RevenueWidget;