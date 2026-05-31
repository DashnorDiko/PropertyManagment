import { cookies } from "next/headers";

import { MANAGER_SESSION_COOKIE } from "@/lib/auth/manager-auth";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(MANAGER_SESSION_COOKIE);

  return Response.json({ ok: true });
}
