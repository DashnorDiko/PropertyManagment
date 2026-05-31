import { cookies } from "next/headers";

import {
  createSessionToken,
  getSessionCookieOptions,
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);

  if (!session) {
    cookieStore.delete(MANAGER_SESSION_COOKIE);
    return Response.json({ ok: false }, { status: 401 });
  }

  cookieStore.set(
    MANAGER_SESSION_COOKIE,
    createSessionToken(session.username),
    getSessionCookieOptions(),
  );

  return Response.json({ ok: true });
}
