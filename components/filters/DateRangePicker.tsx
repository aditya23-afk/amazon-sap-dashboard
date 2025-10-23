import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  Popover,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DateRange } from '../../types';
import { DATE_RANGE_PRESETS } from '../../constants';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (dateRange: DateRange) => void;
  className?: string;
}

interface PresetOption {
  key: string;
  label: string;
  getValue: () => DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  className,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [customStartDate, setCustomStartDate] = useState(
    value.start.toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState(
    value.end.toISOString().split('T')[0]
  );

  const open = Boolean(anchorEl);

  const presetOptions: PresetOption[] = [
    {
      key: DATE_RANGE_PRESETS.TODAY,
      label: 'Today',
      getValue: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          start: today,
          end: endOfDay,
          preset: 'today',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.YESTERDAY,
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const endOfDay = new Date(yesterday);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          start: yesterday,
          end: endOfDay,
          preset: 'yesterday',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.LAST_7_DAYS,
      label: 'Last 7 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return {
          start,
          end,
          preset: 'last7days',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.LAST_30_DAYS,
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
          start,
          end,
          preset: 'last30days',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.THIS_MONTH,
      label: 'This Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        return {
          start,
          end,
          preset: 'thisMonth',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.LAST_MONTH,
      label: 'Last Month',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        end.setHours(23, 59, 59, 999);
        return {
          start,
          end,
          preset: 'lastMonth',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.THIS_QUARTER,
      label: 'This Quarter',
      getValue: () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        return {
          start,
          end,
          preset: 'thisQuarter',
        };
      },
    },
    {
      key: DATE_RANGE_PRESETS.THIS_YEAR,
      label: 'This Year',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        end.setHours(23, 59, 59, 999);
        return {
          start,
          end,
          preset: 'thisYear',
        };
      },
    },
  ];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePresetSelect = (preset: PresetOption) => {
    const newDateRange = preset.getValue();
    onChange(newDateRange);
    handleClose();
  };

  const handleCustomDateChange = () => {
    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);
    
    // Validate dates
    if (startDate > endDate) {
      return; // Don't apply invalid date range
    }

    onChange({
      start: startDate,
      end: endDate,
      preset: 'custom',
    });
    handleClose();
  };

  const formatDateRange = (dateRange: DateRange): string => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const start = formatDate(dateRange.start);
    const end = formatDate(dateRange.end);
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  const getCurrentPresetLabel = (): string => {
    if (value.preset) {
      const preset = presetOptions.find(p => p.key === value.preset);
      if (preset) {
        return preset.label;
      }
    }
    return 'Custom Range';
  };

  return (
    <Box className={className}>
      <Button
        variant="outlined"
        startIcon={<CalendarIcon />}
        onClick={handleClick}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          width: '100%',
          minHeight: 40,
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {getCurrentPresetLabel()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateRange(value)}
          </Typography>
        </Box>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            p: 2,
            minWidth: 320,
            maxWidth: 400,
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Select Date Range
        </Typography>

        {/* Preset Options */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Quick Select
          </Typography>
          <Grid container spacing={1}>
            {presetOptions.map((preset) => (
              <Grid item xs={6} key={preset.key}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handlePresetSelect(preset)}
                  sx={{
                    width: '100%',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                  }}
                >
                  {preset.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Custom Date Range */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Custom Range
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <ButtonGroup size="small" sx={{ mt: 1 }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCustomDateChange}
                disabled={
                  !customStartDate ||
                  !customEndDate ||
                  new Date(customStartDate) > new Date(customEndDate)
                }
              >
                Apply
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangePicker;