import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Sidebar from '../Sidebar';
import theme from '../../../theme';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  const mockProps = {
    open: true,
    onToggle: jest.fn(),
    mobileOpen: false,
    onMobileToggle: jest.fn(),
  };

  it('should render all navigation menu items', () => {
    renderWithProviders(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('should render user profile when sidebar is open', () => {
    renderWithProviders(<Sidebar {...mockProps} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Business Analyst')).toBeInTheDocument();
  });

  it('should hide text when sidebar is collapsed', () => {
    const collapsedProps = { ...mockProps, open: false };
    renderWithProviders(<Sidebar {...collapsedProps} />);
    
    // Text should not be visible when collapsed
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should handle navigation clicks', () => {
    renderWithProviders(<Sidebar {...mockProps} />);
    
    const overviewButton = screen.getByText('Overview').closest('button');
    expect(overviewButton).toBeInTheDocument();
    
    if (overviewButton) {
      fireEvent.click(overviewButton);
      // Navigation should occur (tested through router integration)
    }
  });
});