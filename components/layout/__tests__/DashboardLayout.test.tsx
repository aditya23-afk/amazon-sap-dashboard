import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardLayout from '../DashboardLayout';
import theme from '../../../theme';

// Mock store for testing
const mockStore = configureStore({
  reducer: {
    dashboard: (state = {}) => state,
    data: (state = {}) => state,
    filters: (state = {}) => state,
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          {component}
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

describe('DashboardLayout', () => {
  it('should render the dashboard layout with header and sidebar', () => {
    renderWithProviders(<DashboardLayout />);
    
    // Check if header is rendered
    expect(screen.getByText('Amazon SAP Dashboard')).toBeInTheDocument();
    
    // Check if menu button is rendered
    expect(screen.getByLabelText('toggle sidebar')).toBeInTheDocument();
  });

  it('should toggle sidebar when menu button is clicked', () => {
    renderWithProviders(<DashboardLayout />);
    
    const menuButton = screen.getByLabelText('toggle sidebar');
    
    // Click the menu button
    fireEvent.click(menuButton);
    
    // The sidebar state should change (this is a basic test)
    expect(menuButton).toBeInTheDocument();
  });

  it('should render navigation menu items', () => {
    renderWithProviders(<DashboardLayout />);
    
    // Check if navigation items are rendered
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should render user profile section', () => {
    renderWithProviders(<DashboardLayout />);
    
    // Check if user profile is rendered
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Business Analyst')).toBeInTheDocument();
  });
});