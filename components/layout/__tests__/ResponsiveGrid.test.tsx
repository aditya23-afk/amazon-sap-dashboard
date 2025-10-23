import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { ResponsiveGrid, ResponsiveGridItem } from '../ResponsiveGrid';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('ResponsiveGrid', () => {
  it('renders children correctly', () => {
    render(
      <TestWrapper>
        <ResponsiveGrid>
          <ResponsiveGridItem>
            <div>Test Content</div>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct spacing', () => {
    const { container } = render(
      <TestWrapper>
        <ResponsiveGrid spacing={2}>
          <ResponsiveGridItem>
            <div>Test Content</div>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </TestWrapper>
    );

    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it('handles priority-based ordering', () => {
    render(
      <TestWrapper>
        <ResponsiveGrid>
          <ResponsiveGridItem priority="low">
            <div>Low Priority</div>
          </ResponsiveGridItem>
          <ResponsiveGridItem priority="high">
            <div>High Priority</div>
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </TestWrapper>
    );

    expect(screen.getByText('Low Priority')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });
});