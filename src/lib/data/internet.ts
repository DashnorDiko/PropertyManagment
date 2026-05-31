import { randomUUID } from "node:crypto";

import { Pool } from "pg";

export type InternetListItem = {
  id: string;
  serviceCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  modemSerialNumber: string;
  price: number;
};

export type CreateInternetInput = {
  serviceCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  modemSerialNumber: string;
  price: number;
};

type InternetRow = {
  id: string;
  service_code: string;
  status: "free" | "occupied";
  assignee_type: "tenant" | "independent";
  assignee_name: string | null;
  modem_serial_number: string | null;
  price: string;
};

declare global {
  var __internetPool: Pool | undefined;
}

function hasPostgresEnvConfig(): boolean {
  return Boolean(
    process.env.PGHOST &&
      process.env.PGDATABASE &&
      process.env.PGUSER &&
      process.env.PGPASSWORD,
  );
}

function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL) || hasPostgresEnvConfig();
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString && !hasPostgresEnvConfig()) {
    throw new Error(
      "Missing Postgres configuration. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  if (!global.__internetPool) {
    if (connectionString) {
      global.__internetPool = new Pool({ connectionString });
    } else {
      global.__internetPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__internetPool;
}

async function ensureInternetTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS internet_services (
      id TEXT PRIMARY KEY,
      service_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
      assignee_type TEXT NOT NULL CHECK (assignee_type IN ('tenant', 'independent')),
      assignee_name TEXT,
      modem_serial_number TEXT,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function mapRow(row: InternetRow): InternetListItem {
  return {
    id: row.id,
    serviceCode: row.service_code,
    status: row.status,
    assigneeType: row.assignee_type,
    assigneeName: row.assignee_name ?? "",
    modemSerialNumber: row.modem_serial_number ?? "",
    price: Number(row.price),
  };
}

export async function listInternetServices(): Promise<InternetListItem[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const pool = getPool();
  await ensureInternetTable(pool);

  const { rows } = await pool.query<InternetRow>(
    `
      SELECT
        id,
        service_code,
        status,
        assignee_type,
        assignee_name,
        modem_serial_number,
        price
      FROM internet_services
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapRow);
}

export async function createInternetService(
  input: CreateInternetInput,
): Promise<InternetListItem> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const pool = getPool();
  await ensureInternetTable(pool);

  const id = `net-${randomUUID().slice(0, 8)}`;
  const { rows } = await pool.query<InternetRow>(
    `
      INSERT INTO internet_services (
        id,
        service_code,
        status,
        assignee_type,
        assignee_name,
        modem_serial_number,
        price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        service_code,
        status,
        assignee_type,
        assignee_name,
        modem_serial_number,
        price
    `,
    [
      id,
      input.serviceCode,
      input.status,
      input.assigneeType,
      input.assigneeName || null,
      input.modemSerialNumber || null,
      input.price,
    ],
  );

  if (!rows[0]) {
    throw new Error("Failed to create internet service.");
  }

  return mapRow(rows[0]);
}
