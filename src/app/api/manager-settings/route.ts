import { cookies } from "next/headers";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";
import {
  getManagerSettings,
  updateManagerSettings,
} from "@/lib/data/manager-settings";
import type { Currency } from "@/lib/domain/types";

export const runtime = "nodejs";

type IncomingSettingsPayload = {
  administrationFee?: unknown;
  administrationCurrency?: unknown;
};

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
    const data = await getManagerSettings();
    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dështoi leximi i cilësimeve.";
    return Response.json(
      { error: "Failed to load manager settings", message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await requireManagerSession();
  if (!session) {
    return Response.json(
      { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
      { status: 401 },
    );
  }

  let payload: IncomingSettingsPayload;
  try {
    payload = (await request.json()) as IncomingSettingsPayload;
  } catch {
    return Response.json(
      { error: "Bad Request", message: "Trupi i kërkesës nuk është JSON i vlefshëm." },
      { status: 400 },
    );
  }

  const administrationFee = Number(payload.administrationFee);
  const administrationCurrency = payload.administrationCurrency as Currency;

  if (!Number.isFinite(administrationFee) || administrationFee < 0) {
    return Response.json(
      { error: "Validation failed", message: "Tarifa e administrimit duhet të jetë jo negative." },
      { status: 400 },
    );
  }

  if (administrationCurrency !== "EUR" && administrationCurrency !== "ALL") {
    return Response.json(
      { error: "Validation failed", message: "Monedha e administrimit është e pavlefshme." },
      { status: 400 },
    );
  }

  try {
    const data = await updateManagerSettings({
      administrationFee,
      administrationCurrency,
    });
    return Response.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dështoi ruajtja e cilësimeve.";
    return Response.json(
      { error: "Failed to update manager settings", message },
      { status: 500 },
    );
  }
}
