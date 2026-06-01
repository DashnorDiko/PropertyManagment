import { Pool } from "pg";
import { randomUUID } from "node:crypto";

export type PropertyListItem = {
  id: string;
  unitName: string;
  locationSubtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenantName: string;
  rentAmount?: number;
  rentCurrency: "EUR" | "ALL";
  createdAt: string;
};

export type CreatePropertyInput = {
  unitName: string;
  locationSubtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenantName: string;
  rentAmount: number;
  rentCurrency: "EUR" | "ALL";
};

type PropertyRow = {
  id: string;
  unit_name: string;
  location_subtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenant_name: string | null;
  rent_amount: string;
  rent_currency: "EUR" | "ALL";
  created_at: string;
};

declare global {
  var __propertiesPool: Pool | undefined;
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

  if (!global.__propertiesPool) {
    if (connectionString) {
      global.__propertiesPool = new Pool({ connectionString });
    } else {
      global.__propertiesPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__propertiesPool;
}

async function ensurePropertiesTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      unit_name TEXT NOT NULL,
      location_subtitle TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('vacant', 'occupied', 'sold')),
      tenant_name TEXT,
      rent_amount NUMERIC(12, 2) NOT NULL CHECK (rent_amount >= 0),
      rent_currency TEXT NOT NULL CHECK (rent_currency IN ('EUR', 'ALL')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function mapRowToListItem(row: PropertyRow): PropertyListItem {
  return {
    id: row.id,
    unitName: row.unit_name,
    locationSubtitle: row.location_subtitle,
    status: row.status,
    tenantName: row.tenant_name ?? "",
    rentAmount: Number(row.rent_amount),
    rentCurrency: row.rent_currency,
    createdAt: row.created_at,
  };
}

export async function listProperties(): Promise<PropertyListItem[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const pool = getPool();
  await ensurePropertiesTable(pool);

  const { rows } = await pool.query<PropertyRow>(
    `
      SELECT
        id,
        unit_name,
        location_subtitle,
        status,
        tenant_name,
        rent_amount,
        rent_currency,
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM properties
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapRowToListItem);
}

export async function createProperty(
  input: CreatePropertyInput,
): Promise<PropertyListItem> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const pool = getPool();
  await ensurePropertiesTable(pool);

  const id = `p-${randomUUID().slice(0, 8)}`;
  const { rows } = await pool.query<PropertyRow>(
    `
      INSERT INTO properties (
        id,
        unit_name,
        location_subtitle,
        status,
        tenant_name,
        rent_amount,
        rent_currency
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        unit_name,
        location_subtitle,
        status,
        tenant_name,
        rent_amount,
        rent_currency,
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
    `,
    [
      id,
      input.unitName,
      input.locationSubtitle,
      input.status,
      input.tenantName || null,
      input.rentAmount,
      input.rentCurrency,
    ],
  );

  if (!rows[0]) {
    throw new Error("Failed to create property.");
  }

  return mapRowToListItem(rows[0]);
}

export async function deleteProperty(id: string): Promise<boolean> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const propertyId = id.trim();
  if (!propertyId) {
    return false;
  }

  const pool = getPool();
  await ensurePropertiesTable(pool);

  const { rowCount } = await pool.query(
    `
      DELETE FROM properties
      WHERE id = $1
    `,
    [propertyId],
  );

  return (rowCount ?? 0) > 0;
}
