# Estructura Inicial del Proyecto

Esta rama contiene la estructura base. Los modulos funcionales se agregaran despues en ramas de desarrollo.

## Raiz

- `README.md`: inicio rapido del proyecto.
- `pos-frontend/`: interfaz web.
- `pos-backend/`: API y base de datos.
- `docs/`: documentacion para exposicion.

## Frontend

Ruta base: `pos-frontend/src`

- `App.tsx`: rutas principales y proteccion por permisos.
- `index.tsx`: punto de entrada de React.
- `pages/`: pantallas completas.
  - `Dashboard.tsx`: resumen principal.
  - `VentasPage.tsx`: ventas, pagos y boleta.
  - `ProductosPage.tsx`: mantenimiento de productos.
  - `CategoriasPage.tsx`: mantenimiento de categorias.
  - `ConfiguracionPage.tsx`: usuarios, permisos, personalizacion y datos de boleta.
  - `AuthPage.tsx`: login del personal.
- `components/`: piezas reutilizables.
  - `common/`: botones, loader y acciones comunes.
  - `forms/`: formularios de productos y categorias.
  - `layout/`: encabezados y pie de pagina.
  - `ui/`: componentes visuales pequenos.
- `contexts/`: estado global de autenticacion.
- `hooks/`: hooks reutilizables.
- `services/`: llamadas al backend.
- `types/`: tipos TypeScript.
- `utils/`: helpers de configuracion, permisos, boleta y conversiones.

Estilos: el frontend usa Material UI con `sx` dentro de componentes y paginas. Si luego se agregan CSS por pantalla, la convencion recomendada es `src/styles/pages/nombre-pagina.css`.

## Backend

Ruta base: `pos-backend/src`

- `index.js`: arranque de Express y registro de rutas.
- `config/env.js`: variables de entorno.
- `db/pool.js`: conexion MySQL.
- `routes/`: definicion de endpoints.
- `controllers/`: logica de cada modulo.
- `utils/`: autenticacion, permisos y migraciones ligeras.
- `pagos/`: Mercado Pago.
- `apidni/`: consulta DNI.

## Configuracion

- Frontend activo: `pos-frontend/.env`
- Backend activo: `pos-backend/.env`
- Plantillas limpias: `docs/configuracion/`

## Modulos previstos

- Autenticacion de personal.
- Dashboard.
- Ventas con boleta simple/electronica.
- Productos.
- Categorias.
- Configuracion de usuarios, permisos y boleta.
