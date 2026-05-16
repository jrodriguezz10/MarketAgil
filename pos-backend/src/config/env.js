const path = require('path');
const fs = require('fs');

const resolveEnvPath = () => {
  const cwdEnv = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(cwdEnv)) return cwdEnv;
  // pos-backend/.env (desde src/config/env.js)
  const projectEnv = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(projectEnv)) return projectEnv;
  return cwdEnv;
};

require('dotenv').config({ path: resolveEnvPath() });

const env = {
  port: Number(process.env.PORT) || 8083,
  auth: {
    secret: process.env.AUTH_SECRET || 'change-this-auth-secret'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || ''
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'licoreria_pos'
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
  }
};

module.exports = env;
