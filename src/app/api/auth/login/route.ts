import { cookies } from "next/headers";

import {
  createSessionToken,
  getSessionCookieOptions,
  isValidManagerLogin,
  MANAGER_SESSION_COOKIE,
} from "@/lib/auth/manager-auth";

export const runtime = "nodejs";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!isValidManagerLogin(username, password)) {
    return Response.json(
      { ok: false, message: "Kredencialet nuk janë të sakta." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    MANAGER_SESSION_COOKIE,
    createSessionToken(username),
    getSessionCookieOptions(),
  );

  return Response.json({ ok: true });
}
