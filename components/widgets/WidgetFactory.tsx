import React from 'react';
import { KPIWidget } from './KPIWidget';
import { ChartWidget } from './ChartWidget';
import { WidgetType, WidgetLayout, BusinessMetrics, ChartData } from '../../types';

interface WidgetFactoryProps {
  layout: WidgetLayout;
  data?: BusinessMetrics | ChartData | any;
  onRefresh?: (widgetId: string) => void;
  onConfigure?: (widgetId: string) => void;
}

export const WidgetFactory: React.FC<WidgetFactoryProps> = ({
  layout,
  data,
  onRefresh
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh(layout.id);
    }
  };

  const baseProps = {
    id: layout.id,
    title: layout.config.title,
    refreshable: true,
    onRefresh: handleRefresh
  };

  switch (layout.type) {
    case WidgetType.KPI:
      return (
        <KPIWidget
          {...baseProps}
          value={data?.value || 0}
          unit={data?.unit || ''}
          trend={data?.trend}
          trendValue={data?.trendValue}
          target={data?.target}
          format={data?.format || 'number'}
          precision={data?.precision || 2}
          color={layout.config.customSettings?.color}
        />
      );

    case WidgetType.LINE_CHART:
    case WidgetType.BAR_CHART:
    case WidgetType.PIE_CHART:
    case WidgetType.DOUGHNUT_CHART:
    case WidgetType.GAUGE_CHART:
      const chartTypeMap: Record<string, string> = {
        [WidgetType.LINE_CHART]: 'line',
        [WidgetType.BAR_CHART]: 'bar',
        [WidgetType.PIE_CHART]: 'pie',
        [WidgetType.DOUGHNUT_CHART]: 'doughnut',
        [WidgetType.GAUGE_CHART]: 'gauge'
      };

      return (
        <ChartWidget
          {...baseProps}
          chartType={chartTypeMap[layout.type] as any}
          data={data || { labels: [], datasets: [] }}
          options={layout.config.customSettings?.chartOptions}
          height={layout.config.customSettings?.height || 300}
          interactive={layout.config.customSettings?.interactive !== false}
        />
      );

    default:
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Unknown widget type: {layout.type}
        </div>
      );
  }
};

export default WidgetFactory;