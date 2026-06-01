import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import { createProperty, deleteProperty, listProperties } from "@/lib/data/properties";

export const runtime = "nodejs";

async function requireManagerSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);
  return session;
}

type IncomingPropertyPayload = {
  unitName?: unknown;
  locationSubtitle?: unknown;
  rentAmount?: unknown;
  rentCurrency?: unknown;
  status?: unknown;
  tenantName?: unknown;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: IncomingPropertyPayload) {
  const unitName = normalizeString(payload.unitName);
  const locationSubtitle = normalizeString(payload.locationSubtitle);
  const tenantName = normalizeString(payload.tenantName);
  const status = payload.status;
  const rentCurrency = payload.rentCurrency;
  const rentAmount = Number(payload.rentAmount);

  if (!unitName) {
    return { error: "Emri i njësisë është i detyrueshëm." } as const;
  }
  if (!locationSubtitle) {
    return { error: "Nënshkrimi i vendndodhjes është i detyrueshëm." } as const;
  }
  if (status !== "vacant" && status !== "occupied" && status !== "sold") {
    return { error: "Statusi i pronës është i pavlefshëm." } as const;
  }
  if (rentCurrency !== "EUR" && rentCurrency !== "ALL") {
    return { error: "Monedha e qirasë është e pavlefshme." } as const;
  }
  if (!Number.isFinite(rentAmount) || rentAmount < 0) {
    return { error: "Qiraja nuk mund të jetë negative." } as const;
  }
  if ((status === "occupied" || status === "sold") && !tenantName) {
    return {
      error:
        "Emri i qiramarrësit është i detyrueshëm kur statusi është i zënë ose i shitur.",
    } as const;
  }

  return {
    data: {
      unitName,
      locationSubtitle,
      status,
      tenantName: status === "vacant" ? "" : tenantName,
      rentAmount,
      rentCurrency,
    },
  } as const;
}

export async function POST(request: Request) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
      { status: 401 },
    );
  }

  let payload: IncomingPropertyPayload;
  try {
    payload = (await request.json()) as IncomingPropertyPayload;
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Trupi i kërkesës nuk është JSON i vlefshëm." },
      { status: 400 },
    );
  }

  const validation = validatePayload(payload);
  if ("error" in validation) {
    return Response.json(
      { error: "Validation failed", message: validation.error },
      { status: 400 },
    );
  }

  try {
    const created = await createProperty(validation.data);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi ruajtja e pronës. Provo përsëri.";

    return Response.json(
      { error: "Failed to create property", message },
      { status: 500 },
    );
  }
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
    const data = await listProperties();
    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi leximi i pronave.";

    return Response.json(
      { error: "Failed to load properties", message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim() ?? "";

  if (!id) {
    return Response.json(
      { error: "Validation failed", message: "ID e pronës është e detyrueshme." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteProperty(id);
    if (!deleted) {
      return Response.json(
        { error: "Not found", message: "Prona nuk u gjet." },
        { status: 404 },
      );
    }
    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi fshirja e pronës. Provo përsëri.";

    return Response.json(
      { error: "Failed to delete property", message },
      { status: 500 },
    );
  }
}
