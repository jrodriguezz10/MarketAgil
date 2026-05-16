import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory,
  Category,
  PointOfSale,
  Settings,
  Business,
  Assessment
} from '@mui/icons-material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../services/api';
import { Skeleton } from '../components/ui/skeleton';
import { DashboardStats, PermissionKey } from '../types';
import LockIcon from '@mui/icons-material/Lock';
import { canAccess } from '../utils/permissions';
import { useAppConfig } from '../hooks/useAppConfig';
import { useI18n } from '../hooks/useI18n';

const StatCard = ({ title, value, loading }: { title: string; value: string | number, loading: boolean }) => {
    return (
        <Card sx={{ p: 3, width: '100%', minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxShadow: 3 }}>
            <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
            {loading ? (
                 <Skeleton className="w-2/3 h-8 mt-1" />
            ) : (
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mt: 1 }}>{value}</Typography>
            )}
        </Card>
    );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const config = useAppConfig();
  const { t } = useI18n();

  const menuItems: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    path?: string;
    color: string;
    permission?: PermissionKey;
    designOnly?: boolean;
  }> = [
    {
      title: 'Ventas',
      description: t('Registrar y gestionar ventas', 'Register and manage sales'),
      icon: <PointOfSale sx={{ fontSize: 40 }} />,
      path: '/dashboard/ventas',
      color: '#f57c00',
      permission: 'ventas'
    },
    {
      title: 'Productos',
      description: t('Gestionar inventario y productos', 'Manage inventory and products'),
      icon: <Inventory sx={{ fontSize: 40 }} />,
      path: '/dashboard/productos',
      color: '#1976d2',
      permission: 'productos'
    },
    {
      title: 'Categorías',
      description: t('Administrar categorías de productos', 'Manage product categories'),
      icon: <Category sx={{ fontSize: 40 }} />,
      path: '/dashboard/categorias',
      color: '#388e3c',
      permission: 'categorias'
    },
    {
      title: 'Proveedores',
      description: t('Gestionar proveedores', 'Manage suppliers'),
      icon: <Business sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      designOnly: true
    },
    {
      title: 'Reportes',
      description: t('Consultar reportes del negocio', 'View business reports'),
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: '#00897b',
      designOnly: true
    },
    {
      title: 'Configuración',
      description: t('Configurar el sistema', 'Configure the system'),
      icon: <Settings sx={{ fontSize: 40 }} />,
      path: '/dashboard/configuracion',
      color: '#d32f2f',
      permission: 'configuracion'
    },
  ];

  // Mostrar menú solo en la ruta exacta /dashboard
  const isDashboardRoot = location.pathname === '/dashboard';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Aquí podrías mostrar una notificación de error al usuario
      } finally {
        setLoading(false);
      }
    };

    if (isDashboardRoot && user?.rol === 'ADMINISTRADOR') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isDashboardRoot, user?.rol]);

  if (!isDashboardRoot) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" mb={2}>
          <DashboardIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" component="h1">
            {t('Dashboard', 'Dashboard')}
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary">
          {t('Bienvenido,', 'Welcome,')} {user?.nombreCompleto || user?.nombreUsuario}
        </Typography>
      </Box>

      {/* Estadísticas rápidas solo para administrador */}
      {isDashboardRoot && user?.rol === 'ADMINISTRADOR' && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title={t('Productos Activos', 'Active Products')} loading={loading} value={stats?.productosActivos ?? 0} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title={t('Ventas Hoy', 'Sales Today')} loading={loading} value={stats?.ventasHoy ?? 0} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title={t('Ingresos Hoy', 'Revenue Today')} loading={loading} value={stats ? formatCurrency(stats.ingresosHoy) : 'S/ 0.00'} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title={t('Productos Bajos', 'Low Stock Products')} loading={loading} value={stats?.productosBajos ?? 0} />
            </Grid>
          </Grid>
        </>
      )}

      {/* Menú principal */}
      <Typography variant="h5" gutterBottom mb={3}>
        {t('Funciones Principales', 'Main Functions')}
      </Typography>
      <Grid container spacing={3}>
        {menuItems.map((item) => {
          const isDesignOnly = item.designOnly === true;
          const isEnabled = isDesignOnly || (item.permission ? canAccess(user, item.permission) : false);
          const itemPath = item.path;
          const handleCardClick = !isDesignOnly && isEnabled && itemPath ? () => navigate(itemPath) : undefined;
          return (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={item.title}>
              <Box position="relative">
                <Card
                  sx={{
                    height: '100%',
                    cursor: isDesignOnly ? 'default' : isEnabled ? 'pointer' : 'not-allowed',
                    filter: isEnabled ? 'none' : 'blur(2px) grayscale(0.5)',
                    pointerEvents: isEnabled ? 'auto' : 'none',
                    transition: 'filter 0.2s',
                    opacity: isEnabled ? 1 : 0.7,
                  }}
                  onClick={handleCardClick}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Box sx={{ color: item.color, mb: 2 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
                {!isEnabled && (
                  <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" zIndex={2}>
                    <LockIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.8 }} />
                  </Box>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* Aquí se renderizan las subpáginas */}
      <Outlet />

      {/* Información adicional */}
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('Información del Sistema', 'System Information')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {config.appName} v1.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('Usuario:', 'User:')} {user?.nombreCompleto || user?.nombreUsuario}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Dashboard; 
