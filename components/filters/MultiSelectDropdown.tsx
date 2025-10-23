import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  TextField,
  InputAdornment,
  Typography,
  Divider,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { FilterOption } from '../../types';

interface MultiSelectDropdownProps {
  label: string;
  options: FilterOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  showCounts?: boolean;
  maxHeight?: number;
  className?: string;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  searchable = true,
  showCounts = true,
  maxHeight = 300,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (event: any) => {
    const selectedValues = event.target.value as string[];
    onChange(selectedValues);
  };

  const handleSelectAll = () => {
    const allValues = filteredOptions
      .filter(option => option.enabled !== false)
      .map(option => option.value);
    onChange(allValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getSelectedLabels = (): string => {
    if (value.length === 0) {
      return placeholder;
    }
    
    if (value.length === 1) {
      const option = options.find(opt => opt.value === value[0]);
      return option?.label || value[0];
    }
    
    return `${value.length} selected`;
  };

  const renderValue = (selected: string[]) => {
    if (selected.length === 0) {
      return <em style={{ color: '#999' }}>{placeholder}</em>;
    }

    if (selected.length <= 2) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((val) => {
            const option = options.find(opt => opt.value === val);
            return (
              <Chip
                key={val}
                label={option?.label || val}
                size="small"
                onDelete={(e) => {
                  e.stopPropagation();
                  const newSelected = selected.filter(item => item !== val);
                  onChange(newSelected);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
              />
            );
          })}
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">
          {selected.length} items selected
        </Typography>
        <Chip
          label="Clear"
          size="small"
          variant="outlined"
          onDelete={(e) => {
            e.stopPropagation();
            onChange([]);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        />
      </Box>
    );
  };

  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: maxHeight,
        width: 300,
      },
    },
    anchorOrigin: {
      vertical: 'bottom' as const,
      horizontal: 'left' as const,
    },
    transformOrigin: {
      vertical: 'top' as const,
      horizontal: 'left' as const,
    },
  };

  return (
    <FormControl fullWidth className={className}>
      <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-select-label`}
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue}
        MenuProps={MenuProps}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      >
        {/* Search and Actions Header */}
        <Box sx={{ p: 1, position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
          {searchable && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <ClearIcon
                      fontSize="small"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setSearchTerm('')}
                    />
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0}
            >
              Select All
            </Button>
            <Button
              size="small"
              onClick={handleClearAll}
              disabled={value.length === 0}
            >
              Clear All
            </Button>
          </Box>
          <Divider sx={{ mt: 1 }} />
        </Box>

        {/* Options List */}
        {filteredOptions.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No options found
            </Typography>
          </MenuItem>
        ) : (
          filteredOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.enabled === false}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Checkbox
                checked={value.includes(option.value)}
                size="small"
              />
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="body2">
                      {option.label}
                    </Typography>
                    {showCounts && option.count !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        ({option.count.toLocaleString()})
                      </Typography>
                    )}
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
};

export default MultiSelectDropdown;