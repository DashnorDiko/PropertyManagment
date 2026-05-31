import { Pool } from "pg";

import type { Currency, ManagerSettings } from "@/lib/domain/types";

type ManagerSettingsRow = {
  administration_fee: string;
  administration_currency: Currency;
};

declare global {
  var __managerSettingsPool: Pool | undefined;
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

  if (!global.__managerSettingsPool) {
    if (connectionString) {
      global.__managerSettingsPool = new Pool({ connectionString });
    } else {
      global.__managerSettingsPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__managerSettingsPool;
}

async function ensureManagerSettingsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS manager_settings (
      id TEXT PRIMARY KEY,
      administration_fee NUMERIC(12, 2) NOT NULL CHECK (administration_fee >= 0),
      administration_currency TEXT NOT NULL CHECK (administration_currency IN ('EUR', 'ALL'))
    )
  `);

  await pool.query(
    `
      INSERT INTO manager_settings (id, administration_fee, administration_currency)
      VALUES ('default', 0, 'ALL')
      ON CONFLICT (id) DO NOTHING
    `,
  );
}

export async function getManagerSettings(): Promise<ManagerSettings> {
  if (!hasDatabaseConfig()) {
    return {
      administrationFee: 0,
      administrationCurrency: "ALL",
    };
  }

  const pool = getPool();
  await ensureManagerSettingsTable(pool);

  const { rows } = await pool.query<ManagerSettingsRow>(
    `
      SELECT administration_fee, administration_currency
      FROM manager_settings
      WHERE id = 'default'
      LIMIT 1
    `,
  );

  const row = rows[0];
  if (!row) {
    return {
      administrationFee: 0,
      administrationCurrency: "ALL",
    };
  }

  return {
    administrationFee: Number(row.administration_fee),
    administrationCurrency: row.administration_currency,
  };
}

export async function updateManagerSettings(input: ManagerSettings): Promise<ManagerSettings> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const pool = getPool();
  await ensureManagerSettingsTable(pool);

  const { rows } = await pool.query<ManagerSettingsRow>(
    `
      UPDATE manager_settings
      SET administration_fee = $1,
          administration_currency = $2
      WHERE id = 'default'
      RETURNING administration_fee, administration_currency
    `,
    [input.administrationFee, input.administrationCurrency],
  );

  const row = rows[0];
  if (!row) {
    throw new Error("Failed to update manager settings.");
  }

  return {
    administrationFee: Number(row.administration_fee),
    administrationCurrency: row.administration_currency,
  };
}
