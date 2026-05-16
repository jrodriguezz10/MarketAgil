import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import InicioPage from './pages/01-InicioPage';
import LoginPage from './pages/02-LoginPage';
import Dashboard from './pages/03-Dashboard';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import { useAppConfig } from './hooks/useAppConfig';

const SharedAppConfigSync: React.FC = () => {
  useAppConfig();
  return null;
};

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showBack = location.pathname.startsWith('/dashboard/') && location.pathname !== '/dashboard';

  return (
    <>
      <Header showBack={showBack} />
      {children}
    </>
  );
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CssBaseline />
      <SharedAppConfigSync />
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<InicioPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <PrivateLayout>
                    <Routes>
                      <Route path="" element={<Dashboard />} />
                    </Routes>
                  </PrivateLayout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
