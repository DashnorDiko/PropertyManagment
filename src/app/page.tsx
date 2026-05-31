import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = readSessionToken(
    cookieStore.get(MANAGER_SESSION_COOKIE)?.value,
  );
  redirect(session ? "/status" : "/login");
}
