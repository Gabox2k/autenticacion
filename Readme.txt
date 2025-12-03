Requisitos
-Node.js 18+
-npm install express jsonwebtoken cookie-parser bcrypt better-sqlite3

Proyecto

Este proyecto es una aplicación web construida con Node.js y Express, que implementa un sistema completo de autenticación 
utilizando:
-JWT (JSON Web Tokens)
-Cookies HTTP-only
-Roles de usuario (user / admin)
-Protección de rutas
-Panel exclusivo para administradores
-Registro, login y logout

Características principales
-Autenticación
-Login usando JWT
-Token guardado en cookie httpOnly para mayor seguridad
-Opción de login enviando el token por Authorization Header
-Logout eliminando la cookie de acceso

Protección de rutas
Middleware general: JWT
verifica si el usuario está autenticado.

Middleware administrador: admin
permite acceso solo si el rol es "admin".

Gestión de usuarios
-Registro de nuevos usuarios
-Hash de contraseñas con bcrypt
-Creación automática de un usuario administrador la primera vez que inicia el sistema

Panel administrador
-Ver todos los usuarios registrados
-Asignar rol admin a cualquier usuario
-Eliminar usuarios

Objetivo del proyecto
Este proyecto sirve para:

-Aprender autenticación con JSON Web Tokens.
-Manejar cookies seguras en Express.
-Implementar roles de usuario.
-Proteger rutas con middlewares personalizados.
-Trabajar con SQLite y consultas SQL.
-Usar bcrypt para encriptar contraseñas.
-Practicar buenas prácticas de seguridad en backend.