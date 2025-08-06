import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '../../contexts/AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      <Router>
        <AuthProvider>
          {children}
        </AuthProvider>
      </Router>
    </QueryProvider>
  );
};