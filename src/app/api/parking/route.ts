import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import { createParkingSpot, listParkingSpots } from "@/lib/data/parking";

export const runtime = "nodejs";

async function requireManagerSession() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);
  return session;
}

type IncomingParkingPayload = {
  spotCode?: unknown;
  status?: unknown;
  assigneeType?: unknown;
  assigneeName?: unknown;
  parkingCardNumber?: unknown;
  price?: unknown;
};

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(payload: IncomingParkingPayload) {
  const spotCode = normalizeString(payload.spotCode).toUpperCase();
  const assigneeName = normalizeString(payload.assigneeName);
  const parkingCardNumber = normalizeString(payload.parkingCardNumber).toUpperCase();
  const status = payload.status;
  const assigneeType = payload.assigneeType;
  const price = Number(payload.price);

  if (!spotCode) {
    return { error: "Kodi i vendit është i detyrueshëm." } as const;
  }
  if (status !== "free" && status !== "occupied") {
    return { error: "Statusi i vendit është i pavlefshëm." } as const;
  }
  if (assigneeType !== "tenant" && assigneeType !== "independent") {
    return { error: "Lloji i caktimit është i pavlefshëm." } as const;
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Çmimi duhet të jetë një vlerë jo negative." } as const;
  }
  if (status === "occupied" && !assigneeName) {
    return { error: "Emri i personit është i detyrueshëm për vendet e zëna." } as const;
  }
  if (status === "occupied" && !parkingCardNumber) {
    return {
      error: "Numri i kartës së parkimit është i detyrueshëm për vendet e zëna.",
    } as const;
  }

  return {
    data: {
      spotCode,
      status,
      assigneeType,
      assigneeName: status === "free" ? "" : assigneeName,
      parkingCardNumber: status === "free" ? "" : parkingCardNumber,
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

  let payload: IncomingParkingPayload;
  try {
    payload = (await request.json()) as IncomingParkingPayload;
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
    const created = await createParkingSpot(validation.data);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi ruajtja e vendit të parkimit. Provo përsëri.";

    return Response.json(
      { error: "Failed to create parking spot", message },
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
    const data = await listParkingSpots();
    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Dështoi leximi i vendeve të parkimit.";

    return Response.json(
      { error: "Failed to load parking spots", message },
      { status: 500 },
    );
  }
}
