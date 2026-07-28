<!-- markdownlint-disable MD024 -->

# Persona

Persona is a résumé builder. It uses a React frontend, a FastAPI backend, and a
PostgreSQL database with Docker Compose which is the default way to run it.

- [Persona](#persona)
  - [Features](#features)
  - [Main Technology](#main-technology)
  - [Project Layout](#project-layout)
  - [Run with Docker](#run-with-docker)
  - [Run without Docker](#run-without-docker)

## Features

- Account registration and login
- Multiple résumés per account
- Editing and reordering résumé sections
- Live preview and PDF download
- Résumé version history

## Main Technology

- React 19, TypeScript, Vite, and TanStack Query
- Python 3.12, FastAPI, SQLAlchemy, and Alembic
- PostgreSQL 17
- Jinja2 and WeasyPrint
- Docker Compose and Nginx

## Project Layout

```text
.github/workflows/    CI and security workflows
backend/              FastAPI application, migrations, and tests
docs/                 Architecture, security, and development notes
frontend/             React application and Nginx configuration
scripts/              Local setup and CI support scripts
compose.local.yml     Docker Compose configuration for local development
compose.yml           Main Docker Compose configuration
```

## Run with Docker

Requirements:

- Docker with the Compose plugin
- Python 3

Generate the local secrets and start the application:

```sh
./scripts/init-secrets.sh
docker compose up -d --build --wait
```

Open <http://localhost:8080>. Database migrations run automatically when the
API starts.

To stop the application:

```sh
docker compose down
```

PostgreSQL data remains in the `persona-db` Docker volume.

## Run without Docker

Some nested or restricted Linux environments cannot create Docker bridge
networks. In that case, start PostgreSQL with host networking:

```sh
sudo ./scripts/start-local-db.sh
```

Then start the API and frontend in separate terminals.

Backend:

```sh
cd backend
DATABASE_URL=postgresql+psycopg://persona:persona@127.0.0.1:5432/persona \
COOKIE_SECURE=false \
ALLOWED_ORIGINS='["http://127.0.0.1:5173"]' \
uv run uvicorn app.main:app --reload
```

Frontend:

```sh
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open <http://127.0.0.1:5173>. Vite forwards `/api` and `/health` requests to
the local API.
