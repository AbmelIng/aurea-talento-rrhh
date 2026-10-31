# Aurea Talento — sistema de RR. HH.

Aplicación Angular y NestJS con SQLite o MySQL. Esta copia conserva el módulo de empleados, acceso por rol, historial laboral, hojas de tiempo y recibos manuales del sprint 3. El tablero de Sprint Planning es otro proyecto.

## Instalación de desarrollo

Requiere Node.js 24 y npm. La API no lee automáticamente archivos `.env`; define las variables en el entorno del proceso. En PowerShell:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint3\api"
npm ci
$env:APP_SECRET = 'reemplace-por-una-clave-aleatoria-de-al-menos-32-caracteres'
$env:BOOTSTRAP_EMAIL = 'administrador@suempresa.com'
$env:BOOTSTRAP_FIRST_NAME = 'Nombre'
$env:BOOTSTRAP_LAST_NAME = 'Apellido'
npm run bootstrap:admin
npm run dev
```

Genera una clave privada propia, por ejemplo con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; guarda el valor en la configuración segura del servidor y reutilízalo en cada reinicio. No uses literalmente el ejemplo del bloque anterior.

El comando de inicialización muestra una contraseña aleatoria **una sola vez**. Guárdala de forma segura y cámbiala al entrar. Si ya existen usuarios o empleados, el comando se niega a crear otro administrador. Una instalación nueva crea el esquema y la configuración de códigos, pero **no crea usuarios, empleados ni recibos ficticios**. El administrador inicial es una cuenta real con un expediente mínimo.

En otra terminal:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint3\web"
npm ci
npm start
```

Abre `http://localhost:4201`. La API escucha en `http://127.0.0.1:3001/api`. Después de iniciar sesión, configura los cinco catálogos en **Configuración**, revisa el formato de códigos y crea los empleados. La cuenta de Nómina se obtiene asignando ese rol a un empleado desde Configuración.

## Base de datos y migración

SQLite es el modo local predeterminado. Para MySQL 8.4, `compose.yaml` prepara un contenedor con volumen persistente. Define `MYSQL_PASSWORD` y `MYSQL_ROOT_PASSWORD` antes de `docker compose up -d`; después configura `DB_DRIVER=mysql`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_DATABASE` para la API. Véase `api/.env.example`. **El modo MySQL requiere una prueba de integración con un servidor MySQL disponible antes de usarlo con datos reales.**

`api/src/database.ts` contiene la migración versionada `1`: crea `catalog_options` y `employee_code_config`, añade identificadores y claves foráneas de catálogo a `employees` y `employment_history`, y conserva los textos históricos. Las instalaciones anteriores se migran al arrancar; sus valores existentes pasan al catálogo. La migración no borra datos anteriores. Haz una copia de la base antes de actualizar.

`api/data/` está excluido de la entrega mediante `.gitignore`. **No copies una base SQLite antigua con usuarios de demostración a una instalación nueva.** Para producción, usa una base vacía y ejecuta `bootstrap:admin` una sola vez. Los datos existentes no se eliminan automáticamente para evitar pérdida accidental.

## Puesta en servicio

1. Prepara el servidor, la base de datos vacía y copias de seguridad verificadas. No expongas el puerto de MySQL a Internet.
2. Configura `NODE_ENV=production`, una `APP_SECRET` aleatoria y estable de al menos 32 caracteres, `WEB_ORIGIN` exacto y las variables de base de datos. La API no arranca en producción sin las dos primeras variables requeridas.
3. Ejecuta `npm ci` y `npm run bootstrap:admin` en la API, con acceso restringido a la consola. Retira las variables `BOOTSTRAP_*` del entorno después.
4. Compila con `npm run build` en `api` y `web`, y ejecuta `npm start` desde `api` bajo un supervisor de procesos. Publica Angular y coloca NestJS detrás de un proxy HTTPS que sirva `/api` en el mismo origen. En desarrollo, Angular llama a `127.0.0.1:3001`; en otro host usa `/api` del origen actual.
5. Entra como administrador, cambia la contraseña inicial, configura los catálogos y los códigos, y luego crea las demás cuentas. Comprueba permisos y respaldos con datos no sensibles antes de cargar expedientes reales.

## Seguridad y alcance

Las contraseñas se guardan con `scrypt`; las sesiones firmadas expiran a las ocho horas. Cambiar la contraseña revoca las sesiones anteriores. `ADMIN` puede delegar el permiso **MODIFICACIÓN Catálogos del sistema** sin ceder el rol de administrador. Los formularios cargan opciones del backend y este valida que pertenezcan a la categoría y estén activas. El código de empleado se reserva en una transacción y tiene restricción única. La nómina de este sprint registra importes manuales: **no calcula impuestos ni ejecuta pagos**.

Antes de atender clientes reales todavía se requiere revisar seguridad de despliegue, recuperación de cuentas, gestión de secretos, respaldo y restauración, retención de datos personales, auditoría de acceso y cumplimiento legal. El cambio de esquema se probó con SQLite; la ruta MySQL debe validarse en el entorno objetivo.

## Comprobación

```powershell
cd api
npm test
cd ..\web
npm test -- --watch=false
npm run build
```
