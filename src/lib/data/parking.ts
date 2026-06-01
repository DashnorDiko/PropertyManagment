import { randomUUID } from "node:crypto";

import { Pool } from "pg";

export type ParkingListItem = {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  propertyId?: string;
  assigneeName: string;
  parkingCardNumber: string;
  price: number;
  createdAt: string;
};

export type CreateParkingInput = {
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  propertyId?: string;
  assigneeName: string;
  parkingCardNumber: string;
  price: number;
};

type ParkingRow = {
  id: string;
  spot_code: string;
  status: "free" | "occupied";
  assignee_type: "tenant" | "independent";
  property_id: string | null;
  assignee_name: string | null;
  parking_card_number: string | null;
  price: string;
  created_at: string;
};

declare global {
  var __parkingPool: Pool | undefined;
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

  if (!global.__parkingPool) {
    if (connectionString) {
      global.__parkingPool = new Pool({ connectionString });
    } else {
      global.__parkingPool = new Pool({
        host: process.env.PGHOST,
        port: Number(process.env.PGPORT ?? "5432"),
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
      });
    }
  }

  return global.__parkingPool;
}

async function ensureParkingTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS parking_spots (
      id TEXT PRIMARY KEY,
      spot_code TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('free', 'occupied')),
      assignee_type TEXT NOT NULL CHECK (assignee_type IN ('tenant', 'independent')),
      property_id TEXT,
      assignee_name TEXT,
      parking_card_number TEXT,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE parking_spots
    ADD COLUMN IF NOT EXISTS property_id TEXT
  `);
}

function mapRow(row: ParkingRow): ParkingListItem {
  return {
    id: row.id,
    spotCode: row.spot_code,
    status: row.status,
    assigneeType: row.assignee_type,
    propertyId: row.property_id ?? undefined,
    assigneeName: row.assignee_name ?? "",
    parkingCardNumber: row.parking_card_number ?? "",
    price: Number(row.price),
    createdAt: row.created_at,
  };
}

export async function listParkingSpots(): Promise<ParkingListItem[]> {
  if (!hasDatabaseConfig()) {
    return [];
  }

  const pool = getPool();
  await ensureParkingTable(pool);

  const { rows } = await pool.query<ParkingRow>(
    `
      SELECT
        id,
        spot_code,
        status,
        assignee_type,
        property_id,
        assignee_name,
        parking_card_number,
        price,
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM parking_spots
      ORDER BY created_at DESC
    `,
  );

  return rows.map(mapRow);
}

export async function createParkingSpot(
  input: CreateParkingInput,
): Promise<ParkingListItem> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const pool = getPool();
  await ensureParkingTable(pool);

  const id = `pk-${randomUUID().slice(0, 8)}`;
  const { rows } = await pool.query<ParkingRow>(
    `
      INSERT INTO parking_spots (
        id,
        spot_code,
        status,
        assignee_type,
        property_id,
        assignee_name,
        parking_card_number,
        price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        spot_code,
        status,
        assignee_type,
        property_id,
        assignee_name,
        parking_card_number,
        price,
        to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
    `,
    [
      id,
      input.spotCode,
      input.status,
      input.assigneeType,
      input.propertyId ?? null,
      input.assigneeName || null,
      input.parkingCardNumber || null,
      input.price,
    ],
  );

  if (!rows[0]) {
    throw new Error("Failed to create parking spot.");
  }

  return mapRow(rows[0]);
}

export async function deleteParkingSpot(id: string): Promise<boolean> {
  if (!hasDatabaseConfig()) {
    throw new Error(
      "No database configuration found. Set DATABASE_URL or PGHOST/PGDATABASE/PGUSER/PGPASSWORD.",
    );
  }

  const parkingId = id.trim();
  if (!parkingId) {
    return false;
  }

  const pool = getPool();
  await ensureParkingTable(pool);

  const { rowCount } = await pool.query(
    `
      DELETE FROM parking_spots
      WHERE id = $1
    `,
    [parkingId],
  );

  return (rowCount ?? 0) > 0;
}
