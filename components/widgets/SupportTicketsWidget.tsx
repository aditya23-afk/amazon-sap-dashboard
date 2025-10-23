import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { Support, Schedule, CheckCircle, PendingActions } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber, formatDuration } from '../../utils/formatters';
import { ChartType, ChartData, CustomerMetrics, TrendDirection } from '../../types';

interface SupportTicketsWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

interface TicketCategory {
  name: string;
  open: number;
  resolved: number;
  avgResolutionTime: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const SupportTicketsWidget: React.FC<SupportTicketsWidgetProps> = ({
  id,
  title = 'Support Tickets & Resolution Analytics',
  refreshable = true,
  onRefresh
}) => {
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [ticketVolumeData, setTicketVolumeData] = useState<ChartData | null>(null);
  const [resolutionTimeData, setResolutionTimeData] = useState<ChartData | null>(null);
  const [ticketCategories, setTicketCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSupportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate customer metrics
      const metrics = mockDataGenerator.generateCustomerMetrics();
      setCustomerMetrics(metrics);
      
      // Generate ticket categories
      const categories: TicketCategory[] = [
        {
          name: 'Order Issues',
          open: Math.floor(Math.random() * 200) + 50,
          resolved: Math.floor(Math.random() * 800) + 200,
          avgResolutionTime: Math.random() * 24 + 4,
          priority: 'high'
        },
        {
          name: 'Product Returns',
          open: Math.floor(Math.random() * 150) + 30,
          resolved: Math.floor(Math.random() * 600) + 150,
          avgResolutionTime: Math.random() * 48 + 8,
          priority: 'medium'
        },
        {
          name: 'Technical Support',
          open: Math.floor(Math.random() * 100) + 20,
          resolved: Math.floor(Math.random() * 400) + 100,
          avgResolutionTime: Math.random() * 72 + 12,
          priority: 'medium'
        },
        {
          name: 'Billing Inquiries',
          open: Math.floor(Math.random() * 80) + 15,
          resolved: Math.floor(Math.random() * 300) + 80,
          avgResolutionTime: Math.random() * 12 + 2,
          priority: 'high'
        },
        {
          name: 'Account Issues',
          open: Math.floor(Math.random() * 60) + 10,
          resolved: Math.floor(Math.random() * 200) + 50,
          avgResolutionTime: Math.random() * 36 + 6,
          priority: 'critical'
        }
      ];
      
      setTicketCategories(categories);
      
      // Generate ticket volume chart data
      const days = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const openTickets = days.map(() => Math.floor(Math.random() * 100) + 50);
      const resolvedTickets = days.map(() => Math.floor(Math.random() * 120) + 60);
      
      const volumeData: ChartData = {
        labels: days,
        datasets: [
          {
            label: 'New Tickets',
            data: openTickets.map((count, index) => ({
              x: days[index] || `Day ${index}`,
              y: count
            })),
            backgroundColor: 'rgba(255, 152, 0, 0.6)',
            borderColor: 'rgba(255, 152, 0, 1)',
            borderWidth: 2
          },
          {
            label: 'Resolved Tickets',
            data: resolvedTickets.map((count, index) => ({
              x: days[index] || `Day ${index}`,
              y: count
            })),
            backgroundColor: 'rgba(76, 175, 80, 0.6)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2
          }
        ],
        metadata: {
          title: 'Daily Ticket Volume',
          description: 'New vs resolved tickets over the last 14 days',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setTicketVolumeData(volumeData);
      
      // Generate resolution time chart data
      const resolutionData: ChartData = {
        labels: categories.map(cat => cat.name),
        datasets: [{
          label: 'Avg Resolution Time (hours)',
          data: categories.map((cat, index) => ({
            x: cat.name,
            y: cat.avgResolutionTime
          })),
          backgroundColor: categories.map(cat => {
            switch (cat.priority) {
              case 'critical': return 'rgba(244, 67, 54, 0.6)';
              case 'high': return 'rgba(255, 152, 0, 0.6)';
              case 'medium': return 'rgba(33, 150, 243, 0.6)';
              default: return 'rgba(76, 175, 80, 0.6)';
            }
          }),
          borderColor: categories.map(cat => {
            switch (cat.priority) {
              case 'critical': return 'rgba(244, 67, 54, 1)';
              case 'high': return 'rgba(255, 152, 0, 1)';
              case 'medium': return 'rgba(33, 150, 243, 1)';
              default: return 'rgba(76, 175, 80, 1)';
            }
          }),
          borderWidth: 2
        }],
        metadata: {
          title: 'Resolution Time by Category',
          description: 'Average resolution time across different ticket categories',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setResolutionTimeData(resolutionData);
      
    } catch (err) {
      setError('Failed to load support data');
      console.error('Support data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  const handleRefresh = async () => {
    await loadSupportData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'success';
    }
  };

  const getResolutionEfficiency = (resolved: number, open: number): number => {
    const total = resolved + open;
    return total > 0 ? (resolved / total) * 100 : 0;
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
        {/* Support Overview KPIs */}
        {customerMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-open-tickets`}
              title="Open Tickets"
              value={customerMetrics.support.ticketsOpen}
              unit="tickets"
              format="number"
              trend={TrendDirection.DOWN}
              color="#ff9800"
            />
            <KPIWidget
              id={`${id}-resolved-tickets`}
              title="Resolved Today"
              value={customerMetrics.support.ticketsResolved}
              unit="tickets"
              format="number"
              trend={TrendDirection.UP}
              color="#4caf50"
            />
            <KPIWidget
              id={`${id}-avg-resolution`}
              title="Avg Resolution"
              value={customerMetrics.support.averageResolutionTime}
              unit="hrs"
              format="number"
              precision={1}
              trend={TrendDirection.DOWN}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-escalations`}
              title="Escalations"
              value={customerMetrics.support.escalations}
              unit="tickets"
              format="number"
              trend={TrendDirection.STABLE}
              color="#f44336"
            />
          </Box>
        )}

        {/* Ticket Volume Chart */}
        {ticketVolumeData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Support fontSize="small" />
              Ticket Volume Trends
            </Typography>
            <ChartWidget
              id={`${id}-volume-chart`}
              title=""
              chartType={ChartType.BAR}
              data={ticketVolumeData}
              height={280}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Tickets'
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Ticket Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PendingActions fontSize="small" />
            Ticket Categories
          </Typography>
          <Grid container spacing={2}>
            {ticketCategories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {category.name}
                      </Typography>
                      <Chip
                        label={category.priority.toUpperCase()}
                        color={getPriorityColor(category.priority)}
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Open: {formatNumber(category.open)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Resolved: {formatNumber(category.resolved)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption">
                          Resolution Rate
                        </Typography>
                        <Typography variant="caption">
                          {getResolutionEfficiency(category.resolved, category.open).toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getResolutionEfficiency(category.resolved, category.open)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Schedule fontSize="small" />
                      Avg: {formatDuration(category.avgResolutionTime * 60 * 60 * 1000, 'short')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Resolution Time Chart */}
        {resolutionTimeData && (
          <Box sx={{ height: 300, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule fontSize="small" />
              Average Resolution Time by Category
            </Typography>
            <ChartWidget
              id={`${id}-resolution-chart`}
              title=""
              chartType={ChartType.BAR}
              data={resolutionTimeData}
              height={280}
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
                        const hours = context.parsed.y;
                        return `Resolution Time: ${formatDuration(hours * 60 * 60 * 1000, 'long')}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Hours'
                    },
                    ticks: {
                      callback: (value: any) => `${value}h`
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Support Performance Summary */}
        {customerMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle fontSize="small" />
              Support Performance Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current resolution time of {formatDuration(customerMetrics.support.averageResolutionTime * 60 * 60 * 1000, 'long')} is 
              {customerMetrics.support.averageResolutionTime <= 24 ? ' within' : ' above'} target SLA. 
              {customerMetrics.support.ticketsOpen} tickets are currently open with 
              {customerMetrics.support.escalations} requiring escalation.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Resolution efficiency: {((customerMetrics.support.ticketsResolved / (customerMetrics.support.ticketsResolved + customerMetrics.support.ticketsOpen)) * 100).toFixed(1)}% • 
              Daily throughput: {formatNumber(customerMetrics.support.ticketsResolved)} tickets
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default SupportTicketsWidget;