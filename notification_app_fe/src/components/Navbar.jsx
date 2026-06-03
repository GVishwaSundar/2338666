// src/components/Navbar.jsx
// Responsive top navigation bar.
// Author: G Vishwa Sundar | Roll No: 2338666

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  Box, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';

const NAV_LINKS = [
  { label: 'All Notifications', path: '/',        icon: <NotificationsIcon sx={{ mr: 0.8, fontSize: 18 }} /> },
  { label: 'Priority Inbox',    path: '/priority', icon: <StarIcon sx={{ mr: 0.8, fontSize: 18 }} /> },
];

export default function Navbar() {
  const location = useLocation();
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {/* Logo / Brand */}
          <NotificationsIcon sx={{ color: '#e94560', mr: 1, fontSize: 28 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: '#fff',
              textDecoration: 'none',
              fontSize: { xs: '1rem', sm: '1.2rem' },
            }}
          >
            NotifyHub
          </Typography>

          {/* Desktop nav links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  startIcon={link.icon}
                  sx={{
                    color: isActive(link.path) ? '#e94560' : 'rgba(255,255,255,0.75)',
                    fontWeight: isActive(link.path) ? 700 : 400,
                    borderBottom: isActive(link.path)
                      ? '2px solid #e94560'
                      : '2px solid transparent',
                    borderRadius: 0,
                    px: 2,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#fff',
                      background: 'rgba(233,69,96,0.1)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 240,
            background: '#1a1a2e',
            color: '#fff',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e94560', mb: 2 }}>
            NotifyHub
          </Typography>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton
                  component={Link}
                  to={link.path}
                  onClick={() => setDrawerOpen(false)}
                  selected={isActive(link.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      background: 'rgba(233,69,96,0.15)',
                      color: '#e94560',
                    },
                    '&:hover': { background: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  {link.icon}
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
