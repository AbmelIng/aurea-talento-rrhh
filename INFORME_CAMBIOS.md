# Informe de cambios — Aurea Talento

## Copia entregada

Esta versión está en `C:\Users\isaga\Documents\Codex\2026-10-16\n\aurea-talento-rrhh-sprint3`. La copia anterior del MVP no fue reemplazada. Se mantuvieron los módulos de perfiles, roles, historial laboral y las funciones manuales de horas y nómina del sprint 3.

## Archivos modificados

- `api/src/database.ts`: esquema, migración versionada de catálogos, claves de catálogo, configuración de códigos y transacciones.
- `api/src/main.ts`: rutas de administración, cambio de contraseña y validación del entorno de producción.
- `api/src/auth.ts`: revocación de sesiones al cambiar contraseña.
- `api/src/people.service.ts`: validación de catálogos, código generado en el servidor, historial y permiso de catálogos.
- `api/package.json` y `api/.env.example`: comando de inicialización y variables requeridas.
- `api/tests/integration.test.mjs`: prueba del recorrido con base vacía, permisos, catálogos, códigos, historial, nómina y sesiones.
- `web/src/app/api.service.ts`, `app.ts`, `app.html`, `app.css`, `app.spec.ts` y `web/src/index.html`: formularios con catálogos, configuración, acceso inicial y textos.
- `README.md`: instalación, migración, producción y límites.

## Archivos creados

- `api/src/settings.service.ts`: lógica de catálogos y configuración de códigos.
- `api/src/bootstrap-admin.ts`: inicialización única del administrador.
- `INFORME_CAMBIOS.md`: este informe.

## Funciones agregadas o modificadas

- Los cinco campos laborales usan opciones dinámicas por identificador. El backend comprueba categoría y estado activo. Se pueden crear, renombrar, activar y desactivar opciones. Los registros relacionados no se eliminan físicamente.
- El administrador puede delegar el permiso `MODIFICACIÓN Catálogos del sistema` sin delegar su propio nivel. El formato de códigos queda bajo control del administrador.
- El alta genera un código visible independiente del ID interno. La reserva, el incremento, el expediente, la cuenta y la primera entrada de historial se guardan en una transacción; una restricción única protege contra duplicados.
- La instalación nueva no carga usuarios, empleados, contraseñas ni recibos ficticios. La inicialización crea una sola cuenta administrativa real con contraseña aleatoria, en una base vacía.
- El acceso rápido de demostración fue retirado. Cambiar la contraseña revoca sesiones previas.
- Las opciones laborales inactivas se muestran deshabilitadas en formularios existentes y el servidor impide seleccionarlas.

## Verificación ejecutada

| Comando | Resultado |
| --- | --- |
| `cd api; npm test` | Pasó: 1 prueba de integración, 0 fallos. Incluye compilación TypeScript. |
| `cd web; npm test -- --watch=false` | Pasó: 2 pruebas, 0 fallos. |
| `cd web; npm run build` | Pasó: compilación de Angular. |
| Revisión de `api/data/` | No existe una base SQLite precargada en esta copia; el directorio está excluido por `.gitignore`. |

## Pendiente antes de uso con datos reales

- Ejecutar la misma integración sobre MySQL 8.4; no había servidor MySQL ni Docker disponibles durante esta revisión.
- Validar el despliegue HTTPS, proxy, copias de seguridad y restauración, límites de peticiones, recuperación de acceso, auditoría completa y política de datos personales en el entorno final.
- Esta copia no fue publicada en Vercel ni en un servidor. Vercel por sí solo sirve el frontend; la API y la base de datos necesitan alojamiento propio.
- El módulo de nómina registra importes manuales; no calcula impuestos ni transfiere pagos.

Las instrucciones de ejecución están en `README.md`.
