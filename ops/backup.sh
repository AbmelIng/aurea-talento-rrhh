#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

cd "$(dirname "$0")/.."
backup_root="${AUREA_BACKUP_DIR:-/var/backups/aurea-talento}"
mkdir -p -- "$backup_root"
chmod 700 -- "$backup_root"
backup_root="$(cd "$backup_root" && pwd -P)"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
partial="$(mktemp -d "$backup_root/.partial-${stamp}-XXXXXX")"
trap 'rm -rf -- "$partial"' EXIT

docker compose exec -T mysql sh -ec '
  export MYSQL_PWD="$MYSQL_PASSWORD"
  exec mysqldump --user="$MYSQL_USER" --single-transaction --quick \
    --routines --triggers --no-tablespaces --set-gtid-purged=OFF "$MYSQL_DATABASE"
' | gzip -n > "$partial/database.sql.gz"

docker compose exec -T api tar -C /app/data/uploads -cf - . \
  | gzip -n > "$partial/uploads.tar.gz"

gzip -t "$partial/database.sql.gz" "$partial/uploads.tar.gz"
(
  cd "$partial"
  sha256sum database.sql.gz uploads.tar.gz > SHA256SUMS
  printf 'Fecha UTC: %s\nCódigo: %s\n' "$stamp" "$(git rev-parse --short HEAD 2>/dev/null || printf desconocido)" > INFO.txt
)

destination="$backup_root/$stamp"
if [[ -e "$destination" ]]; then
  echo "Ya existe un respaldo con esta fecha: $destination" >&2
  exit 1
fi
mv -- "$partial" "$destination"
trap - EXIT
echo "Respaldo creado: $destination"
