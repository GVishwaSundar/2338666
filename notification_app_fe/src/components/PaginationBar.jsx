// src/components/PaginationBar.jsx
// Pagination controls component.
// Author: G Vishwa Sundar | Roll No: 2338666

import React from 'react';
import { Box, Pagination, Typography, Select, MenuItem, FormControl } from '@mui/material';

/**
 * PaginationBar
 *
 * Props:
 *   page        — current page (1-indexed)
 *   total       — total number of items across all pages
 *   limit       — items per page
 *   onPageChange  — called with new page number
 *   onLimitChange — called with new limit value
 *   limitOptions  — array of limit values to offer (default [5, 10, 20])
 */
export default function PaginationBar({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 20],
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start      = total === 0 ? 0 : (page - 1) * limit + 1;
  const end        = Math.min(page * limit, total);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        mt: 3,
        pt: 2,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Item count label */}
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
        {total === 0
          ? 'No notifications'
          : `Showing ${start}–${end} of ${total}`}
      </Typography>

      {/* Page buttons */}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        siblingCount={1}
        boundaryCount={1}
        sx={{
          '& .MuiPaginationItem-root': {
            color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 1,
            '&:hover': { background: 'rgba(233,69,96,0.12)', color: '#e94560' },
          },
          '& .Mui-selected': {
            background: '#e94560 !important',
            color: '#fff !important',
            border: 'none',
            fontWeight: 700,
          },
        }}
      />

      {/* Items-per-page dropdown */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
          Per page:
        </Typography>
        <FormControl size="small" variant="outlined">
          <Select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.82rem',
              height: 30,
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.15)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '.MuiSvgIcon-root': { color: 'rgba(255,255,255,0.4)' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                },
              },
            }}
          >
            {limitOptions.map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
