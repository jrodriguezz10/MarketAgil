-- Base de datos minima para inicio de sesion de personal.
-- Incluye solo usuarios con rol ADMINISTRADOR y CAJERO.
-- Credenciales demo:
--   Usuario: admin   | Password: admin123
--   Usuario: cajero  | Password: cajero123
-- Cambiar estas contrasenas antes de usar en produccion.

CREATE DATABASE IF NOT EXISTS licoreria_pos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE licoreria_pos;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  nombre_completo VARCHAR(120) NOT NULL,
  rol ENUM('ADMINISTRADOR', 'CAJERO') NOT NULL,
  password VARCHAR(255) NOT NULL,
  dni VARCHAR(8) NULL,
  telefono VARCHAR(9) NULL,
  email VARCHAR(180) NULL UNIQUE,
  foto_url MEDIUMTEXT NULL,
  permisos LONGTEXT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  lockouts INT NOT NULL DEFAULT 0,
  lock_until DATETIME NULL,
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (
  nombre_usuario,
  nombre_completo,
  rol,
  password,
  email,
  permisos,
  is_active
) VALUES
(
  'admin',
  'Administrador del Sistema',
  'ADMINISTRADOR',
  'scrypt$960db4a7788b05e0e56a9d1aa50e5a0d$32b55ed4c71578cfd0b00a828fdc46793c62232a7d1aaf1b2d7044210d38591381b90d088d0cb5d91d72f84332e38cab2f1000134d3596ec01c1854c10dc58fa',
  'admin@marketagil.local',
  '{"ventas":true,"productos":true,"categorias":true,"configuracion":true}',
  1
),
(
  'cajero',
  'Cajero del Sistema',
  'CAJERO',
  'scrypt$bde2b77b471d274b059e4c18e925dd77$1f06dbd7e6e2fc80da7fb031bca949c3896860c2b9d2a980645638d614c55d86a969795a7743be139f93ead114cea3fb14ae7628c832e9e54f4855c7fe667f23',
  'cajero@marketagil.local',
  '{"ventas":true,"productos":false,"categorias":false,"configuracion":false}',
  1
)
ON DUPLICATE KEY UPDATE
  nombre_completo = VALUES(nombre_completo),
  rol = VALUES(rol),
  password = VALUES(password),
  email = VALUES(email),
  permisos = VALUES(permisos),
  failed_attempts = 0,
  lockouts = 0,
  lock_until = NULL,
  is_blocked = 0,
  is_active = VALUES(is_active);
