import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import {
  createPaymentLogs,
  listPaymentLogs,
  type CreatePaymentLogInput,
} from "@/lib/data/payment-logs";
import type { ChargeType, Currency, PaymentMethod } from "@/lib/domain/types";

export const runtime = "nodejs";

type IncomingPaymentLog = {
  date?: unknown;
  method?: unknown;
  amount?: unknown;
  currency?: unknown;
  tenantId?: unknown;
  propertyId?: unknown;
  chargeType?: unknown;
  coveredMonth?: unknown;
};

function isValidCurrency(value: unknown): value is Currency {
  return value === "EUR" || value === "ALL";
}

function isValidMethod(value: unknown): value is PaymentMethod {
  return value === "cash" || value === "bank";
}

function isValidChargeType(value: unknown): value is ChargeType {
  return value === "rent" || value === "administration" || value === "parking" || value === "internet";
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function validatePaymentLog(payload: IncomingPaymentLog): CreatePaymentLogInput | null {
  const date = typeof payload.date === "string" ? payload.date.trim() : "";
  const amount = Number(payload.amount);

  if (!date || !isValidMethod(payload.method) || !isValidCurrency(payload.currency)) {
    return null;
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  const chargeType = payload.chargeType;
  if (chargeType !== undefined && chargeType !== null && !isValidChargeType(chargeType)) {
    return null;
  }

  return {
    date,
    method: payload.method,
    amount,
    currency: payload.currency,
    tenantId: normalizeOptionalString(payload.tenantId),
    propertyId: normalizeOptionalString(payload.propertyId),
    chargeType: chargeType ?? undefined,
    coveredMonth: normalizeOptionalString(payload.coveredMonth),
  };
}

async function requireManagerSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);
  return session;
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
    const data = await listPaymentLogs();
    return Response.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dështoi leximi i pagesave.";
    return Response.json(
      { error: "Failed to load payment logs", message },
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Trupi i kërkesës nuk është JSON i vlefshëm." },
      { status: 400 },
    );
  }

  const rawItems = Array.isArray(payload) ? payload : [payload];
  const items = rawItems
    .map((item) => validatePaymentLog(item as IncomingPaymentLog))
    .filter((item): item is CreatePaymentLogInput => item !== null);

  if (items.length === 0 || items.length !== rawItems.length) {
    return Response.json(
      { error: "Validation failed", message: "Të dhënat e pagesës janë të pavlefshme." },
      { status: 400 },
    );
  }

  try {
    const data = await createPaymentLogs(items);
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Dështoi ruajtja e pagesave.";
    return Response.json(
      { error: "Failed to create payment logs", message },
      { status: 500 },
    );
  }
}
