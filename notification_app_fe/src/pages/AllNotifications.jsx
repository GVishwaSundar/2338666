// src/pages/AllNotifications.jsx
// Page 1 — All Notifications with filter + pagination.
// Author: G Vishwa Sundar | Roll No: 2338666

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Alert,
  Skeleton, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InboxIcon from '@mui/icons-material/Inbox';

import { useNotifications, markAsViewed } from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';
import FilterBar from '../components/FilterBar';
import PaginationBar from '../components/PaginationBar';
import { createLogger } from '../utils/logger';
import { ACCESS_TOKEN } from '../config/auth';

export default function AllNotifications() {
  const [page,   setPage]   = useState(1);
  const [limit,  setLimit]  = useState(10);
  const [filter, setFilter] = useState(null); // null = All

  const logger = createLogger(ACCESS_TOKEN);

  const { notifications, total, loading, error } = useNotifications({
    page,
    limit,
    type: filter,
  });

  // Mark all fetched notifications as viewed once they appear on screen
  useEffect(() => {
    if (notifications.length > 0) {
      markAsViewed(notifications.map((n) => n.ID));
    }
  }, [notifications]);

  // Log page load once
  useEffect(() => {
    logger.info('page', 'All Notifications page loaded');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when filter or limit changes
  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    await logger.info('component', `Filter changed to: ${newFilter ?? 'All'}`);
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    await logger.info('component', `Page changed to: ${newPage}`);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  // ── Skeleton loading cards ──────────────────────────────────────────────────
  const SkeletonCards = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={80}
        sx={{ mb: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}
      />
    ));

  // ── Empty state ─────────────────────────────────────────────────────────────
  const EmptyState = () => (
    <Box
      sx={{
        textAlign: 'center',
        py: 10,
        color: 'rgba(255,255,255,0.2)',
      }}
    >
      <InboxIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        No notifications found
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {filter ? `No "${filter}" notifications on this page.` : 'Nothing to show here.'}
      </Typography>
    </Box>
  );

  // ── New vs read count ───────────────────────────────────────────────────────
  const newCount = notifications.filter((n) => n.isNew).length;

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <NotificationsIcon sx={{ color: '#e94560', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            All Notifications
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {loading
              ? 'Loading…'
              : `${total} total · ${newCount} new this page`}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

      {/* Filter bar */}
      <FilterBar activeFilter={filter} onChange={handleFilterChange} />

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            background: 'rgba(233,69,96,0.12)',
            color: '#ff8a9b',
            border: '1px solid rgba(233,69,96,0.3)',
            '& .MuiAlert-icon': { color: '#e94560' },
          }}
        >
          {error.includes('401')
            ? '⚠️  Token expired — please re-authenticate in Postman and update src/config/auth.js'
            : error}
        </Alert>
      )}

      {/* Notification list */}
      {loading ? (
        <SkeletonCards />
      ) : notifications.length === 0 ? (
        <EmptyState />
      ) : (
        notifications.map((n) => (
          <NotificationCard key={n.ID} notification={n} />
        ))
      )}

      {/* Pagination */}
      {!loading && !error && notifications.length > 0 && (
        <PaginationBar
          page={page}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}
    </Box>
  );
}
