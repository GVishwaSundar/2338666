// src/index.js
// React entry point.
// Author: G Vishwa Sundar | Roll No: 2338666

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Google Fonts — Inter
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
link.rel  = 'stylesheet';
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
