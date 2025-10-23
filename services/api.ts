import { 
  BusinessMetrics, 
  FilterCriteria, 
  ChartData, 
  ApiResponse, 
  ApiError,
  FinancialMetrics,
  CustomerMetrics,
  TimePeriod
} from '@/types';
import { mockDataGenerator } from './mockDataService';
import { dataTransformUtils } from '../utils/dataTransform';
import { configService } from './configService';
import { dataCacheService } from './dataCacheService';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  simulateError?: boolean;
}

class ApiService {
  private requestCount = 0;

  private async simulateDelay(min?: number, max?: number): Promise<void> {
    if (!configService.simulateDelays) return;
    
    const delayMin = min ?? configService.mockDelayMin;
    const delayMax = max ?? configService.mockDelayMax;
    const delay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
    
    configService.log('debug', `Simulating API delay: ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private shouldSimulateError(): boolean {
    this.requestCount++;
    const shouldError = Math.random() < configService.errorSimulationRate;
    
    if (shouldError) {
      configService.log('debug', `Simulating API error (request #${this.requestCount})`);
    }
    
    return shouldError;
  }

  private generateApiError(endpoint: string): ApiError {
    const errors = [
      { code: 'NETWORK_ERROR', message: 'Network connection failed' },
      { code: 'TIMEOUT_ERROR', message: 'Request timeout' },
      { code: 'SERVER_ERROR', message: 'Internal server error' },
      { code: 'RATE_LIMIT', message: 'Rate limit exceeded' },
      { code: 'DATA_NOT_FOUND', message: 'Requested data not found' }
    ];
    
    const error = errors[Math.floor(Math.random() * errors.length)];
    if (!error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown error occurred',
        details: { endpoint, requestId: `req_${Date.now()}` },
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      code: error.code,
      message: error.message,
      details: { endpoint, requestId: `req_${Date.now()}` },
      timestamp: new Date().toISOString()
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Simulate API delay
    await this.simulateDelay();

    // Simulate random errors for testing
    if (options.simulateError !== false && this.shouldSimulateError()) {
      const error = this.generateApiError(endpoint);
      throw new Error(`API Error: ${error.message} (${error.code})`);
    }

    if (configService.useMockData) {
      configService.log('debug', `Using mock data for endpoint: ${endpoint}`);
      return this.getMockResponse<T>(endpoint);
    }

    // Real API call
    const url = `${configService.apiBaseUrl}${endpoint}`;
    configService.log('debug', `Making API request to: ${url}`);
    const timeout = options.timeout || 10000;
    const retries = options.retries || 2;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        configService.log('debug', `API request successful: ${url}`);
        return data;
      } catch (error) {
        configService.log('error', `API request failed (attempt ${attempt + 1}):`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private getMockResponse<T>(endpoint: string): ApiResponse<T> {
    let data: any;

    // Route mock data based on endpoint
    if (endpoint.includes('/metrics')) {
      data = mockDataGenerator.generateBusinessMetrics();
    } else if (endpoint.includes('/revenue')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const period = urlParams.get('period') as TimePeriod || TimePeriod.MONTHLY;
      data = mockDataGenerator.generateRevenueData(period);
    } else if (endpoint.includes('/inventory')) {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const category = urlParams.get('category') || undefined;
      data = mockDataGenerator.generateInventoryData(category);
    } else if (endpoint.includes('/customers')) {
      data = mockDataGenerator.generateCustomerData();
    } else if (endpoint.includes('/financial')) {
      data = mockDataGenerator.generateFinancialMetrics();
    } else {
      // Default fallback
      data = { message: 'Mock data not implemented for this endpoint' };
    }

    return {
      data: data as T,
      success: true,
      message: 'Success',
      timestamp: new Date().toISOString()
    };
  }

  // Business metrics endpoints
  async getBusinessMetrics(filters?: FilterCriteria, useCache = true): Promise<BusinessMetrics> {
    // Check cache first if enabled
    if (useCache) {
      const cached = dataCacheService.getCachedBusinessMetrics(filters);
      if (cached) {
        configService.log('debug', 'Using cached business metrics');
        return cached;
      }
    }

    const queryParams = filters ? new URLSearchParams({
      startDate: filters.dateRange.start.toISOString(),
      endDate: filters.dateRange.end.toISOString(),
      regions: filters.regions.join(','),
      categories: filters.categories.join(','),
      businessUnits: filters.businessUnits.join(','),
      timePeriod: filters.timePeriod
    }).toString() : '';

    const endpoint = `/metrics${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<BusinessMetrics>(endpoint);
    
    // Cache the result
    if (useCache) {
      dataCacheService.cacheBusinessMetrics(response.data, filters);
    }
    
    return response.data;
  }

  // Revenue data endpoints
  async getRevenueData(period: TimePeriod = TimePeriod.MONTHLY, filters?: FilterCriteria, useCache = true): Promise<ChartData> {
    // Check cache first if enabled
    if (useCache) {
      const cached = dataCacheService.getCachedRevenueData(period, filters);
      if (cached) {
        configService.log('debug', 'Using cached revenue data');
        return cached;
      }
    }

    const queryParams = new URLSearchParams({ period });
    if (filters) {
      queryParams.append('startDate', filters.dateRange.start.toISOString());
      queryParams.append('endDate', filters.dateRange.end.toISOString());
      if (filters.regions.length > 0) {
        queryParams.append('regions', filters.regions.join(','));
      }
    }
    
    const response = await this.request<ChartData>(`/revenue?${queryParams.toString()}`);
    const transformedData = dataTransformUtils.transformToChartData(response.data);
    
    // Cache the result
    if (useCache) {
      dataCacheService.cacheRevenueData(transformedData, period, filters);
    }
    
    return transformedData;
  }

  // Inventory data endpoints
  async getInventoryData(category?: string, filters?: FilterCriteria, useCache = true): Promise<ChartData> {
    // Check cache first if enabled
    if (useCache) {
      const cached = dataCacheService.getCachedInventoryData(category, filters);
      if (cached) {
        configService.log('debug', 'Using cached inventory data');
        return cached;
      }
    }

    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (filters) {
      queryParams.append('startDate', filters.dateRange.start.toISOString());
      queryParams.append('endDate', filters.dateRange.end.toISOString());
      if (filters.regions.length > 0) {
        queryParams.append('regions', filters.regions.join(','));
      }
    }
    
    const endpoint = `/inventory${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<ChartData>(endpoint);
    const transformedData = dataTransformUtils.transformToChartData(response.data);
    
    // Cache the result
    if (useCache) {
      dataCacheService.cacheInventoryData(transformedData, category, filters);
    }
    
    return transformedData;
  }

  // Customer metrics endpoints
  async getCustomerMetrics(filters?: FilterCriteria, useCache = true): Promise<ChartData> {
    // Check cache first if enabled
    if (useCache) {
      const cached = dataCacheService.getCachedCustomerData(filters);
      if (cached) {
        configService.log('debug', 'Using cached customer data');
        return cached;
      }
    }

    const queryParams = filters ? new URLSearchParams({
      startDate: filters.dateRange.start.toISOString(),
      endDate: filters.dateRange.end.toISOString(),
      regions: filters.regions.join(',')
    }).toString() : '';

    const endpoint = `/customers${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<ChartData>(endpoint);
    const transformedData = dataTransformUtils.transformToChartData(response.data);
    
    // Cache the result
    if (useCache) {
      dataCacheService.cacheCustomerData(transformedData, filters);
    }
    
    return transformedData;
  }

  // Financial metrics endpoints
  async getFinancialMetrics(filters?: FilterCriteria): Promise<FinancialMetrics> {
    const queryParams = filters ? new URLSearchParams({
      startDate: filters.dateRange.start.toISOString(),
      endDate: filters.dateRange.end.toISOString(),
      regions: filters.regions.join(','),
      businessUnits: filters.businessUnits.join(',')
    }).toString() : '';

    const endpoint = `/financial${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<FinancialMetrics>(endpoint);
    return response.data;
  }

  // Detailed customer metrics
  async getDetailedCustomerMetrics(filters?: FilterCriteria): Promise<CustomerMetrics> {
    const queryParams = filters ? new URLSearchParams({
      startDate: filters.dateRange.start.toISOString(),
      endDate: filters.dateRange.end.toISOString(),
      regions: filters.regions.join(',')
    }).toString() : '';

    const endpoint = `/customers/detailed${queryParams ? `?${queryParams}` : ''}`;
    const response = await this.request<CustomerMetrics>(endpoint);
    return response.data;
  }

  // Export functionality
  async exportData(format: 'pdf' | 'excel', data: unknown): Promise<Blob> {
    if (configService.useMockData) {
      // Simulate export for mock data
      await this.simulateDelay(1000, 3000);
      
      const mockBlob = new Blob(['Mock export data'], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      return mockBlob;
    }

    const response = await fetch(`${configService.apiBaseUrl}/export/${format}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.request<{ status: string }>('/health', { 
        simulateError: false,
        timeout: 5000 
      });
      return {
        status: response.data.status,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Batch data fetching for dashboard initialization
  async getDashboardData(filters?: FilterCriteria): Promise<{
    metrics: BusinessMetrics;
    revenue: ChartData;
    inventory: ChartData;
    customers: ChartData;
  }> {
    try {
      const [metrics, revenue, inventory, customers] = await Promise.all([
        this.getBusinessMetrics(filters),
        this.getRevenueData(TimePeriod.MONTHLY, filters),
        this.getInventoryData(undefined, filters),
        this.getCustomerMetrics(filters)
      ]);

      return { metrics, revenue, inventory, customers };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;