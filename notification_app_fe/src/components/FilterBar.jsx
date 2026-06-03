// src/components/FilterBar.jsx
// Filter buttons for notification type selection.
// Author: G Vishwa Sundar | Roll No: 2338666

import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const FILTERS = [
  { label: 'All',       value: null        },
  { label: 'Event',     value: 'Event'     },
  { label: 'Result',    value: 'Result'    },
  { label: 'Placement', value: 'Placement' },
];

const FILTER_COLORS = {
  Event:     '#4fc3f7',
  Result:    '#f0a500',
  Placement: '#e94560',
};

/**
 * FilterBar
 *
 * Props:
 *   activeFilter  — current filter value (null | 'Event' | 'Result' | 'Placement')
 *   onChange      — called with the new filter value when a button is clicked
 */
export default function FilterBar({ activeFilter, onChange }) {
  const handleChange = (_, newValue) => {
    // ToggleButtonGroup passes null when the same button is clicked again
    // We treat that as "All"
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <FilterListIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Filter:
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={activeFilter}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          flexWrap: 'wrap',
          gap: 0.5,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid rgba(255,255,255,0.12) !important',
            borderRadius: '20px !important',
            margin: 0,
          },
        }}
      >
        {FILTERS.map((f) => {
          const accent = f.value ? FILTER_COLORS[f.value] : '#fff';
          const isActive = activeFilter === f.value;

          return (
            <ToggleButton
              key={f.label}
              value={f.value}
              sx={{
                color: isActive ? accent : 'rgba(255,255,255,0.5)',
                background: isActive ? `${accent}18` : 'transparent',
                borderColor: isActive
                  ? `${accent}55 !important`
                  : 'rgba(255,255,255,0.1) !important',
                fontWeight: isActive ? 700 : 400,
                fontSize: '0.78rem',
                px: 1.8,
                py: 0.4,
                textTransform: 'none',
                transition: 'all 0.2s',
                '&:hover': {
                  background: `${accent}12`,
                  color: accent,
                },
              }}
            >
              {f.label}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
