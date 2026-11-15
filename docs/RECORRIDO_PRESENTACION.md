# Recorrido de presentación

La aplicación pública en `https://aurea-talento-rrhh.vercel.app/` está conectada al Droplet con MySQL. Su base real solo contiene el administrador inicial. **No insertes los datos ficticios de esta guía en esa instalación.** Para mostrar todos los roles, usa la base SQLite local separada `api/data/aurea-demo.sqlite`.

## Preparar la demostración local

Desde PowerShell, en la carpeta `api`:

```powershell
npm ci
npm run demo:rehearse
Get-Content .\data\demo-credentials.json
```

La base de presentación **ya fue preparada en esta copia local**. Si instalas el proyecto en otro equipo, ejecuta `npm run demo:seed` una sola vez antes del ensayo. Ese comando crea ocho cuentas con contraseñas aleatorias, un cliente, un encargo activo, una vacante pública, un saldo de vacaciones, un período y condiciones de pago. Se niega a ejecutarse en producción o con MySQL y no sobrescribe una demostración existente. `demo:rehearse` inicia la API sobre una **copia temporal** de esa base y comprueba los flujos; deja los resultados en `api/data/demo-rehearsal-result.json`. Las contraseñas y la clave de sesiones están en `api/data/`, excluido de Git. No las publiques ni las pegues en una presentación.

Para abrir las pantallas locales, inicia la API en una terminal:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint8\api"
$env:NODE_ENV = 'development'
$env:DB_DRIVER = 'sqlite'
$env:SQLITE_FILE = (Resolve-Path .\data\aurea-demo.sqlite).Path
$env:APP_SECRET = (Get-Content .\data\demo-secret.txt -Raw).Trim()
$env:WEB_ORIGIN = 'http://localhost:4201'
npm run dev
```

En otra terminal:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint8\web"
npm ci
npm start
```

Abre `http://localhost:4201`. El frontend local usa `http://127.0.0.1:3001/api` y la base ficticia; el enlace público continúa usando MySQL del Droplet.

## Guion breve por roles

1. **Administración:** entra con la cuenta `ADMIN`, muestra el directorio, catálogos y configuración de códigos. Explica que los datos de prueba viven solo en la copia local.
2. **RR. HH.:** entra como `HR_ADMIN`, abre Personas y Reclutamiento. Muestra las opciones de formularios y la vacante ficticia ya publicada, sin enviar correos externos.
3. **Empleado:** entra como `EMPLOYEE`, abre Mi información y Mis engagements. El empleado solo ve el encargo asignado. En Mi hoja de tiempo registra 8 horas en una fecha dentro del período y elige el encargo; después envía la hoja.
4. **Gerente:** entra como `MANAGER`, muestra el encargo y revisa la hoja enviada. Apruébala. Muestra que puede comparar horas planificadas con registradas.
5. **Ausencias:** como `EMPLOYEE`, solicita 8 horas de vacaciones para el último día del período. Como `MANAGER`, aprueba la solicitud; el saldo baja de 40 a 32 horas.
6. **Nómina:** entra como `PAYROLL`, abre el período y genera borradores. Muestra las condiciones de pago, la vista previa y envía el cálculo a aprobación.
7. **Administración:** aprueba el cálculo con una cuenta distinta de Nómina. Vuelve a `PAYROLL` y publica. Entra otra vez como `EMPLOYEE` para ver su recibo.
8. **Legal, Cumplimiento y Socio:** inicia sesión con `LEGAL`, `COMPLIANCE` y `PARTNER` para enseñar que son cuentas separadas y explicar su papel en la selección avanzada. Este ensayo automatizado comprueba su acceso al expediente propio, pero **no recorre una oferta completa**.

Si el recorrido manual modifica la base de demostración, conserva `api/data/aurea-demo.sqlite` como evidencia. Para empezar otra demostración, prepara una nueva copia en otra carpeta; el comando de creación no sobrescribe datos existentes.

## Resultados comprobados

El ensayo automatizado local comprueba arranque, ocho roles, permisos, vacante pública, engagements, horas, vacaciones y cálculo/publicación de nómina con recibo. Se ejecuta sobre una copia temporal de SQLite. También se comprobó por separado que el sitio público y `/api/health` responden y que `/api/employees` rechaza solicitudes sin sesión. **La navegación manual por todas las pantallas y una presentación cronometrada todavía dependen del equipo.**
