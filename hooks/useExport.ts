import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { exportService } from '../services/exportService';
import { ExportOptions, ExportResult, ExportFormat } from '../types';

interface UseExportReturn {
  isExporting: boolean;
  exportResult: ExportResult | null;
  error: string | null;
  exportToPDF: (elementId: string, options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportToExcel: (data: any, options?: Partial<ExportOptions>) => Promise<ExportResult>;
  exportToImage: (elementId: string, format?: 'png' | 'jpeg', options?: Partial<ExportOptions>) => Promise<ExportResult>;
  printDashboard: (elementId: string) => void;
  clearResult: () => void;
  clearError: () => void;
}

export const useExport = (): UseExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current dashboard data from Redux store
  const dashboardData = useSelector((state: RootState) => state.data);
  const filters = useSelector((state: RootState) => state.filters);

  const clearResult = useCallback(() => {
    setExportResult(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportToPDF = useCallback(async (
    elementId: string, 
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const defaultOptions: Partial<ExportOptions> = {
        format: ExportFormat.PDF,
        orientation: 'landscape',
        pageSize: 'a4',
        quality: 'medium',
        filename: `dashboard-${new Date().toISOString().split('T')[0]}.pdf`
      };

      const mergedOptions = { ...defaultOptions, ...options };
      const result = await exportService.exportToPDF(elementId, mergedOptions);
      
      setExportResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF export failed';
      setError(errorMessage);
      return {
        success: false,
        filename: '',
        size: 0,
        error: errorMessage
      };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportToExcel = useCallback(async (
    data: any,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const defaultOptions: Partial<ExportOptions> = {
        format: ExportFormat.EXCEL,
        filename: `dashboard-data-${new Date().toISOString().split('T')[0]}.xlsx`
      };

      const mergedOptions = { ...defaultOptions, ...options };
      
      // Use provided data or fallback to dashboard data
      const exportData = data || {
        businessMetrics: dashboardData.businessMetrics,
        filters: filters.current,
        timestamp: new Date().toISOString()
      };

      const result = await exportService.exportToExcel(exportData, mergedOptions);
      
      setExportResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Excel export failed';
      setError(errorMessage);
      return {
        success: false,
        filename: '',
        size: 0,
        error: errorMessage
      };
    } finally {
      setIsExporting(false);
    }
  }, [dashboardData, filters]);

  const exportToImage = useCallback(async (
    elementId: string,
    format: 'png' | 'jpeg' = 'png',
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> => {
    setIsExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const defaultOptions: Partial<ExportOptions> = {
        format: format === 'png' ? ExportFormat.PNG : ExportFormat.JPEG,
        quality: 'high',
        filename: `dashboard-${new Date().toISOString().split('T')[0]}.${format}`
      };

      const mergedOptions = { ...defaultOptions, ...options };
      const result = await exportService.exportChartAsImage(elementId, format, mergedOptions);
      
      setExportResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Image export failed';
      setError(errorMessage);
      return {
        success: false,
        filename: '',
        size: 0,
        error: errorMessage
      };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const printDashboard = useCallback((elementId: string) => {
    try {
      exportService.preparePrintVersion(elementId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Print preparation failed';
      setError(errorMessage);
    }
  }, []);

  return {
    isExporting,
    exportResult,
    error,
    exportToPDF,
    exportToExcel,
    exportToImage,
    printDashboard,
    clearResult,
    clearError
  };
};