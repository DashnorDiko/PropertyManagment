import { isCurrency, type Currency } from "../domain/currency";
import { Pool } from "pg";
import { createSupabaseServerClient } from "../supabase/server";

export interface ReportPaymentRecord {
  id: string;
  dueDate: string;
  amount: number;
  currency: Currency;
  paidAt: string | null;
}

interface PaymentRow {
  id: string;
  due_date: string;
  amount: number | string;
  currency: string;
  paid_at: string | null;
}

declare global {
  // Reuse the same pool in dev/hot reload and across route invocations.
  var __reportsPool: Pool | undefined;
}

export interface FetchPaymentsInput {
  from: string;
  to: string;
}

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

function hasPostgresEnvConfig(): boolean {
  return Boolean(
    process.env.PGHOST &&
      process.env.PGDATABASE &&
      process.env.PGUSER &&
      process.env.PGPASSWORD,
  );
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString && !hasPostgresEnvConfig()) {
    throw new Error(
      "Missing Postgres configuration. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  if (!global.__reportsPool) {
    if (connectionString) {
      global.__reportsPool = new Pool({ connectionString });
    } else {
      global.__reportsPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__reportsPool;
}

async function fetchPaymentsFromPostgres({
  from,
  to,
}: FetchPaymentsInput): Promise<ReportPaymentRecord[]> {
  const pool = getPool();
  const { rows } = await pool.query<PaymentRow>(
    `
      SELECT id, due_date, amount, currency, paid_at
      FROM payments
      WHERE due_date >= $1
        AND due_date <= $2
      ORDER BY due_date ASC
    `,
    [from, to],
  );

  return rows
    .filter((row) => isCurrency(row.currency))
    .map((row) => ({
      id: row.id,
      dueDate: row.due_date,
      amount: Number(row.amount),
      currency: row.currency as Currency,
      paidAt: row.paid_at,
    }));
}

async function fetchPaymentsFromSupabase({
  from,
  to,
}: FetchPaymentsInput): Promise<ReportPaymentRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id,due_date,amount,currency,paid_at")
    .gte("due_date", from)
    .lte("due_date", to)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to load report payments: ${error.message}`);
  }

  const typedData = (data ?? []) as PaymentRow[];

  return typedData
    .filter((row) => isCurrency(row.currency))
    .map((row) => ({
      id: row.id,
      dueDate: row.due_date,
      amount: Number(row.amount),
      currency: row.currency as Currency,
      paidAt: row.paid_at,
    }));
}

export async function fetchPaymentsForRange({
  from,
  to,
}: FetchPaymentsInput): Promise<ReportPaymentRecord[]> {
  if (process.env.DATABASE_URL || hasPostgresEnvConfig()) {
    return fetchPaymentsFromPostgres({ from, to });
  }

  if (hasSupabaseConfig()) {
    return fetchPaymentsFromSupabase({ from, to });
  }

  throw new Error(
    "No database configuration found. Set DATABASE_URL for Postgres (recommended for Docker) or NEXT_PUBLIC_SUPABASE_URL with NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}
