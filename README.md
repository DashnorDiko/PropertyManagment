# Property Management App

Next.js 16 app for managing apartments, payments, parking, internet services, and report exports.

## Run locally (Node)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run with Docker (app + database)

This repo includes:

- `Dockerfile` for the Next.js app
- `docker-compose.yml` for app + Postgres
- `docker/postgres/init.sql` to create the `payments` table

### 1) Create Docker env file

Copy the example env:

```bash
cp .env.docker.example .env.docker
```

On Windows PowerShell:

```powershell
Copy-Item .env.docker.example .env.docker
```

Update `PM_POSTGRES_PASSWORD` in `.env.docker` before first run.

### 2) Build and start containers

```bash
docker compose --env-file .env.docker up --build
```

App: [http://localhost:3001](http://localhost:3001)  
Postgres: `localhost:5432`

You can change the app host port with `PM_APP_PORT` in `.env.docker`.

### 3) Stop containers

```bash
docker compose --env-file .env.docker down
```

To also remove database data volume:

```bash
docker compose --env-file .env.docker down -v
```

## Database configuration behavior

The report data source now supports two modes:

- `DATABASE_URL` or `PGHOST/PGDATABASE/PGUSER/PGPASSWORD` present -> reads from Postgres directly (used by Docker setup)
- otherwise -> uses Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL` and publishable/anon key)

If neither is configured, report endpoints return a configuration error.

## Manager login and timeout

- Login URL: `/login`
- Default credentials (if env vars are not set):
  - username: `manager`
  - password: `manager123`
- Session timeout default: `30` minutes

Configure these in `.env.docker` (or your runtime env):

- `PM_MANAGER_USERNAME`
- `PM_MANAGER_PASSWORD`
- `PM_SESSION_TIMEOUT_MINUTES`
