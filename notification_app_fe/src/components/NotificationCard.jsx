// src/components/NotificationCard.jsx
// Card component for displaying a single notification.
// Author: G Vishwa Sundar | Roll No: 2338666

import React from 'react';
import {
  Card, CardContent, Box, Typography, Chip,
  Tooltip, Fade,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { getPriorityColor } from '../utils/priorityEngine';

// Icon per notification type
function TypeIcon({ type }) {
  const props = { sx: { fontSize: 20 } };
  if (type === 'Placement') return <WorkIcon   {...props} />;
  if (type === 'Result')    return <SchoolIcon {...props} />;
  return                           <EventIcon  {...props} />;
}

// Colour accent per type
const TYPE_ACCENT = {
  Placement: '#e94560',
  Result:    '#f0a500',
  Event:     '#4fc3f7',
};

// Format "2026-04-22 17:51:30" → "Apr 22, 2026 · 5:51 PM"
function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    return new Date(ts.replace(' ', 'T')).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch {
    return ts;
  }
}

/**
 * NotificationCard
 *
 * Props:
 *   notification  — notification object from the API (with isNew field)
 *   showScore     — (optional) show the priority score badge (Priority Inbox)
 */
export default function NotificationCard({ notification, showScore = false }) {
  const { Type, Message, Timestamp, isNew, _priorityScore } = notification;
  const accent = TYPE_ACCENT[Type] ?? '#888';
  const color  = getPriorityColor(Type);

  return (
    <Fade in timeout={350}>
      <Card
        elevation={0}
        sx={{
          mb: 1.5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: isNew
            ? `${accent}55`
            : 'rgba(255,255,255,0.06)',
          background: isNew
            ? `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(${
                Type === 'Placement' ? '233,69,96' :
                Type === 'Result'    ? '240,165,0' :
                '79,195,247'
              },0.06) 100%)`
            : 'rgba(255,255,255,0.02)',
          transition: 'all 0.25s ease',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${accent}22`,
            borderColor: `${accent}88`,
          },
        }}
      >
        {/* Left colour accent bar */}
        <Box
          sx={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: 4,
            borderRadius: '8px 0 0 8px',
            background: accent,
            opacity: isNew ? 1 : 0.3,
          }}
        />

        <CardContent sx={{ pl: 3, py: '12px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {/* Type icon */}
            <Box
              sx={{
                mt: 0.3,
                color: accent,
                opacity: isNew ? 1 : 0.5,
                flexShrink: 0,
              }}
            >
              <TypeIcon type={Type} />
            </Box>

            {/* Main content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8, mb: 0.5 }}>
                {/* Type badge */}
                <Chip
                  label={Type}
                  color={color}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    opacity: isNew ? 1 : 0.65,
                  }}
                />

                {/* NEW badge */}
                {isNew && (
                  <Tooltip title="You haven't seen this yet" placement="top">
                    <Chip
                      icon={<FiberNewIcon sx={{ fontSize: '14px !important' }} />}
                      label="NEW"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 22,
                        background: 'rgba(233,69,96,0.15)',
                        color: '#e94560',
                        border: '1px solid rgba(233,69,96,0.3)',
                        '& .MuiChip-icon': { color: '#e94560' },
                      }}
                    />
                  </Tooltip>
                )}

                {/* Priority score badge (Priority Inbox only) */}
                {showScore && _priorityScore !== undefined && (
                  <Tooltip title="Priority score" placement="top">
                    <Chip
                      label={`Score: ${_priorityScore}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        color: 'rgba(255,255,255,0.5)',
                        borderColor: 'rgba(255,255,255,0.15)',
                      }}
                    />
                  </Tooltip>
                )}
              </Box>

              {/* Message */}
              <Typography
                variant="body2"
                sx={{
                  color: isNew ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)',
                  fontWeight: isNew ? 500 : 400,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                }}
              >
                {Message}
              </Typography>

              {/* Timestamp */}
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.5, display: 'block' }}
              >
                {formatTimestamp(Timestamp)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
}
