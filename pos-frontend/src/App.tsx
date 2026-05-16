import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import InicioPage from './pages/01-InicioPage';
import { useAppConfig } from './hooks/useAppConfig';

const SharedAppConfigSync: React.FC = () => {
  useAppConfig();
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <SharedAppConfigSync />
      <Router>
        <Routes>
          <Route path="/" element={<InicioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
