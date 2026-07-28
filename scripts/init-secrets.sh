#!/bin/sh
set -eu
mkdir -p secrets
umask 077
test -f secrets/db_password.txt || printf '%s' 'persona' >secrets/db_password.txt
test -f secrets/database_url.txt || printf '%s' 'postgresql+psycopg://persona:persona@db/persona' >secrets/database_url.txt
test -f secrets/jwt_secret.txt || python3 -c 'import secrets; print(secrets.token_urlsafe(48), end="")' >secrets/jwt_secret.txt

# Local Docker Compose implements file-backed secrets as bind mounts and cannot
# remap their ownership. Keep the synthetic files immutable while allowing the
# non-root container users to read them.
chmod 0444 \
  secrets/db_password.txt \
  secrets/database_url.txt \
  secrets/jwt_secret.txt
