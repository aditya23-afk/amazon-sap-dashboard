import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ChartType, ChartData, FinancialMetrics } from '../../types';

interface CostBreakdownWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const CostBreakdownWidget: React.FC<CostBreakdownWidgetProps> = ({
  id,
  title = 'Cost Breakdown Analysis',
  refreshable = true,
  onRefresh
}) => {
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  const [costBreakdownData, setCostBreakdownData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCostBreakdownData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate financial metrics
      const metrics = mockDataGenerator.generateFinancialMetrics();
      setFinancialMetrics(metrics);
      
      // Create cost breakdown pie chart data
      const costCategories = [
        { label: 'Operational', value: metrics.costs.operational, color: 'rgba(255, 99, 132, 0.8)' },
        { label: 'Marketing', value: metrics.costs.marketing, color: 'rgba(54, 162, 235, 0.8)' },
        { label: 'Logistics', value: metrics.costs.logistics, color: 'rgba(255, 206, 86, 0.8)' },
        { 
          label: 'Other', 
          value: metrics.costs.total - (metrics.costs.operational + metrics.costs.marketing + metrics.costs.logistics),
          color: 'rgba(75, 192, 192, 0.8)'
        }
      ];
      
      const chartData: ChartData = {
        labels: costCategories.map(cat => cat.label),
        datasets: [{
          label: 'Cost Distribution',
          data: costCategories.map((cat, index) => ({
            x: cat.label,
            y: cat.value
          })),
          backgroundColor: costCategories.map(cat => cat.color),
          borderColor: costCategories.map(cat => cat.color.replace('0.8', '1')),
          borderWidth: 2
        }],
        metadata: {
          title: 'Cost Distribution by Category',
          description: 'Breakdown of operational expenses across different categories',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setCostBreakdownData(chartData);
      
    } catch (err) {
      setError('Failed to load cost breakdown data');
      console.error('Cost breakdown data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCostBreakdownData();
  }, []);

  const handleRefresh = async () => {
    await loadCostBreakdownData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getCostPercentage = (cost: number, total: number): number => {
    return (cost / total) * 100;
  };

  const getCostCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Operational': '#f44336',
      'Marketing': '#2196f3',
      'Logistics': '#ffeb3b',
      'Other': '#4caf50'
    };
    return colors[category] || '#9e9e9e';
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
        {/* Cost Breakdown Chart */}
        {costBreakdownData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <ChartWidget
              id={`${id}-chart`}
              title=""
              chartType={ChartType.PIE}
              data={costBreakdownData}
              height={300}
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
                        const total = financialMetrics?.costs.total || 1;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Cost Details Cards */}
        {financialMetrics && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(255, 99, 132, 0.1)', borderLeft: '4px solid #f44336' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Operational Costs
                  </Typography>
                  <Typography variant="h6" component="div">
                    {formatCurrency(financialMetrics.costs.operational)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage(getCostPercentage(financialMetrics.costs.operational, financialMetrics.costs.total))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(54, 162, 235, 0.1)', borderLeft: '4px solid #2196f3' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Marketing Costs
                  </Typography>
                  <Typography variant="h6" component="div">
                    {formatCurrency(financialMetrics.costs.marketing)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage(getCostPercentage(financialMetrics.costs.marketing, financialMetrics.costs.total))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(255, 206, 86, 0.1)', borderLeft: '4px solid #ffeb3b' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Logistics Costs
                  </Typography>
                  <Typography variant="h6" component="div">
                    {formatCurrency(financialMetrics.costs.logistics)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatPercentage(getCostPercentage(financialMetrics.costs.logistics, financialMetrics.costs.total))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(75, 192, 192, 0.1)', borderLeft: '4px solid #4caf50' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Costs
                  </Typography>
                  <Typography variant="h6" component="div">
                    {formatCurrency(financialMetrics.costs.total)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    100%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Cost Analysis Summary */}
        {financialMetrics && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Cost Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Operational costs represent {formatPercentage(getCostPercentage(financialMetrics.costs.operational, financialMetrics.costs.total))} of total expenses, 
              followed by logistics at {formatPercentage(getCostPercentage(financialMetrics.costs.logistics, financialMetrics.costs.total))} 
              and marketing at {formatPercentage(getCostPercentage(financialMetrics.costs.marketing, financialMetrics.costs.total))}.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default CostBreakdownWidget;