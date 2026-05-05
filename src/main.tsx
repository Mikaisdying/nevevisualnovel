import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import { ConfigProvider } from 'antd';
import Router from './router';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Geist Variable, sans-serif',
        },
      }}
    >
      <Router />
    </ConfigProvider>
  </React.StrictMode>,
);
