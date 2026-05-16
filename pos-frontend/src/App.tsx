import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import InicioPage from './pages/01-InicioPage';
import LoginPage from './pages/02-LoginPage';
import { useAppConfig } from './hooks/useAppConfig';

const SharedAppConfigSync: React.FC = () => {
  useAppConfig();
  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <SharedAppConfigSync />
      <Router>
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
