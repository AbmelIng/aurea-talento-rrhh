# Aurea Talento — MVP local de RR. HH.

Aplicación universitaria para una firma ficticia de auditoría en Guatemala. Este proyecto es **distinto** del tablero de Sprint Planning. Implementa un recorrido de los sprints 1 y 2: acceso, «Mi información», lista de Personas, alta y edición de empleados, solicitudes de corrección y asignación de niveles.

## Ejecutar en Windows

Requiere Node.js 24 y npm. Abre **dos terminales PowerShell**:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh\api"
npm install
npm run dev
```

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh\web"
npm install
npm start
```

Abre **http://localhost:4200**. La API escucha solo en **http://127.0.0.1:3000/api**. La primera ejecución crea `api/data/aurea-talento.sqlite` con empleados ficticios. Ese archivo no se incluye en Git.

| Rol | Correo de demostración |
| --- | --- |
| Empleado | `ana@demo.local` |
| Gerente | `carlos@demo.local` |
| RR. HH. | `maria@demo.local` |
| Administrador total | `valeria@demo.local` |

Clave inicial de todas las cuentas ficticias: `Demo2026!`. No usar estas credenciales ni estos datos en un entorno real. La clave temporal de un empleado nuevo aparece una sola vez después del alta.

## Qué se puede demostrar

1. Entrar como empleado, consultar el propio expediente, editar contacto y solicitar una corrección de identidad.
2. Entrar como gerente, ver solo los perfiles de sus colaboradores directos.
3. Entrar como RR. HH., crear un empleado, editar datos y condiciones laborales, revisar su historial y resolver solicitudes.
4. Entrar como administrador total, consultar la cuenta, cambiar niveles de acceso y revisar la bitácora.
5. Confirmar que un empleado no puede abrir Personas ni otro expediente y que un gerente no puede abrir perfiles ajenos a su equipo.

## Base de datos

El modo local usa SQLite incluido en Node.js 24 para poder iniciar sin Docker. La misma API dispone de un modo MySQL mediante `DB_DRIVER=mysql`; `compose.yaml` define un MySQL local opcional. Define las variables indicadas en `api/.env.example` **en el entorno del proceso** antes de iniciar la API. El archivo `.env.example` es una guía; la API no lo carga automáticamente.

La contraseña se guarda con `scrypt`; las sesiones expiran a las 8 horas. En ausencia de `APP_SECRET`, cada arranque genera una clave nueva y cierra las sesiones anteriores. Para usar MySQL, define una clave estable en el entorno. La API usa consultas parametrizadas y comprueba los permisos en cada petición. El modo local es una demostración, no un despliegue de producción.

Nómina, ausencias, contratación, reportes y evaluaciones quedan fuera de este corte de dos sprints.
