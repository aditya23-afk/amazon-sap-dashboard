import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import DashboardCustomization from '../components/customization/DashboardCustomization';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Customize your dashboard layout, appearance, and preferences.
        </Typography>
        
        <Paper elevation={1} sx={{ p: 0 }}>
          <DashboardCustomization />
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;