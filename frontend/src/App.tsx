import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { LazyWrapper } from './shared/components';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './components/Landing';
import Register from './components/Register';
import { LazyLogin, LazyDashboard } from './components/LazyComponents';

function App() {
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  const handleRegistrationSuccess = () => {
    setShowWelcomeMessage(true);
  };

  return (
    <AppProviders>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/login" 
          element={
            <LazyWrapper>
              <LazyLogin showWelcomeMessage={showWelcomeMessage} />
            </LazyWrapper>
          } 
        />
        <Route 
          path="/register" 
          element={<Register onRegistrationSuccess={handleRegistrationSuccess} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <LazyWrapper>
                <LazyDashboard />
              </LazyWrapper>
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProviders>
  );
}

export default App;
