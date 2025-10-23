import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardCustomization from '../DashboardCustomization';
import dashboardReducer from '../../../store/slices/dashboardSlice';
import uiReducer from '../../../store/slices/uiSlice';

// Mock store for testing
const createMockStore = () => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
      ui: uiReducer,
    },
  });
};

describe('DashboardCustomization', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };

  it('renders customization tabs', () => {
    renderWithProvider(<DashboardCustomization />);
    
    expect(screen.getByText('Widgets')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('allows switching between tabs', () => {
    renderWithProvider(<DashboardCustomization />);
    
    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);
    
    expect(screen.getByText('Dashboard Settings')).toBeInTheDocument();
    expect(screen.getByText('Auto Refresh')).toBeInTheDocument();
  });

  it('handles theme changes', () => {
    renderWithProvider(<DashboardCustomization />);
    
    const appearanceTab = screen.getByText('Appearance');
    fireEvent.click(appearanceTab);
    
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('handles localStorage operations', () => {
    renderWithProvider(<DashboardCustomization />);
    
    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);
    
    const saveButton = screen.getByText('Save Preferences');
    fireEvent.click(saveButton);
    
    expect(localStorage.setItem).toHaveBeenCalled();
  });
});