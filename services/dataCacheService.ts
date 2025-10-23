import { BusinessMetrics, ChartData, FilterCriteria, TimePeriod } from '@/types';
import { configService } from './configService';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number; // Approximate memory usage in bytes
}

export interface CacheConfig {
  maxEntries: number;
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  enableStats: boolean;
}

class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0
  };
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private config: CacheConfig = {
    maxEntries: 100,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 60 * 1000, // 1 minute
    enableStats: configService.debugMode
  };

  constructor() {
    this.startCleanupTimer();
    configService.log('info', 'Data cache service initialized');
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(prefix: string, params?: Record<string, any>): string {
    if (!params) return prefix;
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Generate key for filter criteria
   */
  private generateFilterKey(filters?: FilterCriteria): string {
    if (!filters) return 'no-filters';
    
    return JSON.stringify({
      dateRange: {
        start: filters.dateRange.start.toISOString(),
        end: filters.dateRange.end.toISOString()
      },
      regions: filters.regions.sort(),
      categories: filters.categories.sort(),
      businessUnits: filters.businessUnits.sort(),
      timePeriod: filters.timePeriod
    });
  }

  /**
   * Check if cache entry is valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      configService.log('debug', `Cache miss for key: ${key}`);
      return null;
    }
    
    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      configService.log('debug', `Cache expired for key: ${key}`);
      return null;
    }
    
    entry.hits++;
    this.stats.hits++;
    configService.log('debug', `Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxEntries) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
      hits: 0
    };
    
    this.cache.set(key, entry);
    configService.log('debug', `Cached data for key: ${key}, TTL: ${entry.ttl}ms`);
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;
    
    // Find entry with lowest hits and oldest timestamp
    let lruKey: string | null = null;
    let lruScore = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // Score based on hits and age (lower is worse)
      const age = Date.now() - entry.timestamp;
      const score = entry.hits - (age / 1000); // Subtract age in seconds
      
      if (score < lruScore) {
        lruScore = score;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
      configService.log('debug', `Evicted cache entry: ${lruKey}`);
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      configService.log('debug', `Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cache business metrics
   */
  cacheBusinessMetrics(data: BusinessMetrics, filters?: FilterCriteria, ttl?: number): void {
    const key = this.generateKey('business-metrics', { filters: this.generateFilterKey(filters) });
    this.set(key, data, ttl);
  }

  /**
   * Get cached business metrics
   */
  getCachedBusinessMetrics(filters?: FilterCriteria): BusinessMetrics | null {
    const key = this.generateKey('business-metrics', { filters: this.generateFilterKey(filters) });
    return this.get<BusinessMetrics>(key);
  }

  /**
   * Cache revenue data
   */
  cacheRevenueData(data: ChartData, period: TimePeriod, filters?: FilterCriteria, ttl?: number): void {
    const key = this.generateKey('revenue-data', { 
      period, 
      filters: this.generateFilterKey(filters) 
    });
    this.set(key, data, ttl);
  }

  /**
   * Get cached revenue data
   */
  getCachedRevenueData(period: TimePeriod, filters?: FilterCriteria): ChartData | null {
    const key = this.generateKey('revenue-data', { 
      period, 
      filters: this.generateFilterKey(filters) 
    });
    return this.get<ChartData>(key);
  }

  /**
   * Cache inventory data
   */
  cacheInventoryData(data: ChartData, category?: string, filters?: FilterCriteria, ttl?: number): void {
    const key = this.generateKey('inventory-data', { 
      category, 
      filters: this.generateFilterKey(filters) 
    });
    this.set(key, data, ttl);
  }

  /**
   * Get cached inventory data
   */
  getCachedInventoryData(category?: string, filters?: FilterCriteria): ChartData | null {
    const key = this.generateKey('inventory-data', { 
      category, 
      filters: this.generateFilterKey(filters) 
    });
    return this.get<ChartData>(key);
  }

  /**
   * Cache customer data
   */
  cacheCustomerData(data: ChartData, filters?: FilterCriteria, ttl?: number): void {
    const key = this.generateKey('customer-data', { filters: this.generateFilterKey(filters) });
    this.set(key, data, ttl);
  }

  /**
   * Get cached customer data
   */
  getCachedCustomerData(filters?: FilterCriteria): ChartData | null {
    const key = this.generateKey('customer-data', { filters: this.generateFilterKey(filters) });
    return this.get<ChartData>(key);
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string): number {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });
    
    configService.log('debug', `Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    return keysToDelete.length;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    configService.log('info', `Cleared ${size} cache entries`);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    // Approximate memory usage calculation
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry.data).length * 2; // Rough estimate (UTF-16)
    }
    
    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval) {
      this.startCleanupTimer();
    }
    
    // Evict entries if max entries reduced
    while (this.cache.size > this.config.maxEntries) {
      this.evictLeastUsed();
    }
    
    configService.log('info', 'Cache configuration updated', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Preload data into cache
   */
  async preload(dataLoader: () => Promise<{ key: string; data: any; ttl?: number }[]>): Promise<void> {
    try {
      const entries = await dataLoader();
      
      entries.forEach(({ key, data, ttl }) => {
        this.set(key, data, ttl);
      });
      
      configService.log('info', `Preloaded ${entries.length} cache entries`);
    } catch (error) {
      configService.log('error', 'Failed to preload cache data:', error);
    }
  }

  /**
   * Cleanup and destroy cache service
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    this.clear();
    configService.log('info', 'Data cache service destroyed');
  }
}

export const dataCacheService = new DataCacheService();
export default dataCacheService;