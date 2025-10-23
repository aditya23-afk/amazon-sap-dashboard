import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import {
  InventoryLevelsWidget,
  WarehouseCapacityWidget,
  InventoryThresholdWidget,
  InventoryDrillDownWidget
} from '../components/widgets';

export const InventoryDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.main', color: 'success.contrastText' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory & Supply Chain Dashboard
        </Typography>
        <Typography variant="subtitle1">
          Real-time inventory monitoring, warehouse capacity tracking, and supply chain analytics
        </Typography>
      </Paper>

      {/* Inventory Widgets Grid */}
      <Grid container spacing={3}>
        {/* Inventory Levels - Full Width */}
        <Grid item xs={12}>
          <InventoryLevelsWidget
            id="inventory-levels"
            title="Inventory Levels Across Categories"
            refreshable={true}
          />
        </Grid>

        {/* Warehouse Capacity - Half Width */}
        <Grid item xs={12} lg={6}>
          <WarehouseCapacityWidget
            id="warehouse-capacity"
            title="Warehouse Utilization"
            refreshable={true}
          />
        </Grid>

        {/* Inventory Threshold Alerts - Half Width */}
        <Grid item xs={12} lg={6}>
          <InventoryThresholdWidget
            id="inventory-thresholds"
            title="Stock Level Alerts"
            refreshable={true}
          />
        </Grid>

        {/* Inventory Drill-Down - Full Width */}
        <Grid item xs={12}>
          <InventoryDrillDownWidget
            id="inventory-drilldown"
            title="Category & Product Analysis"
            refreshable={true}
          />
        </Grid>
      </Grid>

      {/* Footer Information */}
      <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Inventory data is synchronized with warehouse management systems every 15 minutes. 
          Last sync: {new Date().toLocaleString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default InventoryDashboard;