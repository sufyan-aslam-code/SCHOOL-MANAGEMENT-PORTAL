import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ScrollToTop from './components/layout/ScrollToTop'; // 1. Import ScrollToTop
import AppRoutes from './routes/AppRoutes';
import './styles/index.css';

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop /> {/* 2. Place it right here inside BrowserRouter */}
            {/* Added Toaster for global notifications */}
            <Toaster position="top-right" />
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;