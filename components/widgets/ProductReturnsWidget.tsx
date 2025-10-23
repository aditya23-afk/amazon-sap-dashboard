import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Grid, Card, CardContent } from '@mui/material';
import { Assignment, TrendingDown, Warning, Category } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { ChartType, ChartData, CustomerMetrics, TrendDirection } from '../../types';

interface ProductReturnsWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

interface ReturnCategory {
  category: string;
  returnCount: number;
  returnRate: number;
  totalSales: number;
  avgProcessingTime: number;
  trend: TrendDirection;
}

export const ProductReturnsWidget: React.FC<ProductReturnsWidgetProps> = ({
  id,
  title = 'Product Returns Analysis',
  refreshable = true,
  onRefresh
}) => {
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [returnReasonsData, setReturnReasonsData] = useState<ChartData | null>(null);
  const [returnTrendData, setReturnTrendData] = useState<ChartData | null>(null);
  const [returnCategories, setReturnCategories] = useState<ReturnCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReturnsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate customer metrics
      const metrics = mockDataGenerator.generateCustomerMetrics();
      setCustomerMetrics(metrics);
      
      // Generate return categories data
      const categories: ReturnCategory[] = [
        {
          category: 'Electronics',
          returnCount: Math.floor(Math.random() * 500) + 200,
          returnRate: Math.random() * 8 + 2,
          totalSales: Math.floor(Math.random() * 10000) + 5000,
          avgProcessingTime: Math.random() * 5 + 2,
          trend: TrendDirection.DOWN
        },
        {
          category: 'Clothing',
          returnCount: Math.floor(Math.random() * 800) + 300,
          returnRate: Math.random() * 15 + 5,
          totalSales: Math.floor(Math.random() * 8000) + 4000,
          avgProcessingTime: Math.random() * 3 + 1,
          trend: TrendDirection.UP
        },
        {
          category: 'Books',
          returnCount: Math.floor(Math.random() * 200) + 50,
          returnRate: Math.random() * 3 + 1,
          totalSales: Math.floor(Math.random() * 5000) + 2000,
          avgProcessingTime: Math.random() * 2 + 1,
          trend: TrendDirection.STABLE
        },
        {
          category: 'Home & Garden',
          returnCount: Math.floor(Math.random() * 400) + 150,
          returnRate: Math.random() * 6 + 3,
          totalSales: Math.floor(Math.random() * 6000) + 3000,
          avgProcessingTime: Math.random() * 4 + 2,
          trend: TrendDirection.DOWN
        },
        {
          category: 'Sports',
          returnCount: Math.floor(Math.random() * 300) + 100,
          returnRate: Math.random() * 5 + 2,
          totalSales: Math.floor(Math.random() * 4000) + 2000,
          avgProcessingTime: Math.random() * 3 + 1.5,
          trend: TrendDirection.STABLE
        }
      ];
      
      setReturnCategories(categories);
      
      // Create return reasons chart data (using existing customer metrics)
      const reasonsData: ChartData = {
        labels: metrics.returns.reasons.map(r => r.reason),
        datasets: [{
          label: 'Return Reasons',
          data: metrics.returns.reasons.map((reason, index) => ({
            x: reason.reason,
            y: reason.percentage
          })),
          backgroundColor: [
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(33, 150, 243, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(156, 39, 176, 0.8)'
          ],
          borderColor: [
            'rgba(244, 67, 54, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(156, 39, 176, 1)'
          ],
          borderWidth: 2
        }],
        metadata: {
          title: 'Return Reasons Breakdown',
          description: 'Primary reasons for product returns',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setReturnReasonsData(reasonsData);
      
      // Generate return trend data over time
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const returnRates = months.map(() => Math.random() * 5 + 2); // 2-7% return rate
      const returnCounts = months.map(() => Math.floor(Math.random() * 1000) + 500);
      
      const trendData: ChartData = {
        labels: months,
        datasets: [
          {
            label: 'Return Rate (%)',
            data: returnRates.map((rate, index) => ({
              x: months[index] || `Month ${index}`,
              y: rate
            })),
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            borderColor: 'rgba(244, 67, 54, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Return Count',
            data: returnCounts.map((count, index) => ({
              x: months[index] || `Month ${index}`,
              y: count / 100 // Scale for better visualization
            })),
            backgroundColor: 'rgba(255, 152, 0, 0.2)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ],
        metadata: {
          title: 'Return Trends Over Time',
          description: 'Monthly return rates and volumes',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setReturnTrendData(trendData);
      
    } catch (err) {
      setError('Failed to load returns data');
      console.error('Returns data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturnsData();
  }, []);

  const handleRefresh = async () => {
    await loadReturnsData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getReturnRateStatus = (rate: number): {
    color: 'success' | 'warning' | 'error';
    label: string;
  } => {
    if (rate <= 3) return { color: 'success', label: 'Low' };
    if (rate <= 7) return { color: 'warning', label: 'Moderate' };
    return { color: 'error', label: 'High' };
  };

  const getTrendIcon = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.UP:
        return <TrendingDown color="error" />;
      case TrendDirection.DOWN:
        return <TrendingDown color="success" sx={{ transform: 'rotate(180deg)' }} />;
      default:
        return <Warning color="action" />;
    }
  };

  const getTotalReturns = () => {
    return returnCategories.reduce((sum, cat) => sum + cat.returnCount, 0);
  };

  const getAverageReturnRate = () => {
    if (returnCategories.length === 0) return 0;
    return returnCategories.reduce((sum, cat) => sum + cat.returnRate, 0) / returnCategories.length;
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
        {/* Returns Overview KPIs */}
        {customerMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-return-rate`}
              title="Return Rate"
              value={customerMetrics.returns.rate}
              unit="%"
              format="number"
              precision={1}
              trend={TrendDirection.DOWN}
              color="#f44336"
            />
            <KPIWidget
              id={`${id}-total-returns`}
              title="Total Returns"
              value={getTotalReturns()}
              unit="items"
              format="number"
              trend={TrendDirection.STABLE}
              color="#ff9800"
            />
            <KPIWidget
              id={`${id}-avg-processing`}
              title="Avg Processing"
              value={returnCategories.length > 0 ? returnCategories.reduce((sum, cat) => sum + cat.avgProcessingTime, 0) / returnCategories.length : 0}
              unit="days"
              format="number"
              precision={1}
              trend={TrendDirection.DOWN}
              color="#2196f3"
            />
          </Box>
        )}

        {/* Return Rate Status */}
        {customerMetrics && (
          <Card sx={{ mb: 3, bgcolor: getReturnRateStatus(customerMetrics.returns.rate).color + '.light', opacity: 0.1 }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 1 }}>
                <Assignment sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="div" fontWeight="bold">
                  {formatPercentage(customerMetrics.returns.rate)}
                </Typography>
              </Box>
              
              <Chip
                label={getReturnRateStatus(customerMetrics.returns.rate).label + ' Return Rate'}
                color={getReturnRateStatus(customerMetrics.returns.rate).color}
                size="small"
              />
            </CardContent>
          </Card>
        )}

        {/* Return Reasons Chart */}
        {returnReasonsData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment fontSize="small" />
              Return Reasons Breakdown
            </Typography>
            <ChartWidget
              id={`${id}-reasons-chart`}
              title=""
              chartType={ChartType.DOUGHNUT}
              data={returnReasonsData}
              height={280}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'right'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const value = context.parsed;
                        return `${context.label}: ${value.toFixed(1)}%`;
                      }
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Category Returns Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Category fontSize="small" />
            Returns by Category
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Returns</TableCell>
                  <TableCell align="right">Return Rate</TableCell>
                  <TableCell align="right">Total Sales</TableCell>
                  <TableCell align="right">Avg Processing</TableCell>
                  <TableCell>Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returnCategories.map((category, index) => (
                  <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {category.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(category.returnCount)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatPercentage(category.returnRate)}
                        color={getReturnRateStatus(category.returnRate).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(category.totalSales)}
                    </TableCell>
                    <TableCell align="right">
                      {category.avgProcessingTime.toFixed(1)} days
                    </TableCell>
                    <TableCell>
                      {getTrendIcon(category.trend)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Return Trends Chart */}
        {returnTrendData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDown fontSize="small" />
              Return Trends Over Time
            </Typography>
            <ChartWidget
              id={`${id}-trend-chart`}
              title=""
              chartType={ChartType.LINE}
              data={returnTrendData}
              height={280}
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
                        if (context.datasetIndex === 0) {
                          return `Return Rate: ${value.toFixed(1)}%`;
                        } else {
                          return `Returns: ${(value * 100).toLocaleString()}`;
                        }
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Return Rate (%)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Return Count (hundreds)'
                    },
                    grid: {
                      drawOnChartArea: false
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Returns Analysis Summary */}
        {customerMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Returns Analysis Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current return rate of {formatPercentage(customerMetrics.returns.rate)} is 
              {customerMetrics.returns.rate <= 5 ? ' within' : ' above'} acceptable range. 
              Top return reason is "{customerMetrics.returns.reasons[0]?.reason}" accounting for 
              {formatPercentage(customerMetrics.returns.reasons[0]?.percentage || 0)} of all returns.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Focus areas: Clothing category shows highest return rate ({returnCategories.find(c => c.category === 'Clothing')?.returnRate.toFixed(1)}%), 
              primarily due to sizing and fit issues.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default ProductReturnsWidget;