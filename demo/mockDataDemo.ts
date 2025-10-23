/**
 * Demo script to test the mock data service functionality
 * This can be used to verify that all mock data generators are working correctly
 */

import { apiService, mockDataGenerator, configService } from '../services';
import { TimePeriod } from '../types';

export async function runMockDataDemo(): Promise<void> {
  console.log('🚀 Starting Mock Data Service Demo...\n');

  // Test configuration
  console.log('📋 Configuration:');
  console.log('- Use Mock Data:', configService.useMockData);
  console.log('- Simulate Delays:', configService.simulateDelays);
  console.log('- Error Rate:', configService.errorSimulationRate);
  console.log('- API Base URL:', configService.apiBaseUrl);
  console.log('');

  try {
    // Test 1: Business Metrics
    console.log('📊 Testing Business Metrics Generation...');
    const businessMetrics = mockDataGenerator.generateBusinessMetrics();
    console.log('✅ Business Metrics:', {
      revenue: businessMetrics.revenue.current,
      orders: businessMetrics.orders.total,
      inventory: businessMetrics.inventory.totalItems,
      customers: businessMetrics.customers.active
    });
    console.log('');

    // Test 2: Revenue Data
    console.log('💰 Testing Revenue Data Generation...');
    const revenueData = mockDataGenerator.generateRevenueData(TimePeriod.MONTHLY);
    console.log('✅ Revenue Data:', {
      labels: revenueData.labels.slice(0, 3),
      dataPoints: revenueData.datasets[0]?.data.slice(0, 3),
      title: revenueData.metadata?.title
    });
    console.log('');

    // Test 3: Inventory Data
    console.log('📦 Testing Inventory Data Generation...');
    const inventoryData = mockDataGenerator.generateInventoryData();
    console.log('✅ Inventory Data:', {
      categories: inventoryData.labels,
      datasets: inventoryData.datasets.length,
      title: inventoryData.metadata?.title
    });
    console.log('');

    // Test 4: Customer Data
    console.log('👥 Testing Customer Data Generation...');
    const customerData = mockDataGenerator.generateCustomerData();
    console.log('✅ Customer Data:', {
      months: customerData.labels.length,
      datasets: customerData.datasets.length,
      title: customerData.metadata?.title
    });
    console.log('');

    // Test 5: API Service with Mock Data
    console.log('🔌 Testing API Service with Mock Data...');
    const apiMetrics = await apiService.getBusinessMetrics();
    console.log('✅ API Business Metrics:', {
      revenue: apiMetrics.revenue.current,
      lastUpdated: apiMetrics.revenue.lastUpdated
    });
    console.log('');

    // Test 6: Dashboard Data Batch Fetch
    console.log('📈 Testing Dashboard Data Batch Fetch...');
    const dashboardData = await apiService.getDashboardData();
    console.log('✅ Dashboard Data:', {
      hasMetrics: !!dashboardData.metrics,
      hasRevenue: !!dashboardData.revenue,
      hasInventory: !!dashboardData.inventory,
      hasCustomers: !!dashboardData.customers
    });
    console.log('');

    // Test 7: Export Functionality
    console.log('📄 Testing Export Functionality...');
    const exportBlob = await apiService.exportData('pdf', { test: 'data' });
    console.log('✅ Export:', {
      type: exportBlob.type,
      size: exportBlob.size
    });
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use in development
export default runMockDataDemo;

// Auto-run in development mode
if (configService.isDevelopment && configService.debugMode) {
  runMockDataDemo();
}