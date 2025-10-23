import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  Inventory2, 
  Category as CategoryIcon,
  ArrowBack
} from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { ChartWidget } from './ChartWidget';
import { mockDataGenerator } from '../../services/mockDataService';
import { formatNumber } from '../../utils/formatters';
import { ChartType, ChartData, BusinessMetrics, InventoryCategory, AlertLevel } from '../../types';

interface InventoryDrillDownWidgetProps {
  id: string;
  title?: string;
  refreshable?: boolean;
  onRefresh?: () => void;
  initialCategory?: string;
}

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minThreshold: number;
  maxCapacity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked: string;
  supplier: string;
}

export const InventoryDrillDownWidget: React.FC<InventoryDrillDownWidgetProps> = ({
  id,
  title = 'Inventory Drill-Down Analysis',
  refreshable = true,
  onRefresh,
  initialCategory
}) => {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [drillDownData, setDrillDownData] = useState<ChartData | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDrillDownData = async (categoryId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate business metrics
      const metrics = mockDataGenerator.generateBusinessMetrics();
      setBusinessMetrics(metrics);
      
      if (categoryId) {
        // Find selected category
        const category = metrics.inventory.categories.find(cat => cat.id === categoryId);
        if (category) {
          setSelectedCategory(category);
          
          // Generate product items for the category
          const items: ProductItem[] = [];
          const productNames = [
            'Premium Wireless Headphones', 'Smart Fitness Tracker', 'Bluetooth Speaker',
            'Laptop Stand', 'USB-C Hub', 'Wireless Mouse', 'Mechanical Keyboard',
            'Monitor Stand', 'Webcam HD', 'Phone Case', 'Screen Protector', 'Charging Cable'
          ];
          
          for (let i = 0; i < 12; i++) {
            const currentStock = Math.floor(Math.random() * 500);
            const minThreshold = Math.floor(Math.random() * 50) + 10;
            const maxCapacity = Math.floor(Math.random() * 200) + 300;
            
            let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
            if (currentStock === 0) status = 'out_of_stock';
            else if (currentStock <= minThreshold) status = 'low_stock';
            
            items.push({
              id: `item-${i + 1}`,
              name: productNames[i] || `Product ${i + 1}`,
              sku: `SKU-${category.name.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
              currentStock,
              minThreshold,
              maxCapacity,
              status,
              lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              supplier: ['Amazon Logistics', 'Direct Supplier', 'Third Party'][Math.floor(Math.random() * 3)] || 'Amazon Logistics'
            });
          }
          
          setProductItems(items);
          
          // Create drill-down chart data
          const statusCounts = {
            in_stock: items.filter(item => item.status === 'in_stock').length,
            low_stock: items.filter(item => item.status === 'low_stock').length,
            out_of_stock: items.filter(item => item.status === 'out_of_stock').length
          };
          
          const chartData: ChartData = {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
              label: 'Product Status',
              data: [
                { x: 'In Stock', y: statusCounts.in_stock },
                { x: 'Low Stock', y: statusCounts.low_stock },
                { x: 'Out of Stock', y: statusCounts.out_of_stock }
              ],
              backgroundColor: [
                'rgba(76, 175, 80, 0.8)',
                'rgba(255, 152, 0, 0.8)',
                'rgba(244, 67, 54, 0.8)'
              ],
              borderColor: [
                'rgba(76, 175, 80, 1)',
                'rgba(255, 152, 0, 1)',
                'rgba(244, 67, 54, 1)'
              ],
              borderWidth: 2
            }],
            metadata: {
              title: `${category.name} Product Status`,
              description: `Status distribution for products in ${category.name} category`,
              lastUpdated: new Date().toISOString()
            }
          };
          
          setDrillDownData(chartData);
        }
      } else {
        setSelectedCategory(null);
        setProductItems([]);
        setDrillDownData(null);
      }
      
    } catch (err) {
      setError('Failed to load drill-down data');
      console.error('Drill-down data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrillDownData(initialCategory);
  }, [initialCategory]);

  const handleRefresh = async () => {
    await loadDrillDownData(selectedCategory?.id);
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleCategorySelect = (category: InventoryCategory) => {
    loadDrillDownData(category.id);
  };

  const handleBackToCategories = () => {
    loadDrillDownData();
  };

  const toggleRowExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'success';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
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
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleBackToCategories}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <CategoryIcon fontSize="small" />
            Categories
          </Link>
          {selectedCategory && (
            <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Inventory2 fontSize="small" />
              {selectedCategory.name}
            </Typography>
          )}
        </Breadcrumbs>

        {/* Category Selection View */}
        {!selectedCategory && businessMetrics && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select a category to drill down into product details:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              {businessMetrics.inventory.categories.map((category) => (
                <Paper
                  key={category.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)'
                    },
                    borderLeft: `4px solid ${
                      category.alertLevel === AlertLevel.CRITICAL ? '#f44336' :
                      category.alertLevel === AlertLevel.HIGH ? '#ff9800' :
                      '#4caf50'
                    }`
                  }}
                  onClick={() => handleCategorySelect(category)}
                >
                  <Typography variant="h6" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total: {formatNumber(category.totalItems)} items
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock: {formatNumber(category.lowStockItems)} • 
                    Out of Stock: {formatNumber(category.outOfStockItems)}
                  </Typography>
                  <Chip
                    label={category.alertLevel}
                    size="small"
                    color={
                      category.alertLevel === AlertLevel.CRITICAL ? 'error' :
                      category.alertLevel === AlertLevel.HIGH ? 'warning' :
                      'success'
                    }
                    sx={{ mt: 1 }}
                  />
                </Paper>
              ))}
            </Box>
          </Box>
        )}

        {/* Category Drill-Down View */}
        {selectedCategory && (
          <Box>
            {/* Back Button */}
            <Box sx={{ mb: 2 }}>
              <IconButton onClick={handleBackToCategories} size="small">
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" component="span" sx={{ ml: 1 }}>
                {selectedCategory.name} - Product Details
              </Typography>
            </Box>

            {/* Category Status Chart */}
            {drillDownData && (
              <Box sx={{ height: 250, mb: 3 }}>
                <ChartWidget
                  id={`${id}-status-chart`}
                  title=""
                  chartType={ChartType.DOUGHNUT}
                  data={drillDownData}
                  height={250}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'right'
                      }
                    }
                  }}
                />
              </Box>
            )}

            {/* Product Items Table */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Min Threshold</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Restocked</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(item.id)}
                          >
                            {expandedRows.has(item.id) ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="medium">
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(item.currentStock)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(item.minThreshold)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(item.status)}
                            color={getStatusColor(item.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(item.lastRestocked).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={expandedRows.has(item.id)} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Additional Details
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Max Capacity: {formatNumber(item.maxCapacity)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Supplier: {item.supplier}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Stock Level: {((item.currentStock / item.maxCapacity) * 100).toFixed(1)}%
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Days Since Restock: {Math.floor((Date.now() - new Date(item.lastRestocked).getTime()) / (1000 * 60 * 60 * 24))}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default InventoryDrillDownWidget;