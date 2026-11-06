# Aurea Talento — sistema de RR. HH.

Aplicación Angular y NestJS con SQLite o MySQL. Esta copia separada conserva los sprints 1–7 e incorpora condiciones de pago y cálculo masivo por período. La copia `aurea-talento-rrhh-sprint7` permanece disponible sin cambios. El tablero de Sprint Planning es otro proyecto.

## Instalación de desarrollo

Requiere Node.js 24 y npm. La API no lee automáticamente archivos `.env`; define las variables en el entorno del proceso. En PowerShell:

```powershell
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint8\api"
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
cd "C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint8\web"
npm ci
npm start
```

Abre `http://localhost:4201`. La API escucha en `http://127.0.0.1:3001/api`. Después de iniciar sesión, configura los cinco catálogos en **Configuración**, revisa el formato de códigos y crea los empleados. La cuenta de Nómina se obtiene asignando ese rol a un empleado desde Configuración.

### Recorrido de los sprints 4–6

1. **Reclutamiento:** RR. HH. crea y edita vacantes con responsable, nivel, ubicación en Guatemala, fecha límite y número de plazas. Puede agregar preguntas cortas, de sí/no o de opción múltiple. El responsable aprueba, RR. HH. aprueba y, para una plaza nueva, el administrador registra la ratificación adicional. RR. HH. publica la vacante. La página pública está en `http://localhost:4201/empleos` y cada vacante tiene un enlace `?id=...`. El candidato busca vacantes y envía el formulario y su CV. RR. HH. consulta las candidaturas y sus documentos, y registra etapas iniciales o descarte.
2. **Ausencias:** RR. HH. crea tipos, asigna saldos en horas y publica avisos. El empleado solicita un rango de fechas y horas; RR. HH. también puede hacerlo en su nombre. Su gerente o RR. HH. aprueba o rechaza. La aprobación descuenta el saldo en una transacción. Las solicitudes aprobadas se muestran como próximas ausencias. La carga de horas es manual porque todavía no hay calendario de festivos ni jornadas variables.
3. **Expediente integral:** RR. HH. registra beneficios, asigna capacitaciones, sube documentos, crea un paquete de bienvenida y asigna tareas de incorporación. Una biblioteca corporativa permite cargar y buscar archivos con visibilidad para todo el personal, gerentes o RR. HH. El empleado ve su información permitida, puede subir documentos propios, confirmar lectura del paquete y completar capacitaciones y tareas asignadas. Los documentos restringidos se verifican en el servidor.

Los archivos se almacenan en `api/data/uploads` por defecto. Usa `UPLOAD_DIR` para indicar un directorio persistente fuera del repositorio. Se aceptan PDF, DOC y DOCX de hasta 5 MB. **Todavía no existe escaneo antivirus; no abras la página pública a candidatos reales hasta agregarlo y revisar la retención de datos.**

### Sprint 7 · Selección avanzada

1. RR. HH. abre una postulación y entra a **Selección avanzada**. Puede avanzar por las etapas, agendar entrevistas, registrar verificaciones y comunicaciones, y preparar versiones de oferta. También puede reutilizar preguntas de vacantes anteriores. El responsable de contratación registra su recomendación después de la entrevista del área. Los entrevistadores asignados ven sus entrevistas y pueden consultar el CV y las respuestas del formulario, y enviar una evaluación con la rúbrica correspondiente. Calificaciones de 1 o 2, o una recomendación de no contratar, exigen comentario.
2. `ADMIN` asigna los roles **Legal**, **Cumplimiento** y **Socio** desde Configuración. Cumplimiento registra la declaración y el resultado de independencia después de la entrevista del área. El detalle de la declaración no se muestra al responsable de contratación. Sin revisión favorable no se puede crear la oferta.
3. La **plantilla de carta de oferta** incorpora nombre, puesto, nivel, fecha de ingreso, jefe directo, salario base mensual en GTQ, bonificación incentivo, bono variable, tipo de contrato, beneficios, período de prueba y vencimiento. RR. HH. puede editarla; cada edición anula sus aprobaciones. La primera versión se genera al aprobarla por separado una cuenta de RR. HH. y una de Legal. La plantilla no se presenta como aprobada antes de registrar esas decisiones.
4. Cada oferta conserva su carta y versión. El sistema exige aprobación del responsable y de RR. HH.; para Senior o Supervisor exige además un socio, y para Gerente dos socios distintos. RR. HH. registra el envío externo y la respuesta con evidencia. La fecha de vencimiento predeterminada son cinco días hábiles. El historial guarda cada cambio. El registro de comunicación es manual y no envía correos.
5. RR. HH. puede consultar el banco de talento desde Reclutamiento. Solo aparecen candidaturas con autorización para futuras vacantes.

**Pendiente para completar todas las historias del sprint 7:** invitaciones y recordatorios automáticos, conexión del buzón institucional, firma electrónica, archivo escaneado como adjunto y PDF de la oferta, revisión del rango salarial interno, reglas completas por tipo de verificación, retención/eliminación automática y solicitudes de eliminación, inserción de vacantes en el sitio institucional, integraciones con portales, cierre automático de plazas, transferencia completa a EP-05 y tratamiento automatizado de candidaturas restantes. No utilices datos de candidatos reales mientras estos controles estén incompletos y la revisión legal siga pendiente.

### Cálculo de pagos por período en esta copia

1. Desde **Nómina**, crea el período. En **Cálculo de nómina**, Nómina registra para cada persona un salario mensual, una tarifa por hora o una tarifa de servicios profesionales por hora. Cada condición tiene fecha inicial y final; para cambiarla se cierra la vigencia anterior y se crea otra. El sistema impide solapamientos y conserva las anteriores.
2. Los empleados con pago por hora o servicios profesionales registran su hoja de tiempo; su gerente o Nómina la aprueba. RR. HH. crea los tipos de ausencia. Administración total puede establecer si cada tipo es **Pagada** o **No pagada**. Nómina registra bonos, ajustes positivos, deducciones e impuestos capturados externamente, con motivo.
3. Nómina genera todos los borradores. Se calculan las personas activas con condición vigente que cubra todos los días del período. Si falta una condición o una hoja aprobada en un esquema por horas, la generación se detiene; no publica importes parciales. La vista previa desglosa horas, ausencias, base, bonos, ajustes, deducciones, bruto y neto.
4. Nómina envía el conjunto a revisión. Una cuenta `ADMIN` distinta a la preparadora lo aprueba o lo devuelve. Tras la aprobación, Nómina publica todas las boletas de empleados en una transacción. Los honorarios profesionales quedan en el historial separado; no se convierten en boletas salariales. El período pasa a **Procesado**.
5. El historial conserva las condiciones, ajustes, vista previa de cada período, actor y fecha de las decisiones, y las boletas publicadas. Cada empleado consulta sus propias boletas en **Mis pagos**.

**Regla de cálculo utilizada:** el salario mensual se distribuye por día calendario según los días de cada mes incluido en el período. Un día de ausencia no pagada descuenta la proporción de horas de la jornada diaria; una ausencia pagada no la descuenta. Para la tarifa por hora se multiplican las horas aprobadas y las horas de ausencia pagada por la tarifa vigente de cada día. Para servicios profesionales se multiplican únicamente las horas aprobadas por su tarifa. Bonos y ajustes positivos aumentan el bruto; impuestos y deducciones capturados lo reducen. Las ausencias de varios días reparten sus horas uniformemente entre los días del rango.

**Límites:** no hay cálculo legal automático de IGSS, ISR, prestaciones, horas extra ni facturación de servicios profesionales. La captura manual de boletas en períodos sin cálculo masivo sigue disponible y permite publicación directa. Antes de usar datos reales, valida las reglas laborales y tributarias, establece una política única de publicación, y prueba MySQL en el entorno objetivo.

## Base de datos y migración

SQLite es el modo local predeterminado. Para MySQL 8.4, `compose.yaml` prepara un contenedor con volumen persistente. Define `MYSQL_PASSWORD` y `MYSQL_ROOT_PASSWORD` antes de `docker compose up -d`; después configura `DB_DRIVER=mysql`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_DATABASE` para la API. Véase `api/.env.example`. **El modo MySQL requiere una prueba de integración con un servidor MySQL disponible antes de usarlo con datos reales.**

`api/src/database.ts` contiene migraciones versionadas. Las versiones 1–5 conservan las funciones anteriores. La versión 6 añade tratamiento de pago de ausencias, condiciones con vigencia, ajustes, cálculos y detalles históricos. Las instalaciones anteriores se migran al arrancar sin borrar datos. Haz una copia de la base antes de actualizar.

`api/data/` está excluido de la entrega mediante `.gitignore`. **No copies una base SQLite antigua con usuarios de demostración a una instalación nueva.** Para producción, usa una base vacía y ejecuta `bootstrap:admin` una sola vez. Los datos existentes no se eliminan automáticamente para evitar pérdida accidental.

## Puesta en servicio

1. Prepara el servidor, la base de datos vacía y copias de seguridad verificadas. No expongas el puerto de MySQL a Internet.
2. Configura `NODE_ENV=production`, una `APP_SECRET` aleatoria y estable de al menos 32 caracteres, `WEB_ORIGIN` exacto y las variables de base de datos. La API no arranca en producción sin las dos primeras variables requeridas.
3. Ejecuta `npm ci` y `npm run bootstrap:admin` en la API, con acceso restringido a la consola. Retira las variables `BOOTSTRAP_*` del entorno después.
4. Compila con `npm run build` en `api` y `web`, y ejecuta `npm start` desde `api` bajo un supervisor de procesos. Publica Angular y coloca NestJS detrás de un proxy HTTPS que sirva `/api` en el mismo origen. En desarrollo, Angular llama a `127.0.0.1:3001`; en otro host usa `/api` del origen actual.
5. Entra como administrador, cambia la contraseña inicial, configura los catálogos y los códigos, y luego crea las demás cuentas. Comprueba permisos y respaldos con datos no sensibles antes de cargar expedientes reales.

## Seguridad y alcance

Las contraseñas se guardan con `scrypt`; las sesiones firmadas expiran a las ocho horas. Cambiar la contraseña revoca las sesiones anteriores. `ADMIN` puede delegar el permiso **MODIFICACIÓN Catálogos del sistema** sin ceder el rol de administrador. Los formularios cargan opciones del backend y este valida que pertenezcan a la categoría y estén activas. El código de empleado se reserva en una transacción y tiene restricción única. El cálculo nuevo usa condiciones y horas aprobadas, y exige aprobación antes de publicación; **no calcula impuestos legalmente ni ejecuta pagos bancarios**.

Las reglas de festivos y horarios variables, correos automáticos, firma del paquete de bienvenida, firma electrónica de ofertas, cálculo tributario y de prestaciones, antivirus, conservación y eliminación automatizada de candidaturas y auditoría exhaustiva de accesos quedan pendientes. La ratificación de una plaza nueva en el flujo antiguo aún usa `ADMIN`; el flujo nuevo de ofertas distingue al socio. Antes de atender clientes reales también se requiere revisar seguridad de despliegue, recuperación de cuentas, gestión de secretos, respaldo y restauración, retención de datos personales y cumplimiento legal. El cambio de esquema se probó con SQLite; la ruta MySQL debe validarse en el entorno objetivo.

## Comprobación

```powershell
cd api
npm test
cd ..\web
npm test -- --watch=false
npm run build
```
