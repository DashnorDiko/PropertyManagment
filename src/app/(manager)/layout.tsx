import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ManagerShell } from "@/components/layout/ManagerShell";
import { MANAGER_SESSION_COOKIE, readSessionToken } from "@/lib/auth/manager-auth";

export default async function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const session = readSessionToken(cookieStore.get(MANAGER_SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/login");
  }

  return <ManagerShell username={session.username}>{children}</ManagerShell>;
}
