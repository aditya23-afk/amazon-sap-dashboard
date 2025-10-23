import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { KPIWidget } from './KPIWidget';
import { ChartWidget } from './ChartWidget';
import { TrendDirection, ChartType } from '../../types';

/**
 * Demo component to showcase the widget functionality
 * This can be used for testing and development purposes
 */
export const WidgetDemo: React.FC = () => {
  // Sample KPI data
  const kpiData = [
    {
      id: 'revenue-kpi',
      title: 'Total Revenue',
      value: 1250000,
      unit: 'USD',
      trend: TrendDirection.UP,
      trendValue: 15.5,
      target: 1200000,
      format: 'currency' as const,
      precision: 0
    },
    {
      id: 'orders-kpi',
      title: 'Orders Today',
      value: 342,
      unit: 'orders',
      trend: TrendDirection.DOWN,
      trendValue: -5.2,
      format: 'number' as const,
      precision: 0
    },
    {
      id: 'satisfaction-kpi',
      title: 'Customer Satisfaction',
      value: 94.5,
      unit: '%',
      trend: TrendDirection.UP,
      trendValue: 2.1,
      format: 'percentage' as const,
      precision: 1
    }
  ];

  // Sample chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [
          { x: 'Jan', y: 65000 },
          { x: 'Feb', y: 59000 },
          { x: 'Mar', y: 80000 },
          { x: 'Apr', y: 81000 },
          { x: 'May', y: 56000 },
          { x: 'Jun', y: 95000 }
        ],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
      }
    ],
    metadata: {
      title: 'Monthly Revenue Trend',
      description: 'Revenue performance over the last 6 months',
      lastUpdated: new Date().toISOString()
    }
  };

  const barChartData = {
    labels: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
    datasets: [
      {
        label: 'Sales',
        data: [
          { x: 'Electronics', y: 120000 },
          { x: 'Clothing', y: 95000 },
          { x: 'Books', y: 45000 },
          { x: 'Home & Garden', y: 78000 }
        ],
        backgroundColor: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7']
      }
    ],
    metadata: {
      title: 'Sales by Category',
      description: 'Current month sales breakdown by product category'
    }
  };

  const pieChartData = {
    labels: ['North America', 'Europe', 'Asia', 'Other'],
    datasets: [
      {
        label: 'Revenue Distribution',
        data: [
          { x: 'North America', y: 45 },
          { x: 'Europe', y: 30 },
          { x: 'Asia', y: 20 },
          { x: 'Other', y: 5 }
        ],
        backgroundColor: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7']
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Widget Components Demo
      </Typography>
      
      {/* KPI Widgets */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        KPI Widgets
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi) => (
          <Grid item xs={12} sm={6} md={4} key={kpi.id}>
            <KPIWidget
              id={kpi.id}
              title={kpi.title}
              value={kpi.value}
              unit={kpi.unit}
              trend={kpi.trend}
              trendValue={kpi.trendValue}
              target={kpi.target}
              format={kpi.format}
              precision={kpi.precision}
              refreshable={true}
              onRefresh={() => console.log(`Refreshing ${kpi.title}`)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Chart Widgets */}
      <Typography variant="h6" gutterBottom>
        Chart Widgets
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartWidget
            id="line-chart-demo"
            title="Revenue Trend"
            chartType={ChartType.LINE}
            data={lineChartData}
            height={300}
            refreshable={true}
            onRefresh={() => console.log('Refreshing line chart')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartWidget
            id="bar-chart-demo"
            title="Sales by Category"
            chartType={ChartType.BAR}
            data={barChartData}
            height={300}
            refreshable={true}
            onRefresh={() => console.log('Refreshing bar chart')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartWidget
            id="pie-chart-demo"
            title="Revenue by Region"
            chartType={ChartType.PIE}
            data={pieChartData}
            height={300}
            refreshable={true}
            onRefresh={() => console.log('Refreshing pie chart')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Gauge Chart Demo
              <br />
              (Custom implementation)
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WidgetDemo;