import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import { Warning, Error as ErrorIcon, CheckCircle } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber } from '../../utils/formatters';
import { ChartType, ChartData, BusinessMetrics, AlertLevel, TrendDirection } from '../../types';

interface InventoryLevelsWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
  category?: string;
}

export const InventoryLevelsWidget: React.FC<InventoryLevelsWidgetProps> = ({
  id,
  title = 'Inventory Levels by Category',
  refreshable = true,
  onRefresh,
  category
}) => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [inventoryData, setInventoryData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate business metrics for inventory data
      const metrics = mockDataGenerator.generateBusinessMetrics();
      setBusinessMetrics(metrics);
      
      // Generate inventory chart data
      const chartData = mockDataGenerator.generateInventoryData(category);
      setInventoryData(chartData);
      
    } catch (err) {
      setError('Failed to load inventory data');
      console.error('Inventory data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, [category]);

  const handleRefresh = async () => {
    await loadInventoryData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getAlertLevelColor = (level: AlertLevel): 'success' | 'warning' | 'error' => {
    switch (level) {
      case AlertLevel.LOW:
        return 'success';
      case AlertLevel.MEDIUM:
        return 'warning';
      case AlertLevel.HIGH:
      case AlertLevel.CRITICAL:
        return 'error';
      default:
        return 'success';
    }
  };

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.LOW:
        return <CheckCircle />;
      case AlertLevel.MEDIUM:
        return <Warning />;
      case AlertLevel.HIGH:
      case AlertLevel.CRITICAL:
        return <ErrorIcon />;
      default:
        return <CheckCircle />;
    }
  };

  const getCriticalCategories = () => {
    if (!businessMetrics) return [];
    return businessMetrics.inventory.categories.filter(
      cat => cat.alertLevel === AlertLevel.HIGH || cat.alertLevel === AlertLevel.CRITICAL
    );
  };

  return (
    <BaseWidget
      id={id}
      title={title}
      loading={loading}
      error={error}
      refreshable={refreshable}
      onRefresh={handleRefresh}
    >
      <Box sx={{ p: 2 }}>
        {/* Inventory Overview KPIs */}
        {businessMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-total-items`}
              title="Total Items"
              value={businessMetrics.inventory.totalItems}
              unit="items"
              format="number"
              trend={TrendDirection.UP}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-low-stock`}
              title="Low Stock"
              value={businessMetrics.inventory.lowStock}
              unit="items"
              format="number"
              trend={TrendDirection.DOWN}
              color="#ff9800"
            />
            <KPIWidget
              id={`${id}-out-of-stock`}
              title="Out of Stock"
              value={businessMetrics.inventory.outOfStock}
              unit="items"
              format="number"
              trend={TrendDirection.STABLE}
              color="#f44336"
            />
          </Box>
        )}

        {/* Critical Inventory Alerts */}
        {businessMetrics && getCriticalCategories().length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity="warning" 
              icon={<Warning />}
              sx={{ mb: 2 }}
            >
              {getCriticalCategories().length} categories require immediate attention
            </Alert>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {getCriticalCategories().map((category) => (
                <Chip
                  key={category.id}
                  label={`${category.name}: ${category.outOfStockItems} out of stock`}
                  color={getAlertLevelColor(category.alertLevel)}
                  size="small"
                  icon={getAlertIcon(category.alertLevel)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Inventory Levels Chart */}
        {inventoryData && (
          <Box sx={{ height: 350, mb: 3 }}>
            <ChartWidget
              id={`${id}-chart`}
              title=""
              chartType={ChartType.BAR}
              data={inventoryData}
              height={350}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  },
                  tooltip: {
                    callbacks: {
                      label: (context: any) => {
                        const value = context.parsed.y;
                        return `${context.dataset.label}: ${formatNumber(value)} items`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    stacked: true,
                    ticks: {
                      callback: (value: any) => formatNumber(value)
                    },
                    title: {
                      display: true,
                      text: 'Number of Items'
                    }
                  },
                  x: {
                    stacked: true,
                    title: {
                      display: true,
                      text: 'Product Categories'
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Category Details */}
        {businessMetrics && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Category Status Overview
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
              {businessMetrics.inventory.categories.slice(0, 4).map((category) => (
                <Box
                  key={category.id}
                  sx={{
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: category.alertLevel === AlertLevel.CRITICAL ? 'error.light' : 
                             category.alertLevel === AlertLevel.HIGH ? 'warning.light' : 
                             'success.light',
                    opacity: 0.1
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: {formatNumber(category.totalItems)} • 
                    Low: {formatNumber(category.lowStockItems)} • 
                    Out: {formatNumber(category.outOfStockItems)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Inventory Summary */}
        {businessMetrics && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Inventory Health: {businessMetrics.inventory.outOfStock === 0 ? 'Excellent' : 
                                businessMetrics.inventory.outOfStock < 100 ? 'Good' : 'Needs Attention'}
              {' • '}
              Stock Coverage: {((businessMetrics.inventory.totalItems - businessMetrics.inventory.outOfStock) / businessMetrics.inventory.totalItems * 100).toFixed(1)}%
              {' • '}
              Last Updated: {new Date(businessMetrics.inventory.lastUpdated).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default InventoryLevelsWidget;