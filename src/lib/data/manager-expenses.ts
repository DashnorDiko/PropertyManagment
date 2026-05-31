import { randomUUID } from "node:crypto";

import { Pool } from "pg";

import type { Currency } from "@/lib/domain/types";

export type ManagerExpense = {
  id: string;
  month: string;
  description: string;
  amount: number;
  currency: Currency;
};

export type CreateManagerExpenseInput = {
  month: string;
  description: string;
  amount: number;
  currency: Currency;
};

type ManagerExpenseRow = {
  id: string;
  expense_month: string;
  description: string;
  amount: string;
  currency: Currency;
};

declare global {
  var __managerExpensesPool: Pool | undefined;
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

  if (!global.__managerExpensesPool) {
    if (connectionString) {
      global.__managerExpensesPool = new Pool({ connectionString });
    } else {
      global.__managerExpensesPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__managerExpensesPool;
}

async function ensureManagerExpensesTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS manager_expenses (
      id TEXT PRIMARY KEY,
      expense_month TEXT NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
      currency TEXT NOT NULL CHECK (currency IN ('EUR', 'ALL')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function mapRow(row: ManagerExpenseRow): ManagerExpense {
  return {
    id: row.id,
    month: row.expense_month,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
  };
}

export async function listManagerExpenses(): Promise<ManagerExpense[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const pool = getPool();
  await ensureManagerExpensesTable(pool);

  const { rows } = await pool.query<ManagerExpenseRow>(
    `
      SELECT
        id,
        expense_month,
        description,
        amount,
        currency
      FROM manager_expenses
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapRow);
}

export async function createManagerExpense(
  input: CreateManagerExpenseInput,
): Promise<ManagerExpense> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const pool = getPool();
  await ensureManagerExpensesTable(pool);

  const id = `exp-${randomUUID().slice(0, 10)}`;
  const { rows } = await pool.query<ManagerExpenseRow>(
    `
      INSERT INTO manager_expenses (
        id,
        expense_month,
        description,
        amount,
        currency
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        expense_month,
        description,
        amount,
        currency
    `,
    [id, input.month, input.description, input.amount, input.currency],
  );

  if (!rows[0]) {
    throw new Error("Failed to create manager expense.");
  }

  return mapRow(rows[0]);
}
