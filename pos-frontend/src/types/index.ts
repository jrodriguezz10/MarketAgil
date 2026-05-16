// Interfaces principales para el sistema POS

export type PermissionKey =
  | 'ventas'
  | 'productos'
  | 'categorias'
  | 'configuracion';

export type UserPermissions = Record<PermissionKey, boolean>;

export interface User {
    id?: number;
    nombreUsuario: string;
    nombreCompleto: string;
    rol: 'ADMINISTRADOR' | 'CAJERO';
    dni?: string;
    telefono?: string;
    email?: string;
    fotoUrl?: string;
    permisos?: Partial<UserPermissions> | null;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precioVenta: number;
    stockActual: number;
    categoriaId: number;
    imagen?: string;
    activo?: boolean;
    cantidad?: number; // cantidad vendida (solo en ventas)
}

export interface LoginData {
    nombreUsuario: string;
    password: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface VentaProducto {
  producto: Producto;
  cantidad: number;
}

export type VentaProductoInput =
  | { productoId: number; cantidad: number; precioUnitario?: number }
  | { producto: Producto; cantidad: number; precioUnitario?: number };

export interface Venta {
  id: number;
  numero?: number;
  productosVendidos: VentaProducto[];
  total: number;
  fecha: string; // ISO string
  metodoPago?: string;
  recibido?: number;
  vuelto?: number;
  clienteDni?: string | null;
  clienteNombre?: string | null;
  vendedorId?: number | null;
  vendedorUsuario?: string | null;
  vendedorNombre?: string | null;
  pagoReferencia?: string | null;
  pagoConfirmadoAt?: string | null;
}

export type VentaCreatePayload = {
  productosVendidos: VentaProductoInput[];
  total: number;
  totalExtra?: number;
  metodoPago?: string;
  recibido?: number;
  vuelto?: number;
  pagoReferencia?: string | null;
  clienteDni?: string | null;
  clienteNombre?: string | null;
  vendedorId?: number | null;
  vendedorUsuario?: string | null;
  vendedorNombre?: string | null;
};

export interface DashboardStats {
  productosActivos: number;
  ventasHoy: number;
  ingresosHoy: number;
  productosBajos: number;
  productosVendidos: number;
} 
