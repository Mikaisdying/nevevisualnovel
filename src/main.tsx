import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import Router from './router';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider
      defaultColorScheme="light"
      theme={{ fontFamily: 'Geist Variable, sans-serif' }}
    >
      <Router />
    </MantineProvider>
  </React.StrictMode>,
);
