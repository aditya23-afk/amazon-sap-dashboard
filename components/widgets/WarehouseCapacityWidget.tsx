import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { Warehouse, LocalShipping, Inventory } from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { KPIWidget } from './KPIWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { ChartType, ChartData, BusinessMetrics, TrendDirection } from '../../types';

interface WarehouseCapacityWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
}

export const WarehouseCapacityWidget: React.FC<WarehouseCapacityWidgetProps> = ({
  id,
  title = 'Warehouse Capacity Utilization',
  refreshable = true,
  onRefresh
}) => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [capacityData, setCapacityData] = useState<ChartData | null>(null);
  const [warehouseDetails, setWarehouseDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate business metrics
      const metrics = mockDataGenerator.generateBusinessMetrics();
      setBusinessMetrics(metrics);
      
      // Generate warehouse capacity data
      const warehouses = [
        { name: 'West Coast Hub', capacity: 85, location: 'California' },
        { name: 'East Coast Hub', capacity: 92, location: 'New York' },
        { name: 'Central Hub', capacity: 78, location: 'Texas' },
        { name: 'Southeast Hub', capacity: 88, location: 'Florida' },
        { name: 'Northwest Hub', capacity: 73, location: 'Washington' }
      ];
      
      setWarehouseDetails(warehouses);
      
      // Create gauge chart data for overall capacity
      const gaugeData: ChartData = {
        labels: ['Utilization'],
        datasets: [{
          label: 'Capacity Utilization',
          data: [{ x: 'Utilization', y: metrics.inventory.utilizationRate }],
          backgroundColor: metrics.inventory.utilizationRate > 90 ? 'rgba(244, 67, 54, 0.8)' :
                          metrics.inventory.utilizationRate > 75 ? 'rgba(255, 152, 0, 0.8)' :
                          'rgba(76, 175, 80, 0.8)',
          borderColor: metrics.inventory.utilizationRate > 90 ? 'rgba(244, 67, 54, 1)' :
                      metrics.inventory.utilizationRate > 75 ? 'rgba(255, 152, 0, 1)' :
                      'rgba(76, 175, 80, 1)',
          borderWidth: 3
        }],
        metadata: {
          title: 'Overall Warehouse Utilization',
          description: 'Current capacity utilization across all warehouses',
          lastUpdated: new Date().toISOString()
        }
      };
      
      setCapacityData(gaugeData);
      
    } catch (err) {
      setError('Failed to load warehouse capacity data');
      console.error('Warehouse capacity data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapacityData();
  }, []);

  const handleRefresh = async () => {
    await loadCapacityData();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getCapacityStatus = (utilization: number): {
    color: 'success' | 'warning' | 'error';
    label: string;
  } => {
    if (utilization >= 95) return { color: 'error', label: 'Critical' };
    if (utilization >= 85) return { color: 'warning', label: 'High' };
    if (utilization >= 70) return { color: 'success', label: 'Optimal' };
    return { color: 'success', label: 'Low' };
  };

  const getCapacityColor = (utilization: number): string => {
    if (utilization >= 95) return '#f44336';
    if (utilization >= 85) return '#ff9800';
    if (utilization >= 70) return '#4caf50';
    return '#2196f3';
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
        {/* Capacity Overview KPIs */}
        {businessMetrics && (
          <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <KPIWidget
              id={`${id}-overall-utilization`}
              title="Overall Utilization"
              value={businessMetrics.inventory.utilizationRate}
              unit="%"
              format="number"
              trend={TrendDirection.UP}
              color={getCapacityColor(businessMetrics.inventory.utilizationRate)}
            />
            <KPIWidget
              id={`${id}-warehouse-capacity`}
              title="Warehouse Capacity"
              value={businessMetrics.inventory.warehouseCapacity}
              unit="%"
              format="number"
              trend={TrendDirection.STABLE}
              color="#2196f3"
            />
            <KPIWidget
              id={`${id}-available-space`}
              title="Available Space"
              value={100 - businessMetrics.inventory.utilizationRate}
              unit="%"
              format="number"
              trend={TrendDirection.DOWN}
              color="#4caf50"
            />
          </Box>
        )}

        {/* Overall Capacity Gauge */}
        {capacityData && (
          <Box sx={{ height: 250, mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ChartWidget
              id={`${id}-gauge`}
              title=""
              chartType={ChartType.GAUGE}
              data={capacityData}
              height={250}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    min: 0,
                    max: 100,
                    ticks: {
                      stepSize: 20
                    }
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Individual Warehouse Cards */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warehouse fontSize="small" />
            Warehouse Locations
          </Typography>
          <Grid container spacing={2}>
            {warehouseDetails.map((warehouse, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocalShipping fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight="medium">
                        {warehouse.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      {warehouse.location}
                    </Typography>
                    
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2">
                          Utilization
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPercentage(warehouse.capacity)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={warehouse.capacity}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getCapacityColor(warehouse.capacity),
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Status: {getCapacityStatus(warehouse.capacity).label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Capacity Analysis */}
        {businessMetrics && (
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory fontSize="small" />
              Capacity Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current utilization is at {formatPercentage(businessMetrics.inventory.utilizationRate)}, 
              which is {getCapacityStatus(businessMetrics.inventory.utilizationRate).label.toLowerCase()} level.
              {businessMetrics.inventory.utilizationRate > 90 && 
                ' Consider expanding capacity or optimizing inventory distribution.'}
              {businessMetrics.inventory.utilizationRate < 70 && 
                ' There is significant available capacity for growth.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total items stored: {formatNumber(businessMetrics.inventory.totalItems)} • 
              Available capacity: {formatPercentage(100 - businessMetrics.inventory.utilizationRate)}
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default WarehouseCapacityWidget;