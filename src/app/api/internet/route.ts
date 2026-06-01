import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import {
  createInternetService,
  deleteInternetService,
  listInternetServices,
} from "@/lib/data/internet";

export const runtime = "nodejs";

async function requireManagerSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);
  return session;
}

type IncomingInternetPayload = {
  serviceCode?: unknown;
  status?: unknown;
  assigneeType?: unknown;
  propertyId?: unknown;
  assigneeName?: unknown;
  modemSerialNumber?: unknown;
  price?: unknown;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: IncomingInternetPayload) {
  const serviceCode = normalizeString(payload.serviceCode).toUpperCase();
  const assigneeName = normalizeString(payload.assigneeName);
  const modemSerialNumber = normalizeString(payload.modemSerialNumber).toUpperCase();
  const status = payload.status;
  const assigneeType = payload.assigneeType;
  const propertyId = normalizeString(payload.propertyId);
  const price = Number(payload.price);

  if (!serviceCode) {
    return { error: "Kodi i shërbimit është i detyrueshëm." } as const;
  }
  if (status !== "free" && status !== "occupied") {
    return { error: "Statusi i shërbimit është i pavlefshëm." } as const;
  }
  if (assigneeType !== "tenant" && assigneeType !== "independent") {
    return { error: "Lloji i caktimit është i pavlefshëm." } as const;
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Çmimi duhet të jetë një vlerë jo negative." } as const;
  }
  if (status === "occupied" && !assigneeName) {
    return {
      error: "Emri i personit është i detyrueshëm kur shërbimi është i zënë.",
    } as const;
  }
  if (status === "occupied" && !modemSerialNumber) {
    return {
      error: "Numri i modemit është i detyrueshëm kur shërbimi është i zënë.",
    } as const;
  }
  if (status === "occupied" && assigneeType === "tenant" && !propertyId) {
    return {
      error: "Zgjidh pronën për caktim te qiramarrësi.",
    } as const;
  }

  return {
    data: {
      serviceCode,
      status,
      assigneeType,
      propertyId: assigneeType === "tenant" ? propertyId : undefined,
      assigneeName: status === "free" ? "" : assigneeName,
      modemSerialNumber: status === "free" ? "" : modemSerialNumber,
      price,
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

  let payload: IncomingInternetPayload;
  try {
    payload = (await request.json()) as IncomingInternetPayload;
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
    const created = await createInternetService(validation.data);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi ruajtja e shërbimit të internetit. Provo përsëri.";

    return Response.json(
      { error: "Failed to create internet service", message },
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
    const data = await listInternetServices();
    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi leximi i shërbimeve të internetit.";

    return Response.json(
      { error: "Failed to load internet services", message },
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
      { error: "Validation failed", message: "ID e shërbimit është e detyrueshme." },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteInternetService(id);
    if (!deleted) {
      return Response.json(
        { error: "Not found", message: "Shërbimi nuk u gjet." },
        { status: 404 },
      );
    }
    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi fshirja e shërbimit të internetit. Provo përsëri.";

    return Response.json(
      { error: "Failed to delete internet service", message },
      { status: 500 },
    );
  }
}
