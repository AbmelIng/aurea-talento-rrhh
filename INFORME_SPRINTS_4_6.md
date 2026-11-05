# Informe de integración: sprints 4, 5 y 6

## Alcance implementado

- **Sprint 4, reclutamiento inicial:** borradores y edición de vacantes, envío y aprobación interna, publicación y pausa/cierre/reapertura; preguntas personalizadas de respuesta corta, sí/no y opción múltiple; página pública en español con búsqueda y enlace directo, postulación con CV y consentimiento; detección de correo duplicado por vacante; registro manual de canales; lectura restringida de candidatos y CV; avance por etapas iniciales y descarte motivado.
- **Sprint 5, ausencias:** catálogo de tipos, saldos en horas, solicitudes propias o registradas por RR. HH. en nombre del empleado, rechazo/aprobación por gerente o RR. HH., descuento y reintegro transaccional del saldo, lista de próximas ausencias del equipo y avisos corporativos.
- **Sprint 6, expediente integral:** catálogo y asignación de beneficios; documentos por empleado con carga, búsqueda, visibilidad y descarga autorizada; biblioteca corporativa con audiencias; catálogo, asignación y finalización de capacitaciones; paquete de bienvenida con confirmación de lectura, tareas de incorporación y avance.
- Se conserva el acceso, empleados, catálogos, historial y nómina manual de los sprints anteriores. No se introducen usuarios de prueba.

## Archivos

- **Nuevos API:** `api/src/mvp-schema.ts`, `recruitment.service.ts`, `leave.service.ts`, `records.service.ts`, `mvp.controller.ts` y `api/tests/mvp.test.mjs`.
- **Nuevos web:** `web/src/app/careers.component.ts`, `recruitment.component.ts`, `leave.component.ts`, `records.component.ts` y `mvp.css`.
- **Modificados:** `api/src/database.ts`, `api/src/main.ts`, `api/.env.example`, `web/src/app/api.service.ts`, `web/src/app/app.ts`, `web/src/app/app.html` y `README.md`.

## Base de datos

La migración 2 agrega tablas para vacantes, canales, postulaciones, ausencias, beneficios, documentos, capacitaciones e incorporación. La migración 3 agrega preguntas y respuestas a las postulaciones. La migración 4 agrega avisos, paquetes de bienvenida y biblioteca corporativa. Las tablas nuevas tienen claves foráneas hacia empleados y usuarios. Los archivos se guardan fuera de la base de datos, bajo `UPLOAD_DIR` (por defecto `api/data/uploads`). Se probaron las migraciones en SQLite con una instalación vacía. MySQL conserva su esquema equivalente pero no se ejecutó una prueba contra un servidor MySQL.

## Verificación ejecutada

- `api/npm test`: **2 pruebas de integración aprobadas**. Incluyen instalación vacía, usuarios y permisos, nómina previa, aprobación de vacante, pregunta obligatoria, postulación de CV de más de 100 KB, duplicado, avisos, saldo y aprobación de ausencia, beneficios, capacitación, paquete de bienvenida, incorporación y descargas autorizadas.
- `web/npm test -- --watch=false`: **2 pruebas aprobadas**.
- `web/npm run build`: **compilación aprobada**.

## Pendiente antes de uso real

No existe antivirus para archivos ni control de abuso de la postulación pública. Tampoco se implementaron correos automáticos, conservación/eliminación de candidatos, auditoría completa de accesos, calendario de festivos, jornadas variables, paquete de bienvenida firmado, evaluaciones técnicas, independencia profesional, verificaciones, ofertas o firma electrónica. La ratificación adicional de vacantes nuevas usa provisionalmente `ADMIN`, pues aún no existe un rol separado de socio. Deben validarse MySQL, HTTPS y políticas legales antes de publicar el sistema para datos reales.
