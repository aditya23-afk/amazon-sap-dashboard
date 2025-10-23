import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { People, PersonAdd, PersonRemove, TrendingUp, TrendingDown } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { ChartType, ChartData, CustomerMetrics, TrendDirection } from '../../types';

interface CustomerRetentionWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

interface CohortData {
  period: string;
  newCustomers: number;
  retainedCustomers: number;
  churnedCustomers: number;
  retentionRate: number;
}

export const CustomerRetentionWidget: React.FC<CustomerRetentionWidgetProps> = ({
  id,
  title = 'Customer Retention & Churn Analysis',
  refreshable = true,
  onRefresh
}) => {
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [retentionTrendData, setRetentionTrendData] = useState<ChartData | null>(null);
  const [churnAnalysisData, setChurnAnalysisData] = useState<ChartData | null>(null);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRetentionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate customer metrics
      const metrics = mockDataGenerator.generateCustomerMetrics();
      setCustomerMetrics(metrics);
      
      // Generate cohort data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const cohorts: CohortData[] = months.map(month => {
        const newCustomers = Math.floor(Math.random() * 5000) + 2000;
        const churnedCustomers = Math.floor(Math.random() * 800) + 200;
        const retainedCustomers = newCustomers - churnedCustomers;
        const retentionRate = (retainedCustomers / newCustomers) * 100;
        
        return {
          period: month,
          newCustomers,
          retainedCustomers,
          churnedCustomers,
          retentionRate
        };
      });
      
      setCohortData(cohorts);
      
      // Generate retention trend chart
      const retentionTrend: ChartData = {
        labels: months,
        datasets: [
          {
            label: 'Retention Rate (%)',
            data: cohorts.map((cohort, index) => ({
              x: cohort.period,
              y: cohort.retentionRate
            })),
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Churn Rate (%)',
            data: cohorts.map((cohort, index) => ({
              x: cohort.period,
              y: 100 - cohort.retentionRate
            })),
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            borderColor: 'rgba(244, 67, 54, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ],
        metadata: {
          title: 'Retention vs Churn Trends',
          description: 'Monthly retention and churn rate trends',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setRetentionTrendData(retentionTrend);
      
      // Generate churn analysis by reason
      const churnReasons = [
        { reason: 'Price Sensitivity', percentage: 35 },
        { reason: 'Product Quality', percentage: 25 },
        { reason: 'Customer Service', percentage: 20 },
        { reason: 'Competitor Switch', percentage: 15 },
        { reason: 'Other', percentage: 5 }
      ];
      
      const churnAnalysis: ChartData = {
        labels: churnReasons.map(r => r.reason),
        datasets: [{
          label: 'Churn Reasons',
          data: churnReasons.map((reason, index) => ({
            x: reason.reason,
            y: reason.percentage
          })),
          backgroundColor: [
            'rgba(244, 67, 54, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(33, 150, 243, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(96, 125, 139, 0.8)'
          ],
          borderColor: [
            'rgba(244, 67, 54, 1)',
            'rgba(255, 152, 0, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(96, 125, 139, 1)'
          ],
          borderWidth: 2
        }],
        metadata: {
          title: 'Churn Analysis by Reason',
          description: 'Primary reasons for customer churn',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setChurnAnalysisData(churnAnalysis);
      
    } catch (err) {
      setError('Failed to load retention data');
      console.error('Retention data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetentionData();
  }, []);

  const handleRefresh = async () => {
    await loadRetentionData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getRetentionStatus = (rate: number): {
    color: 'success' | 'warning' | 'error';
    label: string;
  } => {
    if (rate >= 90) return { color: 'success', label: 'Excellent' };
    if (rate >= 80) return { color: 'success', label: 'Good' };
    if (rate >= 70) return { color: 'warning', label: 'Average' };
    return { color: 'error', label: 'Poor' };
  };

  const getChurnTrend = (currentRate: number, previousRate: number): TrendDirection => {
    const diff = currentRate - previousRate;
    if (Math.abs(diff) < 1) return TrendDirection.STABLE;
    return diff > 0 ? TrendDirection.UP : TrendDirection.DOWN;
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
        {/* Retention Overview KPIs */}
        {customerMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-retention-rate`}
              title="Retention Rate"
              value={customerMetrics.retention.rate}
              unit="%"
              format="number"
              precision={1}
              trend={TrendDirection.UP}
              color="#4caf50"
            />
            <KPIWidget
              id={`${id}-churn-rate`}
              title="Churn Rate"
              value={customerMetrics.retention.churnRate}
              unit="%"
              format="number"
              precision={1}
              trend={TrendDirection.DOWN}
              color="#f44336"
            />
            <KPIWidget
              id={`${id}-new-customers`}
              title="New Customers"
              value={customerMetrics.retention.newCustomers}
              unit="customers"
              format="number"
              trend={TrendDirection.UP}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-returning-customers`}
              title="Returning"
              value={customerMetrics.retention.returningCustomers}
              unit="customers"
              format="number"
              trend={TrendDirection.UP}
              color="#ff9800"
            />
          </Box>
        )}

        {/* Retention Status Card */}
        {customerMetrics && (
          <Card sx={{ mb: 3, bgcolor: getRetentionStatus(customerMetrics.retention.rate).color + '.light', opacity: 0.1 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h3" component="div" fontWeight="bold">
                  {formatPercentage(customerMetrics.retention.rate)}
                </Typography>
              </Box>
              
              <Chip
                label={getRetentionStatus(customerMetrics.retention.rate).label + ' Retention'}
                color={getRetentionStatus(customerMetrics.retention.rate).color}
                icon={customerMetrics.retention.rate >= 80 ? <TrendingUp /> : <TrendingDown />}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary">
                {formatNumber(customerMetrics.retention.returningCustomers)} returning customers out of 
                {' '}{formatNumber(customerMetrics.retention.returningCustomers + customerMetrics.retention.newCustomers)} total
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Retention Trend Chart */}
        {retentionTrendData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp fontSize="small" />
              Retention vs Churn Trends
            </Typography>
            <ChartWidget
              id={`${id}-trend-chart`}
              title=""
              chartType={ChartType.LINE}
              data={retentionTrendData}
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
                        return `${context.dataset.label}: ${value.toFixed(1)}%`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Percentage (%)'
                    },
                    ticks: {
                      callback: (value: any) => `${value}%`
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Customer Cohort Analysis */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAdd fontSize="small" />
            Monthly Cohort Performance
          </Typography>
          <Grid container spacing={1}>
            {cohortData.slice(-6).map((cohort, index) => (
              <Grid item xs={12} sm={6} md={2} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                      {cohort.period}
                    </Typography>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {formatPercentage(cohort.retentionRate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      New: {formatNumber(cohort.newCustomers)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Retained: {formatNumber(cohort.retainedCustomers)}
                    </Typography>
                    <Typography variant="caption" color="error.main" sx={{ display: 'block' }}>
                      Churned: {formatNumber(cohort.churnedCustomers)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Churn Analysis Chart */}
        {churnAnalysisData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonRemove fontSize="small" />
              Churn Analysis by Reason
            </Typography>
            <ChartWidget
              id={`${id}-churn-chart`}
              title=""
              chartType={ChartType.PIE}
              data={churnAnalysisData}
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
                        return `${context.label}: ${value}%`;
                      }
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Retention Insights */}
        {customerMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Retention Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current retention rate of {formatPercentage(customerMetrics.retention.rate)} is 
              {customerMetrics.retention.rate >= 85 ? ' above' : ' below'} industry benchmark. 
              Churn rate of {formatPercentage(customerMetrics.retention.churnRate)} indicates 
              {customerMetrics.retention.churnRate <= 5 ? 'excellent' : customerMetrics.retention.churnRate <= 10 ? 'good' : 'concerning'} customer loyalty.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Focus areas: Price sensitivity (35% of churn) and product quality (25% of churn) are the primary retention challenges.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default CustomerRetentionWidget;