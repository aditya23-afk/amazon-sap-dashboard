import React, { useState, useEffect } from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { KPIWidget } from '../components/widgets/KPIWidget';
import { mockDataGenerator } from '../services/mockDataService';
import { TrendDirection } from '../types';

const Overview: React.FC = () => {
  const [businessData, setBusinessData] = useState<any>(null);

  useEffect(() => {
    // Load data immediately
    const data = mockDataGenerator.generateBusinessMetrics();
    setBusinessData(data);
  }, []);

  if (!businessData) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4">Amazon SAP Dashboard</Typography>
        <Typography variant="subtitle1">Business Intelligence Overview</Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPIWidget
            id="revenue"
            title="Total Revenue"
            value={businessData.revenue.current}
            unit="USD"
            format="currency"
            trend={businessData.revenue.trend > 0 ? TrendDirection.UP : TrendDirection.DOWN}
            trendValue={businessData.revenue.trend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIWidget
            id="orders"
            title="Total Orders"
            value={businessData.orders.total}
            unit="orders"
            trend={TrendDirection.UP}
            trendValue={8.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIWidget
            id="pending"
            title="Pending Orders"
            value={businessData.orders.pending}
            unit="orders"
            trend={TrendDirection.STABLE}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPIWidget
            id="inventory"
            title="Inventory Items"
            value={businessData.inventory.totalItems}
            unit="items"
            trend={TrendDirection.UP}
            trendValue={2.1}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
