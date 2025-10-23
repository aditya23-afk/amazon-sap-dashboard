import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, Chip, Grid, Card, CardContent } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Star, ThumbUp } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber, formatPercentage } from '../../utils/formatters';
import { ChartType, ChartData, CustomerMetrics, TrendDirection } from '../../types';

interface CustomerSatisfactionWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const CustomerSatisfactionWidget: React.FC<CustomerSatisfactionWidgetProps> = ({
  id,
  title = 'Customer Satisfaction Analysis',
  refreshable = true,
  onRefresh
}) => {
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [satisfactionTrendData, setSatisfactionTrendData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSatisfactionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate customer metrics
      const metrics = mockDataGenerator.generateCustomerMetrics();
      setCustomerMetrics(metrics);
      
      // Generate satisfaction trend data over time
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const satisfactionScores = months.map(() => Math.random() * 1.5 + 3.5); // 3.5 to 5.0
      const surveyResponses = months.map(() => Math.floor(Math.random() * 2000) + 1000);
      
      const trendData: ChartData = {
        labels: months,
        datasets: [
          {
            label: 'Satisfaction Score',
            data: satisfactionScores.map((score, index) => ({
              x: months[index] || `Month ${index}`,
              y: score
            })),
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Survey Responses',
            data: surveyResponses.map((responses, index) => ({
              x: months[index] || `Month ${index}`,
              y: responses / 1000 // Scale down for better visualization
            })),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ],
        metadata: {
          title: 'Customer Satisfaction Trends',
          description: 'Monthly satisfaction scores and survey response volumes',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setSatisfactionTrendData(trendData);
      
    } catch (err) {
      setError('Failed to load satisfaction data');
      console.error('Satisfaction data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSatisfactionData();
  }, []);

  const handleRefresh = async () => {
    await loadSatisfactionData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getSatisfactionLevel = (score: number): {
    label: string;
    color: 'success' | 'warning' | 'error';
    icon: React.ReactElement;
  } => {
    if (score >= 4.5) return { label: 'Excellent', color: 'success', icon: <ThumbUp /> };
    if (score >= 4.0) return { label: 'Good', color: 'success', icon: <TrendingUp /> };
    if (score >= 3.5) return { label: 'Average', color: 'warning', icon: <TrendingFlat /> };
    return { label: 'Poor', color: 'error', icon: <TrendingDown /> };
  };

  const getTrendDirection = (trend: TrendDirection): React.ReactElement => {
    switch (trend) {
      case TrendDirection.UP:
        return <TrendingUp color="success" />;
      case TrendDirection.DOWN:
        return <TrendingDown color="error" />;
      default:
        return <TrendingFlat color="action" />;
    }
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
        {/* Satisfaction Overview KPIs */}
        {customerMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-satisfaction-score`}
              title="Satisfaction Score"
              value={customerMetrics.satisfaction.score}
              unit="/5"
              format="number"
              precision={2}
              trend={customerMetrics.satisfaction.trend}
              color="#4caf50"
            />
            <KPIWidget
              id={`${id}-survey-responses`}
              title="Survey Responses"
              value={customerMetrics.satisfaction.surveys}
              unit="responses"
              format="number"
              trend={TrendDirection.UP}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-retention-rate`}
              title="Retention Rate"
              value={customerMetrics.retention.rate}
              unit="%"
              format="number"
              precision={1}
              trend={TrendDirection.UP}
              color="#ff9800"
            />
          </Box>
        )}

        {/* Satisfaction Score Display */}
        {customerMetrics && (
          <Card sx={{ mb: 3, bgcolor: 'success.light', opacity: 0.1 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                <Star sx={{ fontSize: 40, color: 'warning.main' }} />
                <Typography variant="h3" component="div" fontWeight="bold">
                  {customerMetrics.satisfaction.score.toFixed(1)}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  / 5.0
                </Typography>
              </Box>
              
              <Rating
                value={customerMetrics.satisfaction.score}
                precision={0.1}
                readOnly
                size="large"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                {getTrendDirection(customerMetrics.satisfaction.trend)}
                <Chip
                  label={getSatisfactionLevel(customerMetrics.satisfaction.score).label}
                  color={getSatisfactionLevel(customerMetrics.satisfaction.score).color}
                  icon={getSatisfactionLevel(customerMetrics.satisfaction.score).icon}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Based on {formatNumber(customerMetrics.satisfaction.surveys)} customer surveys
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Satisfaction Trend Chart */}
        {satisfactionTrendData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <ChartWidget
              id={`${id}-trend-chart`}
              title=""
              chartType={ChartType.LINE}
              data={satisfactionTrendData}
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
                        if (context.datasetIndex === 0) {
                          return `Satisfaction: ${value.toFixed(2)}/5.0`;
                        } else {
                          return `Surveys: ${(value * 1000).toLocaleString()}`;
                        }
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    min: 3,
                    max: 5,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Satisfaction Score'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Survey Responses (K)'
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

        {/* Customer Metrics Summary */}
        {customerMetrics && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Customer Retention
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatPercentage(customerMetrics.retention.rate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Churn Rate: {formatPercentage(customerMetrics.retention.churnRate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Customers: {formatNumber(customerMetrics.retention.newCustomers)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Survey Insights
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    {formatNumber(customerMetrics.satisfaction.surveys)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Response Rate: {formatPercentage(75 + Math.random() * 20)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trend: {customerMetrics.satisfaction.trend === TrendDirection.UP ? 'Improving' : 
                            customerMetrics.satisfaction.trend === TrendDirection.DOWN ? 'Declining' : 'Stable'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Satisfaction Summary */}
        {customerMetrics && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Satisfaction Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current satisfaction score of {customerMetrics.satisfaction.score.toFixed(1)}/5.0 is 
              {customerMetrics.satisfaction.score >= 4.0 ? ' above' : ' below'} industry average. 
              Customer retention rate of {formatPercentage(customerMetrics.retention.rate)} indicates 
              {customerMetrics.retention.rate >= 85 ? 'strong' : customerMetrics.retention.rate >= 75 ? 'good' : 'moderate'} customer loyalty.
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default CustomerSatisfactionWidget;