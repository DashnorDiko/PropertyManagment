import { randomUUID } from "node:crypto";

import { Pool } from "pg";

import type { ChargeType, Currency, Payment, PaymentMethod } from "@/lib/domain/types";

export type CreatePaymentLogInput = {
  date: string;
  method: PaymentMethod;
  amount: number;
  currency: Currency;
  tenantId?: string;
  propertyId?: string;
  chargeType?: ChargeType;
  coveredMonth?: string;
};

type PaymentLogRow = {
  id: string;
  payment_date: string;
  method: PaymentMethod;
  amount: string;
  currency: Currency;
  tenant_id: string | null;
  property_id: string | null;
  charge_type: ChargeType | null;
  covered_month: string | null;
  created_at: string;
};

declare global {
  var __paymentLogsPool: Pool | undefined;
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

  if (!global.__paymentLogsPool) {
    if (connectionString) {
      global.__paymentLogsPool = new Pool({ connectionString });
    } else {
      global.__paymentLogsPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__paymentLogsPool;
}

async function ensurePaymentLogsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_logs (
      id TEXT PRIMARY KEY,
      payment_date DATE NOT NULL,
      method TEXT NOT NULL CHECK (method IN ('cash', 'bank')),
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
      tenant_id TEXT,
      property_id TEXT,
      charge_type TEXT CHECK (charge_type IN ('rent', 'administration', 'parking', 'internet')),
      covered_month TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function mapRow(row: PaymentLogRow): Payment {
  return {
    id: row.id,
    date: row.payment_date,
    method: row.method,
    amount: Number(row.amount),
    currency: row.currency,
    tenantId: row.tenant_id ?? undefined,
    propertyId: row.property_id ?? undefined,
    chargeType: row.charge_type ?? undefined,
    coveredMonth: row.covered_month ?? undefined,
  };
}

export async function listPaymentLogs(): Promise<Payment[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const pool = getPool();
  await ensurePaymentLogsTable(pool);

  const { rows } = await pool.query<PaymentLogRow>(
    `
      SELECT
        id,
        to_char(payment_date, 'YYYY-MM-DD') AS payment_date,
        method,
        amount,
        currency,
        tenant_id,
        property_id,
        charge_type,
        covered_month,
        created_at
      FROM payment_logs
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapRow);
}

export async function createPaymentLogs(inputs: CreatePaymentLogInput[]): Promise<Payment[]> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  if (inputs.length === 0) {
    return [];
  }

  const pool = getPool();
  await ensurePaymentLogsTable(pool);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted: Payment[] = [];
    for (const input of inputs) {
      const id = `log-${randomUUID().slice(0, 12)}`;
      const { rows } = await client.query<PaymentLogRow>(
        `
          INSERT INTO payment_logs (
            id,
            payment_date,
            method,
            amount,
            currency,
            tenant_id,
            property_id,
            charge_type,
            covered_month
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING
            id,
            to_char(payment_date, 'YYYY-MM-DD') AS payment_date,
            method,
            amount,
            currency,
            tenant_id,
            property_id,
            charge_type,
            covered_month,
            created_at
        `,
        [
          id,
          input.date,
          input.method,
          input.amount,
          input.currency,
          input.tenantId ?? null,
          input.propertyId ?? null,
          input.chargeType ?? null,
          input.coveredMonth ?? null,
        ],
      );

      if (rows[0]) {
        inserted.push(mapRow(rows[0]));
      }
    }

    await client.query("COMMIT");
    return inserted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
