import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Collapse,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import {
  setDateRange,
  setSelectedRegions,
  setSelectedCategories,
  setSelectedBusinessUnits,
  clearAllFilters,
} from '../../store/slices/filtersSlice';
import DateRangePicker from './DateRangePicker';
import MultiSelectDropdown from './MultiSelectDropdown';
import { FilterCriteria, DateRange } from '../../types';
import { useScreenReader } from '../../hooks/useAccessibility';
import { ARIA_LABELS, KEYBOARD_KEYS } from '../../utils/accessibility';

interface FilterPanelProps {
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  collapsible = true,
  defaultExpanded = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  
  const filters = useSelector((state: RootState) => state.filters);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { announce } = useScreenReader();

  // Mock data for dropdowns - in real app, this would come from API
  const regionOptions = [
    { value: 'north-america', label: 'North America', count: 1250 },
    { value: 'europe', label: 'Europe', count: 980 },
    { value: 'asia-pacific', label: 'Asia Pacific', count: 1100 },
    { value: 'latin-america', label: 'Latin America', count: 450 },
    { value: 'middle-east-africa', label: 'Middle East & Africa', count: 320 },
  ];

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics', count: 2500 },
    { value: 'clothing', label: 'Clothing & Accessories', count: 1800 },
    { value: 'home-garden', label: 'Home & Garden', count: 1200 },
    { value: 'books-media', label: 'Books & Media', count: 900 },
    { value: 'sports-outdoors', label: 'Sports & Outdoors', count: 750 },
    { value: 'health-beauty', label: 'Health & Beauty', count: 650 },
    { value: 'automotive', label: 'Automotive', count: 400 },
  ];

  const businessUnitOptions = [
    { value: 'retail', label: 'Retail', count: 3200 },
    { value: 'marketplace', label: 'Marketplace', count: 2800 },
    { value: 'aws', label: 'AWS', count: 1500 },
    { value: 'advertising', label: 'Advertising', count: 800 },
    { value: 'logistics', label: 'Logistics', count: 600 },
    { value: 'prime', label: 'Prime Services', count: 1200 },
  ];

  const handleDateRangeChange = (dateRange: DateRange) => {
    dispatch(setDateRange(dateRange));
  };

  const handleRegionChange = (regions: string[]) => {
    dispatch(setSelectedRegions(regions));
  };

  const handleCategoryChange = (categories: string[]) => {
    dispatch(setSelectedCategories(categories));
  };

  const handleBusinessUnitChange = (businessUnits: string[]) => {
    dispatch(setSelectedBusinessUnits(businessUnits));
  };

  const handleClearAllFilters = () => {
    dispatch(clearAllFilters());
    announce('All filters cleared', 'polite');
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
    announce(expanded ? 'Filter panel collapsed' : 'Filter panel expanded', 'polite');
  };

  const getActiveFilterCount = () => {
    return (
      filters.selectedRegions.length +
      filters.selectedCategories.length +
      filters.selectedBusinessUnits.length
    );
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  const renderFilterChips = () => {
    const chips = [];
    
    // Region chips
    filters.selectedRegions.forEach(region => {
      const option = regionOptions.find(opt => opt.value === region);
      if (option) {
        chips.push(
          <Chip
            key={`region-${region}`}
            label={`Region: ${option.label}`}
            size="small"
            onDelete={() => {
              const newRegions = filters.selectedRegions.filter(r => r !== region);
              handleRegionChange(newRegions);
            }}
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      }
    });

    // Category chips
    filters.selectedCategories.forEach(category => {
      const option = categoryOptions.find(opt => opt.value === category);
      if (option) {
        chips.push(
          <Chip
            key={`category-${category}`}
            label={`Category: ${option.label}`}
            size="small"
            onDelete={() => {
              const newCategories = filters.selectedCategories.filter(c => c !== category);
              handleCategoryChange(newCategories);
            }}
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      }
    });

    // Business unit chips
    filters.selectedBusinessUnits.forEach(unit => {
      const option = businessUnitOptions.find(opt => opt.value === unit);
      if (option) {
        chips.push(
          <Chip
            key={`unit-${unit}`}
            label={`Unit: ${option.label}`}
            size="small"
            onDelete={() => {
              const newUnits = filters.selectedBusinessUnits.filter(u => u !== unit);
              handleBusinessUnitChange(newUnits);
            }}
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        );
      }
    });

    return chips;
  };

  const filterContent = (
    <Box sx={{ p: 2 }} role="group" aria-labelledby="filter-panel-title">
      {/* Date Range Picker */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ mb: 1, fontWeight: 600 }}
          component="h3"
          id="date-range-label"
        >
          Date Range
        </Typography>
        <DateRangePicker
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          aria-labelledby="date-range-label"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Multi-select Dropdowns */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MultiSelectDropdown
          label="Regions"
          options={regionOptions}
          value={filters.selectedRegions}
          onChange={handleRegionChange}
          placeholder="Select regions..."
          aria-label="Filter by regions"
        />

        <MultiSelectDropdown
          label="Product Categories"
          options={categoryOptions}
          value={filters.selectedCategories}
          onChange={handleCategoryChange}
          placeholder="Select categories..."
          aria-label="Filter by product categories"
        />

        <MultiSelectDropdown
          label="Business Units"
          options={businessUnitOptions}
          value={filters.selectedBusinessUnits}
          onChange={handleBusinessUnitChange}
          placeholder="Select business units..."
          aria-label="Filter by business units"
        />
      </Box>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box role="region" aria-labelledby="active-filters-title">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ fontWeight: 600 }}
                component="h3"
                id="active-filters-title"
              >
                Active Filters ({getActiveFilterCount()})
              </Typography>
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClearAllFilters}
                sx={{ 
                  minWidth: 'auto',
                  '&:focus-visible': {
                    outline: '3px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                }}
                aria-label="Clear all active filters"
              >
                Clear All
              </Button>
            </Box>
            <Box 
              sx={{ display: 'flex', flexWrap: 'wrap' }}
              role="list"
              aria-label="Active filter chips"
            >
              {renderFilterChips()}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  if (!collapsible) {
    return (
      <Paper 
        className={className} 
        elevation={1}
        component="section"
        role="region"
        aria-label={ARIA_LABELS.FILTER_PANEL}
      >
        {filterContent}
      </Paper>
    );
  }

  return (
    <Paper 
      className={className} 
      elevation={1}
      component="section"
      role="region"
      aria-label={ARIA_LABELS.FILTER_PANEL}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        onClick={handleToggleExpanded}
        onKeyDown={(event) => {
          if (event.key === KEYBOARD_KEYS.ENTER || event.key === KEYBOARD_KEYS.SPACE) {
            event.preventDefault();
            handleToggleExpanded();
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls="filter-panel-content"
        aria-label={`${expanded ? 'Collapse' : 'Expand'} filter panel`}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" aria-hidden="true" />
          <Typography 
            variant="h6" 
            sx={{ fontWeight: 600 }}
            component="h2"
            id="filter-panel-title"
          >
            Filters
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={getActiveFilterCount()}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
              aria-label={`${getActiveFilterCount()} active filters`}
            />
          )}
        </Box>
        <IconButton 
          size="small"
          aria-hidden="true"
          tabIndex={-1}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Divider />
        <Box id="filter-panel-content">
          {filterContent}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;