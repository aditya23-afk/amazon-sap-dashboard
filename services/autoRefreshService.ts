import { FilterCriteria, TimePeriod } from '@/types';
import { configService } from './configService';
import { dataCacheService } from './dataCacheService';
import { apiService } from './api';

export interface RefreshConfig {
  enabled: boolean;
  interval: number; // Interval in milliseconds
  retryAttempts: number;
  retryDelay: number; // Delay between retries in milliseconds
  onlyWhenVisible: boolean; // Only refresh when page is visible
}

export interface RefreshJob {
  id: string;
  type: 'metrics' | 'revenue' | 'inventory' | 'customers' | 'all';
  config: RefreshConfig;
  filters?: FilterCriteria | undefined;
  lastRun?: number | undefined;
  nextRun?: number | undefined;
  isRunning: boolean;
  errors: number;
  successCount: number;
}

type RefreshEventHandler = (job: RefreshJob, success: boolean, error?: Error) => void;

class AutoRefreshService {
  private jobs = new Map<string, RefreshJob>();
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private eventHandlers: RefreshEventHandler[] = [];
  private isPageVisible = true;
  private globalConfig: RefreshConfig = {
    enabled: true,
    interval: 5 * 60 * 1000, // 5 minutes default
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    onlyWhenVisible: true
  };

  constructor() {
    this.setupVisibilityHandling();
    configService.log('info', 'Auto-refresh service initialized');
  }

  /**
   * Setup page visibility handling
   */
  private setupVisibilityHandling(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = !document.hidden;
        configService.log('debug', `Page visibility changed: ${this.isPageVisible ? 'visible' : 'hidden'}`);
        
        if (this.isPageVisible) {
          this.resumeJobs();
        } else {
          this.pauseJobs();
        }
      });
    }
  }

  /**
   * Create or update a refresh job
   */
  createJob(
    id: string,
    type: RefreshJob['type'],
    config?: Partial<RefreshConfig>,
    filters?: FilterCriteria
  ): RefreshJob {
    const jobConfig = { ...this.globalConfig, ...config };
    
    const job: RefreshJob = {
      id,
      type,
      config: jobConfig,
      filters,
      isRunning: false,
      errors: 0,
      successCount: 0
    };

    this.jobs.set(id, job);
    
    if (jobConfig.enabled) {
      this.scheduleJob(job);
    }
    
    configService.log('info', `Created refresh job: ${id} (${type}), interval: ${jobConfig.interval}ms`);
    return job;
  }

  /**
   * Schedule a job for execution
   */
  private scheduleJob(job: RefreshJob): void {
    if (!job.config.enabled) return;
    
    // Clear existing timer
    const existingTimer = this.timers.get(job.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const now = Date.now();
    job.nextRun = now + job.config.interval;
    
    const timer = setTimeout(() => {
      this.executeJob(job);
    }, job.config.interval);
    
    this.timers.set(job.id, timer);
    configService.log('debug', `Scheduled job ${job.id} to run in ${job.config.interval}ms`);
  }

  /**
   * Execute a refresh job
   */
  private async executeJob(job: RefreshJob): Promise<void> {
    if (job.isRunning) {
      configService.log('debug', `Job ${job.id} is already running, skipping`);
      return;
    }

    // Check if we should skip due to page visibility
    if (job.config.onlyWhenVisible && !this.isPageVisible) {
      configService.log('debug', `Skipping job ${job.id} - page not visible`);
      this.scheduleJob(job); // Reschedule for later
      return;
    }

    job.isRunning = true;
    job.lastRun = Date.now();
    
    configService.log('debug', `Executing refresh job: ${job.id} (${job.type})`);

    try {
      await this.performRefresh(job);
      job.successCount++;
      job.errors = 0; // Reset error count on success
      this.notifyHandlers(job, true);
      configService.log('debug', `Job ${job.id} completed successfully`);
    } catch (error) {
      job.errors++;
      this.notifyHandlers(job, false, error as Error);
      configService.log('error', `Job ${job.id} failed:`, error);
      
      // Retry logic
      if (job.errors < job.config.retryAttempts) {
        configService.log('info', `Retrying job ${job.id} in ${job.config.retryDelay}ms (attempt ${job.errors + 1})`);
        setTimeout(() => {
          this.executeJob(job);
        }, job.config.retryDelay);
        return;
      } else {
        configService.log('error', `Job ${job.id} failed after ${job.config.retryAttempts} attempts`);
      }
    } finally {
      job.isRunning = false;
    }

    // Schedule next execution
    if (job.config.enabled) {
      this.scheduleJob(job);
    }
  }

  /**
   * Perform the actual data refresh
   */
  private async performRefresh(job: RefreshJob): Promise<void> {
    switch (job.type) {
      case 'metrics':
        await this.refreshBusinessMetrics(job.filters);
        break;
      case 'revenue':
        await this.refreshRevenueData(job.filters);
        break;
      case 'inventory':
        await this.refreshInventoryData(job.filters);
        break;
      case 'customers':
        await this.refreshCustomerData(job.filters);
        break;
      case 'all':
        await this.refreshAllData(job.filters);
        break;
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  /**
   * Refresh business metrics
   */
  private async refreshBusinessMetrics(filters?: FilterCriteria): Promise<void> {
    const data = await apiService.getBusinessMetrics(filters);
    dataCacheService.cacheBusinessMetrics(data, filters);
  }

  /**
   * Refresh revenue data
   */
  private async refreshRevenueData(filters?: FilterCriteria): Promise<void> {
    const periods: TimePeriod[] = [TimePeriod.DAILY, TimePeriod.MONTHLY, TimePeriod.QUARTERLY];
    
    await Promise.all(periods.map(async (period) => {
      const data = await apiService.getRevenueData(period, filters);
      dataCacheService.cacheRevenueData(data, period, filters);
    }));
  }

  /**
   * Refresh inventory data
   */
  private async refreshInventoryData(filters?: FilterCriteria): Promise<void> {
    // Refresh general inventory data
    const generalData = await apiService.getInventoryData(undefined, filters);
    dataCacheService.cacheInventoryData(generalData, undefined, filters);
    
    // Refresh category-specific data for common categories
    const categories = ['Electronics', 'Books', 'Clothing', 'Home & Garden'];
    await Promise.all(categories.map(async (category) => {
      const data = await apiService.getInventoryData(category, filters);
      dataCacheService.cacheInventoryData(data, category, filters);
    }));
  }

  /**
   * Refresh customer data
   */
  private async refreshCustomerData(filters?: FilterCriteria): Promise<void> {
    const data = await apiService.getCustomerMetrics(filters);
    dataCacheService.cacheCustomerData(data, filters);
  }

  /**
   * Refresh all data types
   */
  private async refreshAllData(filters?: FilterCriteria): Promise<void> {
    await Promise.all([
      this.refreshBusinessMetrics(filters),
      this.refreshRevenueData(filters),
      this.refreshInventoryData(filters),
      this.refreshCustomerData(filters)
    ]);
  }

  /**
   * Start a job
   */
  startJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) {
      configService.log('warn', `Job not found: ${id}`);
      return false;
    }

    job.config.enabled = true;
    this.scheduleJob(job);
    configService.log('info', `Started job: ${id}`);
    return true;
  }

  /**
   * Stop a job
   */
  stopJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) {
      configService.log('warn', `Job not found: ${id}`);
      return false;
    }

    job.config.enabled = false;
    
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    
    configService.log('info', `Stopped job: ${id}`);
    return true;
  }

  /**
   * Remove a job
   */
  removeJob(id: string): boolean {
    this.stopJob(id);
    const removed = this.jobs.delete(id);
    
    if (removed) {
      configService.log('info', `Removed job: ${id}`);
    }
    
    return removed;
  }

  /**
   * Pause all jobs (when page becomes hidden)
   */
  private pauseJobs(): void {
    for (const [id, timer] of this.timers.entries()) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    configService.log('debug', 'Paused all refresh jobs');
  }

  /**
   * Resume all jobs (when page becomes visible)
   */
  private resumeJobs(): void {
    for (const job of this.jobs.values()) {
      if (job.config.enabled) {
        this.scheduleJob(job);
      }
    }
    configService.log('debug', 'Resumed all refresh jobs');
  }

  /**
   * Trigger immediate refresh for a job
   */
  async refreshNow(id: string): Promise<boolean> {
    const job = this.jobs.get(id);
    if (!job) {
      configService.log('warn', `Job not found: ${id}`);
      return false;
    }

    try {
      await this.executeJob(job);
      return true;
    } catch (error) {
      configService.log('error', `Manual refresh failed for job ${id}:`, error);
      return false;
    }
  }

  /**
   * Update job configuration
   */
  updateJobConfig(id: string, config: Partial<RefreshConfig>): boolean {
    const job = this.jobs.get(id);
    if (!job) {
      configService.log('warn', `Job not found: ${id}`);
      return false;
    }

    const wasEnabled = job.config.enabled;
    job.config = { ...job.config, ...config };
    
    // Restart job if configuration changed
    if (wasEnabled && job.config.enabled) {
      this.stopJob(id);
      this.startJob(id);
    } else if (!wasEnabled && job.config.enabled) {
      this.startJob(id);
    } else if (wasEnabled && !job.config.enabled) {
      this.stopJob(id);
    }
    
    configService.log('info', `Updated job configuration: ${id}`);
    return true;
  }

  /**
   * Get job status
   */
  getJob(id: string): RefreshJob | null {
    return this.jobs.get(id) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): RefreshJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Subscribe to refresh events
   */
  onRefresh(handler: RefreshEventHandler): () => void {
    this.eventHandlers.push(handler);
    
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Notify event handlers
   */
  private notifyHandlers(job: RefreshJob, success: boolean, error?: Error): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(job, success, error);
      } catch (handlerError) {
        configService.log('error', 'Error in refresh event handler:', handlerError);
      }
    });
  }

  /**
   * Update global configuration
   */
  updateGlobalConfig(config: Partial<RefreshConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
    configService.log('info', 'Updated global refresh configuration', this.globalConfig);
  }

  /**
   * Get global configuration
   */
  getGlobalConfig(): RefreshConfig {
    return { ...this.globalConfig };
  }

  /**
   * Stop all jobs and cleanup
   */
  destroy(): void {
    for (const id of this.jobs.keys()) {
      this.stopJob(id);
    }
    
    this.jobs.clear();
    this.timers.clear();
    this.eventHandlers.length = 0;
    
    configService.log('info', 'Auto-refresh service destroyed');
  }
}

export const autoRefreshService = new AutoRefreshService();
export default autoRefreshService;