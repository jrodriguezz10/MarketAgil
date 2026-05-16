const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const authRoutes = require('./routes/auth');

const app = express();
app.disable('x-powered-by');

const DEFAULT_AUTH_SECRET = 'change-this-auth-secret';
const isProduction = String(process.env.NODE_ENV || '').toLowerCase() === 'production';

const parseCorsOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const corsOrigins = parseCorsOrigins(env.cors?.origin);

app.use(cors(corsOrigins.length > 0 ? { origin: corsOrigins } : undefined));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    authConfigured: String(env.auth?.secret || '').trim() !== DEFAULT_AUTH_SECRET,
    corsConfigured: corsOrigins.length > 0
  });
});

app.use('/api/auth', authRoutes);

app.use((err, _req, res, _next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor.'
  });
});

app.listen(env.port, '0.0.0.0', () => {
  if (String(env.auth?.secret || '').trim() === DEFAULT_AUTH_SECRET) {
    console.warn('AUTH_SECRET no está configurado. Cambia esa clave antes de producción.');
  }
  console.log(`API de autenticación en http://localhost:${env.port}`);
});
