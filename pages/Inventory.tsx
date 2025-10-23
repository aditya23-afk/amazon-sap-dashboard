import React from 'react';
import { Typography, Box } from '@mui/material';

const Inventory: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      <Typography variant="body1">
        This page will display inventory levels, warehouse capacity, and supply chain metrics.
      </Typography>
    </Box>
  );
};

export default Inventory;