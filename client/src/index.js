import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ClosetProvider } from './contexts/ClosetContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ClosetProvider>
        <App />
      </ClosetProvider>
    </AuthProvider>
  </React.StrictMode>
);
