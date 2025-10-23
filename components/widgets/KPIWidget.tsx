import React from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { BaseWidget } from './BaseWidget';
import { KPIWidgetProps, TrendDirection } from '../../types';
import { formatNumber, formatCurrency, formatPercentage } from '../../utils/formatters';

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  value,
  unit,
  trend,
  trendValue,
  target,
  format = 'number',
  precision = 2,
  color,
  icon,
  ...baseProps
}) => {
  const theme = useTheme();

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return formatCurrency(val, unit || 'USD');
      case 'percentage':
        return formatPercentage(val); // formatPercentage handles the conversion internally
      default:
        return formatNumber(val, 'en-US', precision);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case TrendDirection.UP:
        return <TrendingUpIcon sx={{ fontSize: 16 }} />;
      case TrendDirection.DOWN:
        return <TrendingDownIcon sx={{ fontSize: 16 }} />;
      case TrendDirection.STABLE:
        return <TrendingFlatIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case TrendDirection.UP:
        return theme.palette.success.main;
      case TrendDirection.DOWN:
        return theme.palette.error.main;
      case TrendDirection.STABLE:
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getTargetStatus = () => {
    if (!target) return null;
    
    const percentage = (value / target) * 100;
    const isOnTarget = percentage >= 95; // Within 5% of target
    const isAboveTarget = percentage > 100;
    
    return {
      percentage,
      isOnTarget,
      isAboveTarget,
      color: isAboveTarget 
        ? theme.palette.success.main 
        : isOnTarget 
          ? theme.palette.warning.main 
          : theme.palette.error.main
    };
  };

  const targetStatus = getTargetStatus();

  return (
    <BaseWidget {...baseProps}>
      <Box sx={{ textAlign: 'center', py: 2 }}>
        {/* Main Value */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 700,
            color: color || theme.palette.primary.main,
            mb: 1,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          {formatValue(value)}
        </Typography>

        {/* Unit (if not included in formatted value) */}
        {format === 'number' && unit && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {unit}
          </Typography>
        )}

        {/* Trend Information */}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Chip
              icon={getTrendIcon()}
              label={
                trendValue !== undefined 
                  ? `${trendValue > 0 ? '+' : ''}${formatValue(trendValue)}`
                  : trend.charAt(0).toUpperCase() + trend.slice(1)
              }
              size="small"
              sx={{
                backgroundColor: `${getTrendColor()}20`,
                color: getTrendColor(),
                '& .MuiChip-icon': {
                  color: getTrendColor()
                }
              }}
            />
          </Box>
        )}

        {/* Target Progress */}
        {targetStatus && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Target: {formatValue(target!)}
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 6,
                backgroundColor: theme.palette.grey[200],
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(targetStatus.percentage, 100)}%`,
                  height: '100%',
                  backgroundColor: targetStatus.color,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ 
                color: targetStatus.color,
                fontWeight: 600,
                mt: 0.5,
                display: 'block'
              }}
            >
              {targetStatus.percentage.toFixed(1)}% of target
            </Typography>
          </Box>
        )}
      </Box>
    </BaseWidget>
  );
};

export default KPIWidget;