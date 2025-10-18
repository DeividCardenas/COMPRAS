# Proyecto Pharma Elite Care (PEC)

Este repositorio contiene el backend (Node + Express + Prisma) y el frontend (React + Vite + TypeScript) del proyecto PEC.

Este README explica cómo configurar el entorno, gestionar la base de datos, correr migraciones, poblar datos de ejemplo y ejecutar la aplicación localmente.

---

## Contenido
- Requisitos
- Estructura principal del repo
- Variables de entorno
- Instalación (backend / frontend)
- Base de datos: migraciones, backup, reset, problemas y soluciones
- Seeds (repoblar)
- Scripts útiles añadidos
- Ejecutar backend y frontend
- Endpoints importantes y ejemplos de uso
- Credenciales de desarrollo
- Troubleshooting y notas
- Siguientes pasos recomendados

---

## Requisitos
- Node.js 18+ (recomendado)
- npm
- MySQL (o servicio equivalente) para el datasource por defecto (ver `backend/.env`)
- (Opcional) Docker Desktop — útil para crear backups si `mysqldump` no está instalado
- (Opcional) `mysqldump` para volcar DB (herramienta que viene con cliente MySQL)

---

## Estructura principal (resumen)
- `backend/` - servidor Express, Prisma, scripts y seeds
- `frontend/` - aplicación React + Vite (TypeScript)

En `backend/scripts/` encontrarás utilidades y seeds (por ejemplo: `seed_full.js`, `seed_generated.js`, `create_admin_users.js`).

---

## Variables de entorno (`backend/.env`)
Ejemplo (ya incluido en el repo):
```env
DATABASE_URL_LOCAL="mysql://root:12345@localhost:3306/PEC"
DATABASE_URL_DOCKER="postgresql://postgres:12345@pec_db:5432/pec?schema=public"

AUTH_AES_SECRET_KEY="1234567890abcdef1234567890abcdef"
AUTH_JW_SECRET_KEY="1234567890abcdef1234567890abcdef"
```

- Ajusta `DATABASE_URL_LOCAL` a tu servidor de MySQL local o usa `DATABASE_URL_DOCKER` para entornos con Docker.

---

## Instalación

1) Backend
```cmd
cd backend
npm install
```

2) Frontend
```cmd
cd \Trabajos\COMPRAS\frontend
npm install
```

---

## Prisma / Base de datos

### Generar Prisma Client
```cmd
cd backend
npx prisma generate
```
ó
```cmd
npm run build
```

### Crear y aplicar migraciones (modo dev)
# Proyecto PEC

Este repositorio contiene el backend (Node + Express + Prisma) y el frontend (React + Vite + TypeScript) del proyecto PEC.

Este README explica cómo configurar el entorno, gestionar la base de datos, correr migraciones, poblar datos de ejemplo y ejecutar la aplicación localmente.

---

## Contenido
- Requisitos
- Estructura principal del repo
- Variables de entorno
- Instalación (backend / frontend)
- Base de datos: migraciones, backup, reset, problemas y soluciones
- Seeds (repoblar)
- Scripts útiles añadidos
- Ejecutar backend y frontend
- Endpoints importantes y ejemplos de uso
- Credenciales de desarrollo
- Troubleshooting y notas
- Siguientes pasos recomendados

---

## Requisitos
- Node.js 18+ (recomendado)
- npm
- MySQL (o servicio equivalente) para el datasource por defecto (ver `backend/.env`)
- (Opcional) Docker Desktop — útil para crear backups si `mysqldump` no está instalado
- (Opcional) `mysqldump` para volcar DB (herramienta que viene con cliente MySQL)

---

## Estructura principal (resumen)
- `backend/` - servidor Express, Prisma, scripts y seeds
- `frontend/` - aplicación React + Vite (TypeScript)

En `backend/scripts/` encontrarás utilidades y seeds (por ejemplo: `seed_full.js`, `seed_generated.js`, `create_admin_users.js`).

---

## Variables de entorno (`backend/.env`)
Ejemplo (ya incluido en el repo):
```env
DATABASE_URL_LOCAL="mysql://root:12345@localhost:3306/PEC"
DATABASE_URL_DOCKER="postgresql://postgres:12345@pec_db:5432/pec?schema=public"

AUTH_AES_SECRET_KEY="1234567890abcdef1234567890abcdef"
AUTH_JW_SECRET_KEY="1234567890abcdef1234567890abcdef"
```

- Ajusta `DATABASE_URL_LOCAL` a tu servidor de MySQL local o usa `DATABASE_URL_DOCKER` para entornos con Docker.

---

## Instalación

1) Backend
```cmd
cd backend
npm install
```

2) Frontend
```cmd
cd \Trabajos\COMPRAS\frontend
npm install
```

---

## Prisma / Base de datos

### Generar Prisma Client
```cmd
cd backend
npx prisma generate
```
ó
```cmd
npm run build
```

### Crear y aplicar migraciones (modo dev)
```cmd
cd backend
npx prisma migrate dev --name <nombre_migracion>
```

Si Prisma detecta "drift" (diferencias entre migraciones y esquema real) verás un aviso y podrá pedir reset.

### Backup de la BD (mysqldump)
```cmd
cd backend
mkdir backups
mysqldump -u root -p PEC > backups\pec_backup_YYYYMMDD.sql
```

Si `mysqldump` no está instalado en Windows, busca `mysqldump.exe` en la carpeta bin de MySQL o usa Docker (ver más abajo).

### Usar Docker para crear backup (si Docker Desktop está instalado)
```cmd
cd backend
mkdir backups
docker run --rm -v "%cd%\\backups:/backups" mysql:8.0 sh -c "exec mysqldump -h host.docker.internal -P 3306 -u root -p'12345' PEC > /backups/pec_backup.sql"
```

### Resetear la DB (destructivo)
```cmd
cd backend
npx prisma migrate reset --force
```

Nota: esto borra todos los datos.

### Si no puedes aplicar migración por drift
En desarrollo, si `prisma migrate dev` o `db push` fallan por constraints/indices, puedes:
- Hacer backup y reset.
- Reconciliar manualmente las FK/índices en MySQL.
- Como workaround temporal, se incluyó `backend/scripts/create_proveedor_table.js` para crear la tabla `proveedores` directamente.

---

## Seeds (repoblar datos de ejemplo)

Scripts disponibles en `backend/scripts`:
- `seed.js` — seed mínimo (laboratorio, tarifario, producto)
- `seed_full.js` — seed completo (laboratorios, empresas, EPS, tarifarios, productos y asignaciones)
- `seed_generated.js` — importa JSON desde `backend/data/*.json` y hace createMany

Ejecutar:
```cmd
cd backend
npm run seed:full
npm run seed:generated
```

---

## Scripts de utilidad (creados durante debug)
- `create_proveedor_table.js` — crea la tabla `proveedores` si no existe
- `create_admin_users.js` — crea roles `admin` y `user` y dos cuentas de prueba
- `update_admin_password.js` — actualiza la contraseña de un usuario por email

Ejemplo:
```cmd
node scripts\create_admin_users.js
node scripts\update_admin_password.js admin@admin.com admin123
```

---

## Ejecutar la aplicación

1) Backend (dev)
```cmd
cd backend
npm run dev
```

2) Frontend (Vite)
```cmd
cd \Trabajos\COMPRAS\frontend
npm run dev
```

---

## Endpoints importantes (resumen)

Base: `http://localhost:2000/pec`

- POST `/pec/usuario/login` — login
  - body: `{ "email": "admin@admin.com", "password": "admin123" }`
- GET `/pec/proveedores` — listar proveedores (params: `page`, `limit`, `search`)
- POST `/pec/proveedores` — crear proveedor

Consulta `backend/routes` para la lista completa de rutas.

---

## Credenciales de desarrollo (seed)
- Admin: `admin@admin.com` / `admin123`
- User: `user@mail.com` / `user123`

Estas credenciales son solo para desarrollo local.

---

## Troubleshooting (problemas comunes y soluciones)

1. `prisma generate` falla con EPERM al renombrar query engine
- Causa: archivo bloqueado por proceso node o antivirus.
- Solución: cerrar procesos `node.exe`, eliminar `node_modules/.prisma/client` y volver a generar. Ejecutar como administrador si hace falta.

2. `prisma migrate dev` detecta drift
- Si no necesitas datos: `npx prisma migrate reset --force`.
- Si necesitas conservar datos: hacer backup y reconciliar manualmente FKs o generar diff SQL.

3. `mysqldump` no encontrado en Windows
- Usar ruta completa al binario MySQL o usar Docker/Workbench.

4. 400 Bad Request en login
- Verifica la contraseña usada; puedes actualizar la contraseña de desarrollo con `node scripts/update_admin_password.js admin@admin.com <password>`.
