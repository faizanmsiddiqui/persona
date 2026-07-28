#!/bin/sh
set -eu

container_name=persona-db-local

if docker container inspect "$container_name" >/dev/null 2>&1; then
  docker start "$container_name" >/dev/null
else
  docker run -d \
    --name "$container_name" \
    --network host \
    -e POSTGRES_DB=persona \
    -e POSTGRES_USER=persona \
    -e POSTGRES_PASSWORD=persona \
    postgres:17.5-alpine3.21 >/dev/null
fi

until docker exec "$container_name" pg_isready -U persona >/dev/null 2>&1; do
  sleep 1
done

echo "PostgreSQL is ready on 127.0.0.1:5432"
