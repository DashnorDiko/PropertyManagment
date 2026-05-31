import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import {
  createManagerExpense,
  listManagerExpenses,
} from "@/lib/data/manager-expenses";
import type { Currency } from "@/lib/domain/types";

export const runtime = "nodejs";

type IncomingManagerExpensePayload = {
  month?: unknown;
  description?: unknown;
  amount?: unknown;
  currency?: unknown;
};

async function requireManagerSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);
  return session;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
      { status: 401 },
    );
  }

  try {
    const data = await listManagerExpenses();
    return Response.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dështoi leximi i shpenzimeve.";
    return Response.json(
      { error: "Failed to load manager expenses", message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
      { status: 401 },
    );
  }

  let payload: IncomingManagerExpensePayload;
  try {
    payload = (await request.json()) as IncomingManagerExpensePayload;
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Trupi i kërkesës nuk është JSON i vlefshëm." },
      { status: 400 },
    );
  }

  const month = normalizeString(payload.month);
  const description = normalizeString(payload.description);
  const amount = Number(payload.amount);
  const currency = payload.currency as Currency;

  if (!month || !description) {
    return Response.json(
      { error: "Validation failed", message: "Muaji dhe përshkrimi janë të detyrueshme." },
      { status: 400 },
    );
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return Response.json(
      { error: "Validation failed", message: "Shuma duhet të jetë vlerë jo negative." },
      { status: 400 },
    );
  }
  if (currency !== "EUR" && currency !== "ALL") {
    return Response.json(
      { error: "Validation failed", message: "Monedha është e pavlefshme." },
      { status: 400 },
    );
  }

  try {
    const data = await createManagerExpense({
      month,
      description,
      amount,
      currency,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dështoi ruajtja e shpenzimit.";
    return Response.json(
      { error: "Failed to create manager expense", message },
      { status: 500 },
    );
  }
}
