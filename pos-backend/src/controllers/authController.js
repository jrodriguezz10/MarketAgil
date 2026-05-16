const axios = require('axios');
const pool = require('../db/pool');
const env = require('../config/env');
const { normalizePermisos } = require('../utils/permisos');
const { ensurePasswordColumnSchema } = require('../utils/ensurePasswordColumnSchema');
const { hashPassword, verifyPassword, needsPasswordRehash } = require('../utils/passwords');
const { createToken } = require('../utils/tokens');

let usuariosPermisosColumnChecked = false;
const MAX_LOGIN_ATTEMPTS = 3;
const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';

const USER_SELECT = `SELECT id, nombre_usuario, nombre_completo, rol, password, dni, telefono, email, foto_url,
            permisos, failed_attempts, lockouts, lock_until, is_blocked, is_active
     FROM usuarios`;

const ensureUsuariosPermisosColumn = async (runner = pool) => {
  if (usuariosPermisosColumnChecked) return;

  await ensurePasswordColumnSchema({ tableName: 'usuarios', runner });

  const [rows] = await runner.query(
    `SELECT COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'usuarios'
        AND COLUMN_NAME IN ('permisos', 'dni', 'email')`
  );

  const info = rows.reduce((acc, row) => {
    acc[String(row.COLUMN_NAME || '').toLowerCase()] = String(row.DATA_TYPE || '').toLowerCase();
    return acc;
  }, {});

  if (!info.permisos) {
    await runner.query('ALTER TABLE usuarios ADD COLUMN permisos LONGTEXT NULL');
  } else {
    const validTypes = new Set(['json', 'text', 'mediumtext', 'longtext']);
    if (!validTypes.has(info.permisos)) {
      await runner.query('ALTER TABLE usuarios MODIFY COLUMN permisos LONGTEXT NULL');
    }
  }

  if (!info.dni) {
    await runner.query('ALTER TABLE usuarios ADD COLUMN dni VARCHAR(8) NULL');
  } else if (info.dni !== 'varchar') {
    await runner.query('ALTER TABLE usuarios MODIFY COLUMN dni VARCHAR(8) NULL');
  }

  if (!info.email) {
    await runner.query('ALTER TABLE usuarios ADD COLUMN email VARCHAR(180) NULL');
  } else if (info.email !== 'varchar') {
    await runner.query('ALTER TABLE usuarios MODIFY COLUMN email VARCHAR(180) NULL');
  }

  usuariosPermisosColumnChecked = true;
};

const buildAuthPayload = (row, extra = {}) => {
  const user = {
    id: row.id,
    nombreUsuario: row.nombre_usuario,
    nombreCompleto: row.nombre_completo,
    rol: row.rol,
    dni: row.dni,
    telefono: row.telefono,
    email: row.email,
    fotoUrl: row.foto_url || extra.fotoUrl,
    permisos: normalizePermisos(row.rol, row.permisos)
  };

  const token = createToken({
    sub: row.id,
    role: row.rol,
    type: 'admin'
  });

  return { token, user };
};

const validateUserAccess = (row) => {
  const role = String(row.rol || '').trim().toUpperCase();
  if (!['ADMINISTRADOR', 'CAJERO'].includes(role)) {
    return { status: 403, message: 'Rol no permitido en este sistema.' };
  }

  if (row.is_active === 0) {
    return { status: 403, message: 'Cuenta desactivada. Contacta al administrador.' };
  }

  if (row.is_blocked) {
    return { status: 403, message: 'Cuenta bloqueada. Contacta al administrador.' };
  }

  return null;
};

const resetLoginAttempts = async (userId) => {
  await pool.execute(
    'UPDATE usuarios SET failed_attempts = 0, lockouts = 0, lock_until = NULL WHERE id = ?',
    [userId]
  );
};

const registerFailedAttempt = async (row, res) => {
  const nextAttempts = Number(row.failed_attempts || 0) + 1;

  if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
    await pool.execute(
      'UPDATE usuarios SET is_blocked = 1, failed_attempts = 0, lock_until = NULL WHERE id = ?',
      [row.id]
    );
    return res.status(403).json({
      message: 'Cuenta bloqueada. Te quedan 0 intentos. Contacta al administrador.',
      remaining_attempts: 0
    });
  }

  const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - nextAttempts);
  await pool.execute(
    'UPDATE usuarios SET failed_attempts = ? WHERE id = ?',
    [nextAttempts, row.id]
  );

  return res.status(401).json({
    message: `Credenciales inválidas. Te quedan ${remainingAttempts} intentos.`,
    remaining_attempts: remainingAttempts
  });
};

const verifyGoogleCredential = async (credential) => {
  const clientId = String(env.google?.clientId || '').trim();
  if (!clientId) {
    throw new Error('Google no está configurado.');
  }

  const { data } = await axios.get(GOOGLE_TOKENINFO_URL, {
    params: { id_token: credential },
    timeout: 8000
  });

  const audience = String(data?.aud || '').trim();
  const email = String(data?.email || '').trim().toLowerCase();
  const emailVerified = String(data?.email_verified || '').toLowerCase() === 'true';

  if (audience !== clientId || !email || !emailVerified) {
    throw new Error('Token de Google inválido.');
  }

  return {
    email,
    name: String(data?.name || '').trim(),
    picture: String(data?.picture || '').trim()
  };
};

const login = async (req, res) => {
  await ensureUsuariosPermisosColumn();
  const { nombreUsuario, password } = req.body;
  const identifier = String(nombreUsuario || '').trim();
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Rellena todos los campos.' });
  }

  const [rows] = await pool.query(
    `${USER_SELECT} WHERE nombre_usuario = ? OR LOWER(email) = ? LIMIT 1`,
    [identifier, identifier.toLowerCase()]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: 'Credenciales inválidas.' });
  }

  const row = rows[0];
  const accessError = validateUserAccess(row);
  if (accessError) {
    return res.status(accessError.status).json({ message: accessError.message });
  }

  const passwordOk = verifyPassword(row.password, password);
  if (!passwordOk) {
    return registerFailedAttempt(row, res);
  }

  await resetLoginAttempts(row.id);

  if (needsPasswordRehash(row.password)) {
    const hashedPassword = hashPassword(password);
    await pool.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, row.id]);
  }

  res.json(buildAuthPayload(row));
};

const loginWithGoogle = async (req, res) => {
  await ensureUsuariosPermisosColumn();
  const credential = String(req.body?.credential || '').trim();
  if (!credential) {
    return res.status(400).json({ message: 'Continúa con un correo válido.' });
  }

  let googleUser;
  try {
    googleUser = await verifyGoogleCredential(credential);
  } catch {
    return res.status(401).json({ message: 'Continúa con un correo válido.' });
  }

  const [rows] = await pool.query(
    `${USER_SELECT} WHERE LOWER(email) = ? LIMIT 1`,
    [googleUser.email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: 'Continúa con un correo válido.' });
  }

  const row = rows[0];
  const accessError = validateUserAccess(row);
  if (accessError) {
    return res.status(accessError.status).json({ message: accessError.message });
  }

  await resetLoginAttempts(row.id);
  res.json(buildAuthPayload(row, { fotoUrl: googleUser.picture }));
};

module.exports = {
  login,
  loginWithGoogle
};
