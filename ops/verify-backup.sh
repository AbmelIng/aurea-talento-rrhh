#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 1 || ! -d "$1" ]]; then
  echo 'Uso: ops/verify-backup.sh /ruta/al/respaldo' >&2
  exit 2
fi
backup="$(cd "$1" && pwd -P)"
(
  cd "$backup"
  sha256sum --check SHA256SUMS
  gzip -t database.sql.gz uploads.tar.gz
)

scratch="$(mktemp -d)"
suffix="$(date -u +%s)-$$"
container="aurea-restore-check-$suffix"
volume="aurea-restore-check-$suffix"
cleanup() {
  docker rm -f "$container" >/dev/null 2>&1 || true
  docker volume rm "$volume" >/dev/null 2>&1 || true
  rm -rf -- "$scratch"
}
trap cleanup EXIT

mkdir "$scratch/uploads"
tar -xzf "$backup/uploads.tar.gz" -C "$scratch/uploads"
upload_count="$(find "$scratch/uploads" -type f | wc -l)"

docker volume create "$volume" >/dev/null
password="$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')"
docker run --detach --name "$container" --network none \
  --volume "$volume:/var/lib/mysql" \
  --env "MYSQL_ROOT_PASSWORD=$password" --env MYSQL_DATABASE=aurea_talento \
  mysql:8.4 >/dev/null
unset password

ready=0
for _ in $(seq 1 90); do
  if docker exec "$container" sh -ec '
    export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
    mysqladmin --user=root ping --silent
  ' >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if [[ "$ready" != 1 ]]; then
  echo 'MySQL aislado no inició a tiempo.' >&2
  exit 1
fi

gzip -dc "$backup/database.sql.gz" | docker exec -i "$container" sh -ec '
  export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
  exec mysql --user=root --database=aurea_talento
'

stats="$(docker exec "$container" sh -ec '
  export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
  exec mysql --user=root --database=aurea_talento --batch --skip-column-names \
    -e "SELECT (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''aurea_talento'\'' AND table_type = '\''BASE TABLE'\''), (SELECT COUNT(*) FROM schema_migrations), (SELECT COUNT(*) FROM users), (SELECT COUNT(*) FROM employees)"
')"
read -r table_count migration_count user_count employee_count <<< "$stats"
if (( table_count < 1 || migration_count < 7 )); then
  echo "Restauración incompleta: $stats" >&2
  exit 1
fi
echo "Restauración aislada correcta: $table_count tablas, $migration_count migraciones, $user_count usuarios, $employee_count empleados y $upload_count documentos."
