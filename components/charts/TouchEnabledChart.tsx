import React, { useRef, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { ChartOptions } from 'chart.js';

export interface TouchGesture {
  type: 'tap' | 'pinch' | 'pan' | 'swipe';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  scale?: number;
  deltaX?: number;
  deltaY?: number;
}

export interface TouchEnabledChartProps {
  children: React.ReactNode;
  onGesture?: (gesture: TouchGesture) => void;
  enablePinchZoom?: boolean;
  enablePan?: boolean;
  enableSwipe?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TouchEnabledChart: React.FC<TouchEnabledChartProps> = ({
  children,
  onGesture,
  enablePinchZoom = true,
  enablePan = true,
  enableSwipe = true,
  className,
  style,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [touchState, setTouchState] = useState<{
    touches: Touch[];
    startTime: number;
    initialDistance?: number;
    initialScale?: number;
  }>({
    touches: [],
    startTime: 0,
  });

  // Calculate distance between two touches for pinch gestures
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touches = Array.from(e.touches);
    const startTime = Date.now();
    
    let initialDistance: number | undefined;
    if (touches.length === 2 && enablePinchZoom) {
      initialDistance = getDistance(touches[0], touches[1]);
    }
    
    setTouchState({
      touches,
      startTime,
      initialDistance,
      initialScale: 1,
    });
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || touchState.touches.length === 0) return;
    
    const currentTouches = Array.from(e.touches);
    
    if (currentTouches.length === 2 && touchState.initialDistance && enablePinchZoom) {
      // Pinch zoom gesture
      const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
      const scale = currentDistance / touchState.initialDistance;
      
      const gesture: TouchGesture = {
        type: 'pinch',
        startX: touchState.touches[0].clientX,
        startY: touchState.touches[0].clientY,
        currentX: currentTouches[0].clientX,
        currentY: currentTouches[0].clientY,
        scale,
      };
      
      onGesture?.(gesture);
    } else if (currentTouches.length === 1 && touchState.touches.length === 1 && enablePan) {
      // Pan gesture
      const deltaX = currentTouches[0].clientX - touchState.touches[0].clientX;
      const deltaY = currentTouches[0].clientY - touchState.touches[0].clientY;
      
      const gesture: TouchGesture = {
        type: 'pan',
        startX: touchState.touches[0].clientX,
        startY: touchState.touches[0].clientY,
        currentX: currentTouches[0].clientX,
        currentY: currentTouches[0].clientY,
        deltaX,
        deltaY,
      };
      
      onGesture?.(gesture);
    }
    
    // Prevent default scrolling behavior during gestures
    if (currentTouches.length > 1 || Math.abs(currentTouches[0].clientX - (touchState.touches[0]?.clientX || 0)) > 10) {
      e.preventDefault();
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || touchState.touches.length === 0) return;
    
    const endTime = Date.now();
    const duration = endTime - touchState.startTime;
    const remainingTouches = Array.from(e.touches);
    
    // Check for swipe gesture
    if (remainingTouches.length === 0 && touchState.touches.length === 1 && enableSwipe) {
      const touch = touchState.touches[0];
      const currentTouch = e.changedTouches[0];
      
      const deltaX = currentTouch.clientX - touch.clientX;
      const deltaY = currentTouch.clientY - touch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Swipe detection: minimum distance and maximum duration
      if (distance > 50 && duration < 300) {
        const gesture: TouchGesture = {
          type: 'swipe',
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: currentTouch.clientX,
          currentY: currentTouch.clientY,
          deltaX,
          deltaY,
        };
        
        onGesture?.(gesture);
      }
    }
    
    // Check for tap gesture
    if (remainingTouches.length === 0 && touchState.touches.length === 1 && duration < 200) {
      const touch = touchState.touches[0];
      const currentTouch = e.changedTouches[0];
      
      const deltaX = Math.abs(currentTouch.clientX - touch.clientX);
      const deltaY = Math.abs(currentTouch.clientY - touch.clientY);
      
      // Tap detection: minimal movement
      if (deltaX < 10 && deltaY < 10) {
        const gesture: TouchGesture = {
          type: 'tap',
          startX: touch.clientX,
          startY: touch.clientY,
          currentX: currentTouch.clientX,
          currentY: currentTouch.clientY,
        };
        
        onGesture?.(gesture);
      }
    }
    
    setTouchState({
      touches: remainingTouches,
      startTime: endTime,
    });
  };

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        width: '100%',
        height: '100%',
        touchAction: isMobile ? 'none' : 'auto',
        userSelect: 'none',
        ...style,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </Box>
  );
};

// Enhanced Chart.js options for mobile
export const getMobileChartOptions = (baseOptions: ChartOptions = {}): ChartOptions => {
  return {
    ...baseOptions,
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      ...baseOptions.plugins,
      legend: {
        ...baseOptions.plugins?.legend,
        position: 'bottom',
        labels: {
          ...baseOptions.plugins?.legend?.labels,
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      },
    },
    scales: {
      ...baseOptions.scales,
      x: {
        ...baseOptions.scales?.x,
        ticks: {
          ...baseOptions.scales?.x?.ticks,
          maxRotation: 45,
          minRotation: 0,
          font: {
            size: 10,
          },
        },
      },
      y: {
        ...baseOptions.scales?.y,
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          font: {
            size: 10,
          },
        },
      },
    },
    elements: {
      ...baseOptions.elements,
      point: {
        ...baseOptions.elements?.point,
        radius: 4,
        hoverRadius: 8,
        hitRadius: 10,
      },
      line: {
        ...baseOptions.elements?.line,
        borderWidth: 2,
        tension: 0.1,
      },
    },
  };
};

export default TouchEnabledChart;