import { PermissionKey, User, UserPermissions } from '../types';

export const PERMISSION_KEYS: PermissionKey[] = [
  'ventas',
  'productos',
  'categorias',
  'configuracion'
];

export const PERMISSION_LABELS: Record<PermissionKey, string> = {
  ventas: 'Ventas',
  productos: 'Productos',
  categorias: 'Categorias',
  configuracion: 'Configuracion'
};

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  ventas: true,
  productos: true,
  categorias: true,
  configuracion: true
};

export const DEFAULT_CAJERO_PERMISSIONS: UserPermissions = {
  ventas: true,
  productos: false,
  categorias: false,
  configuracion: true
};

export const normalizePermissions = (
  rol: 'ADMINISTRADOR' | 'CAJERO' | string | undefined,
  permissions?: Partial<UserPermissions> | null
): UserPermissions => {
  const isAdmin = String(rol || '').toUpperCase() === 'ADMINISTRADOR';
  const base = isAdmin ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_CAJERO_PERMISSIONS;
  const normalized: UserPermissions = { ...base };
  const source = permissions || {};

  PERMISSION_KEYS.forEach((key) => {
    if (typeof source[key] === 'boolean') {
      normalized[key] = source[key] as boolean;
    }
  });

  if (isAdmin) {
    PERMISSION_KEYS.forEach((key) => {
      normalized[key] = true;
    });
  }

  return normalized;
};

export const canAccess = (user: User | null | undefined, permission: PermissionKey): boolean => {
  if (!user) return false;
  const permissions = normalizePermissions(user.rol, user.permisos || null);
  return Boolean(permissions[permission]);
};
