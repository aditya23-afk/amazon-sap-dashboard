import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import {
  CustomerSatisfactionWidget,
  SupportTicketsWidget,
  CustomerRetentionWidget,
  ProductReturnsWidget
} from '../components/widgets';

const Customers: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.main', color: 'info.contrastText' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Service & Satisfaction Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Comprehensive customer experience analytics, support metrics, and satisfaction tracking
        </Typography>
      </Paper>

      {/* Customer Service Widgets Grid */}
      <Grid container spacing={3}>
        {/* Customer Satisfaction - Half Width */}
        <Grid item xs={12} lg={6}>
          <CustomerSatisfactionWidget
            id="customer-satisfaction"
            title="Customer Satisfaction Analysis"
            refreshable={true}
          />
        </Grid>

        {/* Support Tickets - Half Width */}
        <Grid item xs={12} lg={6}>
          <SupportTicketsWidget
            id="support-tickets"
            title="Support Tickets & Resolution"
            refreshable={true}
          />
        </Grid>

        {/* Customer Retention - Full Width */}
        <Grid item xs={12}>
          <CustomerRetentionWidget
            id="customer-retention"
            title="Customer Retention & Churn Analysis"
            refreshable={true}
          />
        </Grid>

        {/* Product Returns - Full Width */}
        <Grid item xs={12}>
          <ProductReturnsWidget
            id="product-returns"
            title="Product Returns & Quality Analysis"
            refreshable={true}
          />
        </Grid>
      </Grid>

      {/* Footer Information */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Customer service data is updated in real-time from support systems and customer feedback platforms. 
          Last update: {new Date().toLocaleString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Customers;