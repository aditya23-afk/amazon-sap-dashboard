import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatPercentage } from '../../utils/formatters';
import { ChartType, ChartData, FinancialMetrics, TrendDirection } from '../../types';

interface ProfitMarginWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const ProfitMarginWidget: React.FC<ProfitMarginWidgetProps> = ({
  id,
  title = 'Profit Margin Analysis',
  refreshable = true,
  onRefresh
}) => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [profitMarginData, setProfitMarginData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfitMarginData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate financial metrics
      const metrics = mockDataGenerator.generateFinancialMetrics();
      setFinancialMetrics(metrics);
      
      // Create profit margin chart data across product lines
      const productLines = ['Electronics', 'Books', 'Clothing', 'Home & Garden', 'Sports'];
      const grossMargins = productLines.map(() => Math.random() * 20 + 15); // 15-35%
      const netMargins = grossMargins.map(gross => gross * (0.3 + Math.random() * 0.4)); // 30-70% of gross
      const operatingMargins = grossMargins.map(gross => gross * (0.5 + Math.random() * 0.3)); // 50-80% of gross
      
      const chartData: ChartData = {
        labels: productLines,
        datasets: [
          {
            label: 'Gross Margin',
            data: grossMargins.map((value, index) => ({
              x: productLines[index] || `Product ${index}`,
              y: value
            })),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Operating Margin',
            data: operatingMargins.map((value, index) => ({
              x: productLines[index] || `Product ${index}`,
              y: value
            })),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Net Margin',
            data: netMargins.map((value, index) => ({
              x: productLines[index] || `Product ${index}`,
              y: value
            })),
            backgroundColor: 'rgba(255, 206, 86, 0.6)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1
          }
        ],
        metadata: {
          title: 'Profit Margins by Product Line',
          description: 'Comparison of gross, operating, and net margins across product categories',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setProfitMarginData(chartData);
      
    } catch (err) {
      setError('Failed to load profit margin data');
      console.error('Profit margin data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfitMarginData();
  }, []);

  const handleRefresh = async () => {
    await loadProfitMarginData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getMarginStatus = (margin: number): { color: 'success' | 'warning' | 'error', label: string } => {
    if (margin >= 20) return { color: 'success', label: 'Excellent' };
    if (margin >= 10) return { color: 'warning', label: 'Good' };
    return { color: 'error', label: 'Needs Improvement' };
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
        {/* Overall Margin KPIs */}
        {financialMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-gross-margin`}
              title="Gross Margin"
              value={financialMetrics.profitMargin.gross}
              unit="%"
              format="number"
              trend={TrendDirection.UP}
              color="#4caf50"
            />
            <KPIWidget
              id={`${id}-operating-margin`}
              title="Operating Margin"
              value={financialMetrics.profitMargin.operating}
              unit="%"
              format="number"
              trend={TrendDirection.STABLE}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-net-margin`}
              title="Net Margin"
              value={financialMetrics.profitMargin.net}
              unit="%"
              format="number"
              trend={TrendDirection.UP}
              color="#ff9800"
            />
          </Box>
        )}

        {/* Profit Margin Chart by Product Lines */}
        {profitMarginData && (
          <Box sx={{ height: 300, mb: 2 }}>
            <ChartWidget
              id={`${id}-chart`}
              title=""
              chartType={ChartType.BAR}
              data={profitMarginData}
              height={300}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: ${formatPercentage(value)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 40,
                    ticks: {
                      callback: (value: any) => `${value}%`
                    },
                    title: {
                      display: true,
                      text: 'Margin (%)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Product Lines'
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Margin Analysis Summary */}
        {financialMetrics && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Margin Performance
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Gross: ${formatPercentage(financialMetrics.profitMargin.gross)}`}
                color={getMarginStatus(financialMetrics.profitMargin.gross).color}
                size="small"
              />
              <Chip
                label={`Operating: ${formatPercentage(financialMetrics.profitMargin.operating)}`}
                color={getMarginStatus(financialMetrics.profitMargin.operating).color}
                size="small"
              />
              <Chip
                label={`Net: ${formatPercentage(financialMetrics.profitMargin.net)}`}
                color={getMarginStatus(financialMetrics.profitMargin.net).color}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {getMarginStatus(financialMetrics.profitMargin.net).label} overall performance across product lines
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default ProfitMarginWidget;