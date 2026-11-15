# Respaldos y recuperación

## Qué se protege

En Docker Compose, `mysql_data` contiene la base de datos y `uploads_data` los documentos. El respaldo incluye un volcado consistente de MySQL y un archivo de los documentos. Los archivos se guardan con permisos restringidos en `/var/backups/aurea-talento` del Droplet. `SHA256SUMS` permite detectar cambios o corrupción de los archivos.

El respaldo de documentos se toma inmediatamente después del volcado SQL. Si la aplicación recibe escrituras durante esos segundos, un documento nuevo podría quedar en solo uno de los dos archivos. Para una recuperación estrictamente consistente, detén las escrituras de la aplicación durante la copia o programa una ventana de mantenimiento. No guardes el archivo `.env` dentro del respaldo: conserva sus secretos en un gestor seguro separado.

## Crear y verificar una copia en el Droplet

Conéctate por SSH y ejecuta desde el repositorio:

```bash
cd /opt/aurea-talento
bash ops/backup.sh
bash ops/verify-backup.sh /var/backups/aurea-talento/FECHA_QUE_MOSTRÓ_EL_COMANDO
```

La verificación comprueba hashes, descomprime los documentos en una carpeta temporal y restaura el SQL en **otro contenedor MySQL 8.4**, con volumen y red propios. Cuenta las tablas, migraciones, usuarios y empleados restaurados. El contenedor, volumen y carpeta temporales se eliminan al terminar. No modifica `mysql_data` ni `uploads_data` de la aplicación activa.

La copia local al Droplet **no protege contra la pérdida completa del servidor**. Después de verificarla, transfiera la carpeta del respaldo a almacenamiento cifrado fuera del Droplet, con acceso restringido. Por ejemplo, desde PowerShell en un equipo autorizado:

```powershell
scp -i "$env:USERPROFILE\.ssh\aurea-talento-do" -r root@162.243.93.171:/var/backups/aurea-talento/FECHA_QUE_MOSTRÓ_EL_COMANDO "RUTA_DE_CARPETA_CIFRADA"
```

No copies respaldos a GitHub ni a carpetas públicas. La transferencia externa y su retención dependen del destino de almacenamiento que el equipo elija. Repite la verificación después de transferir una copia y conserva al menos una copia anterior a cada actualización importante.

## Restaurar en una instalación nueva y vacía

1. Instala Docker y clona el mismo commit o una versión compatible. Coloca el respaldo y un `.env` nuevo con las credenciales de MySQL originales o nuevas, además del `APP_SECRET` estable original si deseas conservar sesiones. Restringe el acceso a estos archivos.
2. Comprueba la integridad: entra en la carpeta del respaldo y ejecuta `sha256sum --check SHA256SUMS` y `gzip -t database.sql.gz uploads.tar.gz`.
3. En la raíz del repositorio, inicia **solo** MySQL con `docker compose up -d --wait mysql`. Confirma que `aurea_talento` está vacía. Nunca ejecutes los comandos siguientes contra una instalación con datos; podrían sobrescribirlos.
4. Importa el SQL:

```bash
gzip -dc /RUTA/RESPALDO/database.sql.gz | docker compose exec -T mysql sh -ec '
  export MYSQL_PWD="$MYSQL_PASSWORD"
  exec mysql --user="$MYSQL_USER" "$MYSQL_DATABASE"
'
```

5. Construye la imagen de la API y restaura los documentos en el volumen nuevo:

```bash
docker compose build api
gzip -dc /RUTA/RESPALDO/uploads.tar.gz | docker compose run --rm --no-deps -T --entrypoint tar api -C /app/data/uploads -xf -
docker compose -f compose.yaml -f compose.https.yaml up -d --wait
```

6. Comprueba `/api/health`, inicia sesión con una cuenta restaurada y verifica un expediente y sus documentos. Si cambió la dirección del servidor, actualiza `API_DOMAIN`, `WEB_ORIGIN` y `AUREA_API_ORIGIN` en Vercel y publica de nuevo el frontend.

Estas instrucciones de recuperación total se deben ejecutar en un **servidor nuevo**. El script `verify-backup.sh` es la prueba automatizada y segura de restauración aislada; no sustituye una simulación completa de pérdida del Droplet.

## Verificación realizada el 15 de noviembre de 2026

Se creó una copia de la instalación del Droplet y se restauró en un contenedor MySQL temporal. Resultado: **43 tablas, 7 migraciones, 1 usuario, 1 empleado y 0 documentos**. Los archivos pasaron `sha256sum --check` y `gzip -t`; el servidor activo conservó sus contenedores sanos. La restauración de documentos con contenido queda pendiente porque la instalación todavía no tenía archivos cargados.
