# MiniMarket POS

Configuracion inicial del sistema de punto de venta para minimarket/licoreria con frontend React y backend Node.js.

## Puertos

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8083/api`

## Ejecucion

Backend:

```bash
cd pos-backend
npm install
npm start
```

Frontend:

```bash
cd pos-frontend
npm install
npm start
```

Cada servidor se controla desde su propia terminal: `npm start` inicia y `Ctrl+C` apaga.
El frontend usa solo el puerto `3000` y el backend solo el `8083`; no se abre un puerto alternativo.

## Alcance de esta rama

Esta rama contiene solo configuracion base, documentacion y estructura de carpetas.
El codigo funcional se integrara luego desde ramas de trabajo hacia `develop`.

## Rama de Login

La rama `logica-inicio-sesion` agrega la logica completa de autenticacion de personal:

- Interfaz de inicio de sesion.
- Validacion de campos vacios y formato de correo.
- Login con usuario/correo y contrasena.
- Login con Google.
- Backend `/api/auth/login` y `/api/auth/google`.
- Bloqueo de usuario al tercer intento incorrecto.
- Base de datos minima para `ADMINISTRADOR` y `CAJERO`.

## Carpetas principales

- `pos-frontend/`: aplicacion React, paginas, componentes y servicios API.
- `pos-backend/`: API Express, controladores, rutas y conexion MySQL.
- `docs/`: guias de estructura y configuracion para exposicion.

La guia de ubicacion rapida esta en [docs/ESTRUCTURA_PROYECTO.md](docs/ESTRUCTURA_PROYECTO.md).
