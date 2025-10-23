import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ShimmerBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.grey[300]} 25%, ${theme.palette.grey[200]} 50%, ${theme.palette.grey[300]} 75%)`,
  backgroundSize: '200px 100%',
  animation: `${shimmer} 1.5s infinite`,
  borderRadius: theme.shape.borderRadius,
}));

interface SkeletonLoaderProps {
  variant: 'kpi' | 'chart' | 'table' | 'card' | 'text' | 'dashboard';
  width?: string | number;
  height?: string | number;
  count?: number;
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  width = '100%',
  height,
  count = 1,
  animated = true
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'kpi':
        return (
          <Card sx={{ height: height || 200, width }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Skeleton variant="text" width="60%" height={24} animation={animated ? 'wave' : false} />
                <Skeleton variant="circular" width={24} height={24} animation={animated ? 'wave' : false} />
              </Box>
              <Box display="flex" alignItems="baseline" mb={1}>
                <Skeleton variant="text" width="40%" height={48} animation={animated ? 'wave' : false} />
                <Skeleton variant="text" width="20%" height={24} sx={{ ml: 1 }} animation={animated ? 'wave' : false} />
              </Box>
              <Box display="flex" alignItems="center">
                <Skeleton variant="rectangular" width={16} height={16} sx={{ mr: 1 }} animation={animated ? 'wave' : false} />
                <Skeleton variant="text" width="30%" height={20} animation={animated ? 'wave' : false} />
              </Box>
            </CardContent>
          </Card>
        );

      case 'chart':
        return (
          <Card sx={{ height: height || 400, width }}>
            <CardContent>
              <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} animation={animated ? 'wave' : false} />
              <Box sx={{ height: height ? `calc(${height}px - 80px)` : 320, position: 'relative' }}>
                {/* Chart area */}
                <Skeleton 
                  variant="rectangular" 
                  width="100%" 
                  height="80%" 
                  sx={{ mb: 2 }} 
                  animation={animated ? 'wave' : false} 
                />
                {/* Legend */}
                <Box display="flex" justifyContent="center" gap={2}>
                  {[1, 2, 3].map((item) => (
                    <Box key={item} display="flex" alignItems="center">
                      <Skeleton variant="rectangular" width={12} height={12} sx={{ mr: 1 }} animation={animated ? 'wave' : false} />
                      <Skeleton variant="text" width={60} height={16} animation={animated ? 'wave' : false} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      case 'table':
        return (
          <Card sx={{ width }}>
            <CardContent>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} animation={animated ? 'wave' : false} />
              {/* Table header */}
              <Box display="flex" gap={2} mb={1}>
                {[1, 2, 3, 4].map((col) => (
                  <Skeleton key={col} variant="text" width="20%" height={20} animation={animated ? 'wave' : false} />
                ))}
              </Box>
              {/* Table rows */}
              {Array.from({ length: count || 5 }).map((_, index) => (
                <Box key={index} display="flex" gap={2} mb={1}>
                  {[1, 2, 3, 4].map((col) => (
                    <Skeleton key={col} variant="text" width="20%" height={16} animation={animated ? 'wave' : false} />
                  ))}
                </Box>
              ))}
            </CardContent>
          </Card>
        );

      case 'card':
        return (
          <Card sx={{ height: height || 'auto', width }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} animation={animated ? 'wave' : false} />
                <Box flex={1}>
                  <Skeleton variant="text" width="60%" height={20} animation={animated ? 'wave' : false} />
                  <Skeleton variant="text" width="40%" height={16} animation={animated ? 'wave' : false} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width="100%" height={height ? `calc(${height}px - 120px)` : 100} animation={animated ? 'wave' : false} />
            </CardContent>
          </Card>
        );

      case 'text':
        return (
          <Box sx={{ width }}>
            {Array.from({ length: count || 3 }).map((_, index) => (
              <Skeleton 
                key={index} 
                variant="text" 
                width={index === count! - 1 ? '60%' : '100%'} 
                height={height || 16} 
                sx={{ mb: 1 }}
                animation={animated ? 'wave' : false}
              />
            ))}
          </Box>
        );

      case 'dashboard':
        return (
          <Box sx={{ width }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Skeleton variant="text" width="30%" height={32} animation={animated ? 'wave' : false} />
              <Box display="flex" gap={2}>
                <Skeleton variant="rectangular" width={120} height={36} animation={animated ? 'wave' : false} />
                <Skeleton variant="rectangular" width={100} height={36} animation={animated ? 'wave' : false} />
              </Box>
            </Box>

            {/* KPI Cards Row */}
            <Grid container spacing={3} mb={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item}>
                  <SkeletonLoader variant="kpi" animated={animated} />
                </Grid>
              ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <SkeletonLoader variant="chart" height={400} animated={animated} />
              </Grid>
              <Grid item xs={12} md={4}>
                <SkeletonLoader variant="chart" height={400} animated={animated} />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return <Skeleton variant="rectangular" width={width} height={height || 100} animation={animated ? 'wave' : false} />;
    }
  };

  return <>{renderSkeleton()}</>;
};

export default SkeletonLoader;