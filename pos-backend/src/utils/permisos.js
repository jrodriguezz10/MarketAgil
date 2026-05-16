const PERMISSION_KEYS = [
  'ventas',
  'productos',
  'categorias',
  'configuracion'
];

const DEFAULT_ADMIN_PERMISOS = {
  ventas: true,
  productos: true,
  categorias: true,
  configuracion: true
};

const DEFAULT_CAJERO_PERMISOS = {
  ventas: true,
  productos: false,
  categorias: false,
  configuracion: true
};

const parsePermisos = (permisos) => {
  if (!permisos) return {};
  if (typeof permisos === 'object') return permisos;
  try {
    const parsed = JSON.parse(permisos);
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch {
    return {};
  }
};

const normalizePermisos = (rol, permisos) => {
  const isAdmin = String(rol || '').toUpperCase() === 'ADMINISTRADOR';
  const base = isAdmin ? DEFAULT_ADMIN_PERMISOS : DEFAULT_CAJERO_PERMISOS;
  const input = parsePermisos(permisos);
  const normalized = { ...base };

  PERMISSION_KEYS.forEach((key) => {
    if (typeof input[key] === 'boolean') {
      normalized[key] = input[key];
    }
  });

  if (isAdmin) {
    PERMISSION_KEYS.forEach((key) => {
      normalized[key] = true;
    });
  }

  return normalized;
};

module.exports = {
  PERMISSION_KEYS,
  DEFAULT_ADMIN_PERMISOS,
  DEFAULT_CAJERO_PERMISOS,
  normalizePermisos
};
