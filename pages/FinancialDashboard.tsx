import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import {
  RevenueWidget,
  ProfitMarginWidget,
  CostBreakdownWidget,
  FinancialVarianceWidget
} from '../components/widgets';

export const FinancialDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Analytics Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Comprehensive financial metrics and performance indicators for Amazon business operations
        </Typography>
      </Paper>

      {/* Financial Widgets Grid */}
      <Grid container spacing={3}>
        {/* Revenue Trends - Full Width */}
        <Grid item xs={12}>
          <RevenueWidget
            id="revenue-trends"
            title="Revenue Trends & Forecasting"
            refreshable={true}
          />
        </Grid>

        {/* Profit Margin Analysis - Half Width */}
        <Grid item xs={12} lg={6}>
          <ProfitMarginWidget
            id="profit-margins"
            title="Profit Margin Analysis"
            refreshable={true}
          />
        </Grid>

        {/* Cost Breakdown - Half Width */}
        <Grid item xs={12} lg={6}>
          <CostBreakdownWidget
            id="cost-breakdown"
            title="Cost Distribution"
            refreshable={true}
          />
        </Grid>

        {/* Financial Variance - Full Width */}
        <Grid item xs={12}>
          <FinancialVarianceWidget
            id="financial-variance"
            title="Budget vs Actual Performance"
            refreshable={true}
          />
        </Grid>
      </Grid>

      {/* Footer Information */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Financial data is updated every 5 minutes. Last refresh: {new Date().toLocaleString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default FinancialDashboard;