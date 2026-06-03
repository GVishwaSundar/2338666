// src/App.jsx
// Root component — sets up MUI theme, router, and layout.
// Author: G Vishwa Sundar | Roll No: 2338666

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';

import Navbar from './components/Navbar';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

// ── MUI dark theme ─────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#e94560' },
    secondary:  { main: '#f0a500' },
    background: {
      default: '#0d0d1a',
      paper:   '#12121f',
    },
    text: {
      primary:   'rgba(255,255,255,0.92)',
      secondary: 'rgba(255,255,255,0.55)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* Page wrapper with dark gradient background */}
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #0d0d1a 0%, #0f1525 50%, #0d0d1a 100%)',
          }}
        >
          <Navbar />
          <Routes>
            <Route path="/"         element={<AllNotifications />} />
            <Route path="/priority" element={<PriorityInbox />}    />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
