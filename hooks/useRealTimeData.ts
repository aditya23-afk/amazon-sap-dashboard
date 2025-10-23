import { useState, useEffect, useCallback, useRef } from 'react';
import { BusinessMetrics, ChartData, FilterCriteria, TimePeriod } from '@/types';
import { realTimeDataService, RealTimeUpdate } from '@/services/realTimeDataService';
import { dataCacheService } from '@/services/dataCacheService';
import { autoRefreshService, RefreshJob } from '@/services/autoRefreshService';
import { apiService } from '@/services/api';
import { configService } from '@/services/configService';

export interface UseRealTimeDataOptions {
  enableRealTime?: boolean;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  filters?: FilterCriteria;
}

export interface RealTimeDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  refreshing: boolean;
}

export interface RealTimeDataActions {
  refresh: () => Promise<void>;
  clearError: () => void;
  updateFilters: (filters: FilterCriteria) => void;
}

/**
 * Hook for managing real-time data with caching and auto-refresh
 */
export function useRealTimeData<T>(
  dataType: 'metrics' | 'revenue' | 'inventory' | 'customers',
  options: UseRealTimeDataOptions = {}
): [RealTimeDataState<T>, RealTimeDataActions] {
  const {
    enableRealTime = true,
    enableAutoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    cacheEnabled = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    filters
  } = options;

  const [state, setState] = useState<RealTimeDataState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    connectionStatus: 'disconnected',
    refreshing: false
  });

  const filtersRef = useRef(filters);
  const jobIdRef = useRef<string>(`${dataType}-${Date.now()}`);
  const unsubscribeRealTimeRef = useRef<(() => void) | null>(null);
  const unsubscribeConnectionRef = useRef<(() => void) | null>(null);
  const unsubscribeRefreshRef = useRef<(() => void) | null>(null);

  // Update filters ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /**
   * Load data from cache or API
   */
  const loadData = useCallback(async (showLoading = true): Promise<T | null> => {
    if (showLoading) {
      setState((prev: RealTimeDataState<T>) => ({ ...prev, loading: true, error: null }));
    } else {
      setState((prev: RealTimeDataState<T>) => ({ ...prev, refreshing: true, error: null }));
    }

    try {
      let data: T | null = null;

      // Try cache first if enabled
      if (cacheEnabled) {
        switch (dataType) {
          case 'metrics':
            data = dataCacheService.getCachedBusinessMetrics(filtersRef.current) as T;
            break;
          case 'revenue':
            data = dataCacheService.getCachedRevenueData(TimePeriod.MONTHLY, filtersRef.current) as T;
            break;
          case 'inventory':
            data = dataCacheService.getCachedInventoryData(undefined, filtersRef.current) as T;
            break;
          case 'customers':
            data = dataCacheService.getCachedCustomerData(filtersRef.current) as T;
            break;
        }
      }

      // If no cached data, fetch from API
      if (!data) {
        configService.log('debug', `Loading ${dataType} data from API`);
        
        switch (dataType) {
          case 'metrics':
            data = await apiService.getBusinessMetrics(filtersRef.current) as T;
            if (cacheEnabled) {
              dataCacheService.cacheBusinessMetrics(data as BusinessMetrics, filtersRef.current, cacheTTL);
            }
            break;
          case 'revenue':
            data = await apiService.getRevenueData(TimePeriod.MONTHLY, filtersRef.current) as T;
            if (cacheEnabled) {
              dataCacheService.cacheRevenueData(data as ChartData, TimePeriod.MONTHLY, filtersRef.current, cacheTTL);
            }
            break;
          case 'inventory':
            data = await apiService.getInventoryData(undefined, filtersRef.current) as T;
            if (cacheEnabled) {
              dataCacheService.cacheInventoryData(data as ChartData, undefined, filtersRef.current, cacheTTL);
            }
            break;
          case 'customers':
            data = await apiService.getCustomerMetrics(filtersRef.current) as T;
            if (cacheEnabled) {
              dataCacheService.cacheCustomerData(data as ChartData, filtersRef.current, cacheTTL);
            }
            break;
        }
      } else {
        configService.log('debug', `Using cached ${dataType} data`);
      }

      setState((prev: RealTimeDataState<T>) => ({
        ...prev,
        data,
        loading: false,
        refreshing: false,
        error: null,
        lastUpdated: new Date().toISOString()
      }));

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      configService.log('error', `Failed to load ${dataType} data:`, error);
      
      setState((prev: RealTimeDataState<T>) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: errorMessage
      }));

      return null;
    }
  }, [dataType, cacheEnabled, cacheTTL]);

  /**
   * Handle real-time updates
   */
  const handleRealTimeUpdate = useCallback((update: RealTimeUpdate) => {
    if (update.type === dataType || update.type === 'metrics') {
      configService.log('debug', `Received real-time update for ${dataType}`);
      
      setState((prev: RealTimeDataState<T>) => ({
        ...prev,
        data: update.data as T,
        lastUpdated: update.timestamp,
        error: null
      }));

      // Update cache if enabled
      if (cacheEnabled) {
        switch (dataType) {
          case 'metrics':
            dataCacheService.cacheBusinessMetrics(update.data as BusinessMetrics, filtersRef.current, cacheTTL);
            break;
          case 'revenue':
            dataCacheService.cacheRevenueData(update.data as ChartData, TimePeriod.MONTHLY, filtersRef.current, cacheTTL);
            break;
          case 'inventory':
            dataCacheService.cacheInventoryData(update.data as ChartData, undefined, filtersRef.current, cacheTTL);
            break;
          case 'customers':
            dataCacheService.cacheCustomerData(update.data as ChartData, filtersRef.current, cacheTTL);
            break;
        }
      }
    }
  }, [dataType, cacheEnabled, cacheTTL]);

  /**
   * Handle connection status changes
   */
  const handleConnectionChange = useCallback((status: 'connected' | 'disconnected' | 'error' | 'reconnecting') => {
    setState((prev: RealTimeDataState<T>) => ({
      ...prev,
      connectionStatus: status === 'reconnecting' ? 'connecting' : status
    }));
  }, []);

  /**
   * Handle auto-refresh events
   */
  const handleRefreshEvent = useCallback((job: RefreshJob, success: boolean, error?: Error) => {
    if (job.id === jobIdRef.current) {
      if (success) {
        // Reload data after successful refresh
        loadData(false);
      } else {
        configService.log('error', `Auto-refresh failed for ${dataType}:`, error);
        setState((prev: RealTimeDataState<T>) => ({
          ...prev,
          error: error?.message || 'Auto-refresh failed'
        }));
      }
    }
  }, [dataType, loadData]);

  /**
   * Setup real-time subscriptions
   */
  useEffect(() => {
    if (enableRealTime) {
      // Subscribe to real-time updates
      unsubscribeRealTimeRef.current = realTimeDataService.subscribe(dataType, handleRealTimeUpdate);
      
      // Subscribe to connection status
      unsubscribeConnectionRef.current = realTimeDataService.onConnectionChange(handleConnectionChange);
      
      // Update initial connection status
      setState((prev: RealTimeDataState<T>) => ({
        ...prev,
        connectionStatus: realTimeDataService.getConnectionStatus()
      }));
    }

    return () => {
      if (unsubscribeRealTimeRef.current) {
        unsubscribeRealTimeRef.current();
        unsubscribeRealTimeRef.current = null;
      }
      if (unsubscribeConnectionRef.current) {
        unsubscribeConnectionRef.current();
        unsubscribeConnectionRef.current = null;
      }
    };
  }, [enableRealTime, dataType, handleRealTimeUpdate, handleConnectionChange]);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (enableAutoRefresh) {
      // Create auto-refresh job
      autoRefreshService.createJob(
        jobIdRef.current,
        dataType,
        {
          enabled: true,
          interval: refreshInterval,
          retryAttempts: 3,
          retryDelay: 5000,
          onlyWhenVisible: true
        },
        filtersRef.current || undefined
      );

      // Subscribe to refresh events
      unsubscribeRefreshRef.current = autoRefreshService.onRefresh(handleRefreshEvent);
    }

    return () => {
      if (enableAutoRefresh) {
        autoRefreshService.removeJob(jobIdRef.current);
      }
      if (unsubscribeRefreshRef.current) {
        unsubscribeRefreshRef.current();
        unsubscribeRefreshRef.current = null;
      }
    };
  }, [enableAutoRefresh, dataType, refreshInterval, handleRefreshEvent]);

  /**
   * Initial data load
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Update auto-refresh job when filters change
   */
  useEffect(() => {
    if (enableAutoRefresh) {
      const job = autoRefreshService.getJob(jobIdRef.current);
      if (job) {
        job.filters = filters;
      }
    }
  }, [filters, enableAutoRefresh]);

  // Actions
  const refresh = useCallback(async () => {
    await loadData(false);
  }, [loadData]);

  const clearError = useCallback(() => {
    setState((prev: RealTimeDataState<T>) => ({ ...prev, error: null }));
  }, []);

  const updateFilters = useCallback((newFilters: FilterCriteria) => {
    filtersRef.current = newFilters;
    
    // Update auto-refresh job
    if (enableAutoRefresh) {
      const job = autoRefreshService.getJob(jobIdRef.current);
      if (job) {
        job.filters = newFilters;
      }
    }
    
    // Reload data with new filters
    loadData();
  }, [enableAutoRefresh, loadData]);

  return [
    state,
    {
      refresh,
      clearError,
      updateFilters
    }
  ];
}

/**
 * Specialized hooks for different data types
 */
export function useBusinessMetrics(options?: UseRealTimeDataOptions) {
  return useRealTimeData<BusinessMetrics>('metrics', options);
}

export function useRevenueData(options?: UseRealTimeDataOptions) {
  return useRealTimeData<ChartData>('revenue', options);
}

export function useInventoryData(options?: UseRealTimeDataOptions) {
  return useRealTimeData<ChartData>('inventory', options);
}

export function useCustomerData(options?: UseRealTimeDataOptions) {
  return useRealTimeData<ChartData>('customers', options);
}