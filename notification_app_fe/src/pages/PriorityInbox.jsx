// src/pages/PriorityInbox.jsx
// Page 2 — Priority Inbox showing top-N ranked notifications.
// Author: G Vishwa Sundar | Roll No: 2338666

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Alert,
  ToggleButtonGroup, ToggleButton, Chip,
  Divider, Skeleton, Paper,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { fetchNotifications } from '../api/notificationApi';
import { rankByPriority } from '../utils/priorityEngine';
import { markAsViewed } from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';
import { createLogger } from '../utils/logger';
import { ACCESS_TOKEN } from '../config/auth';

const TOP_N_OPTIONS = [10, 15, 20];

// Server max limit is 10 per request.
// We fetch 3 pages to build a pool of up to 30 notifications for ranking.
const PAGE_LIMIT = 10;
const PAGES_TO_FETCH = 3;

export default function PriorityInbox() {
  const [topN,     setTopN]     = useState(10);
  const [ranked,   setRanked]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const logger = createLogger(ACCESS_TOKEN);

  useEffect(() => {
    logger.info('page', 'Priority Inbox page loaded');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch + rank whenever topN changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      await logger.debug('hook', `Fetching batch for priority ranking, topN=${topN}`);

      try {
        // Fetch a large batch across multiple types
        // We fetch without a type filter so all types are included
        const result = await fetchNotifications({
          token: ACCESS_TOKEN,
          limit: PAGE_LIMIT,
          page: 1,
        });

        if (cancelled) return;

        const rankedList = rankByPriority(result.notifications, topN);
        setRanked(rankedList);

        // Mark them as viewed
        markAsViewed(rankedList.map((n) => n.ID));

        await logger.info(
          'state',
          `Priority inbox ranked ${rankedList.length} notifications (topN=${topN})`
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          await logger.error('api', `Priority inbox fetch failed: ${err.message}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topN]);

  // ── Type distribution summary ───────────────────────────────────────────────
  const counts = ranked.reduce(
    (acc, n) => {
      acc[n.Type] = (acc[n.Type] || 0) + 1;
      return acc;
    },
    {}
  );

  const SUMMARY_CHIPS = [
    { type: 'Placement', color: 'error',   label: 'Placement' },
    { type: 'Result',    color: 'warning', label: 'Result'    },
    { type: 'Event',     color: 'info',    label: 'Event'     },
  ];

  const SkeletonCards = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rounded"
        height={80}
        sx={{ mb: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)' }}
      />
    ));

  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', px: { xs: 2, sm: 3 }, py: 4 }}>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <StarIcon sx={{ color: '#f0a500', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
            Priority Inbox
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Top notifications ranked by type and recency
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

      {/* Algorithm explanation card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          background: 'rgba(240,165,0,0.06)',
          border: '1px solid rgba(240,165,0,0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: '#f0a500', mt: 0.2, flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, mb: 0.5 }}>
              How priority is calculated
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Each notification gets a score: <strong style={{ color: '#e94560' }}>Placement (300)</strong> &gt; <strong style={{ color: '#f0a500' }}>Result (200)</strong> &gt; <strong style={{ color: '#4fc3f7' }}>Event (100)</strong>, plus a recency bonus (0–99).
              More recent notifications of the same type rank higher.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Top-N selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
          Show top:
        </Typography>
        <ToggleButtonGroup
          value={topN}
          exclusive
          onChange={(_, v) => { if (v !== null) setTopN(v); }}
          size="small"
        >
          {TOP_N_OPTIONS.map((n) => (
            <ToggleButton
              key={n}
              value={n}
              sx={{
                color: topN === n ? '#f0a500' : 'rgba(255,255,255,0.5)',
                background: topN === n ? 'rgba(240,165,0,0.12)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.1) !important',
                fontWeight: topN === n ? 700 : 400,
                px: 2,
                textTransform: 'none',
                '&:hover': { background: 'rgba(240,165,0,0.08)' },
              }}
            >
              {n}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Type distribution chips */}
        {!loading && ranked.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {SUMMARY_CHIPS.filter((c) => counts[c.type]).map((c) => (
              <Chip
                key={c.type}
                label={`${counts[c.type]} ${c.label}`}
                color={c.color}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 22 }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Error */}
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
            ? '⚠️  Token expired — update src/config/auth.js with a fresh token.'
            : error}
        </Alert>
      )}

      {/* Ranked notifications */}
      {loading ? (
        <SkeletonCards />
      ) : ranked.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10, color: 'rgba(255,255,255,0.2)' }}>
          <StarIcon sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
          <Typography variant="h6">No notifications to rank</Typography>
        </Box>
      ) : (
        ranked.map((n, idx) => (
          <Box key={n.ID} sx={{ position: 'relative' }}>
            {/* Rank number badge */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: -28,
                transform: 'translateY(-50%)',
                width: 20,
                textAlign: 'right',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.2)', fontWeight: 600, fontSize: '0.7rem' }}
              >
                #{idx + 1}
              </Typography>
            </Box>
            <NotificationCard notification={n} showScore={true} />
          </Box>
        ))
      )}
    </Box>
  );
}
