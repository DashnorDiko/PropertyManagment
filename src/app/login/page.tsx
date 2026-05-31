import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ManagerLoginForm } from "@/components/auth/ManagerLoginForm";
import {
  getSessionTimeoutMinutes,
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "@/lib/auth/manager-auth";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const existingSession = readSessionToken(
    cookieStore.get(MANAGER_SESSION_COOKIE)?.value,
  );

  if (existingSession) {
    redirect("/status");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(130deg,#aab8e8_0%,#b4b6ed_50%,#8498ea_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/35 bg-[var(--pm-surface)]/95 shadow-[0_26px_55px_-28px_rgba(34,41,87,0.55)] md:grid-cols-[1.1fr_1fr]">
        <section className="relative hidden min-h-[520px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#9aa7e8_0%,#8498ea_45%,#7d8df0_100%)] p-8 text-white md:flex">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold backdrop-blur-sm">
              S
            </div>
            <h1 className="max-w-xs text-3xl font-semibold leading-tight">
              Menaxhimi i Pronave
            </h1>
            <p className="mt-3 max-w-sm text-sm text-white/85">
              Qendër e unifikuar për pagesa, status, administrim dhe raporte.
            </p>
          </div>
          <div className="relative z-10 space-y-2">
            <p className="text-xs uppercase tracking-wider text-white/70">
              Siguria e sesionit
            </p>
            <p className="text-sm text-white/90">
              Seanca skadon automatikisht pas{" "}
              <span className="font-semibold">
                {getSessionTimeoutMinutes()} minutash
              </span>{" "}
              paaktiviteti.
            </p>
          </div>
        </section>

        <section className="flex min-h-[520px] flex-col justify-center bg-[var(--pm-surface)] p-6 sm:p-8">
          <div className="mb-6 md:hidden">
            <h1 className="text-2xl font-semibold text-[var(--pm-text-primary)]">
              Menaxhimi i Pronave
            </h1>
            <p className="mt-1 text-sm text-[var(--pm-text-secondary)]">
              Seanca skadon pas {getSessionTimeoutMinutes()} minutash.
            </p>
          </div>
          <div className="mb-5 hidden md:block">
            <h2 className="text-3xl font-semibold text-[var(--pm-text-primary)]">
              Hyr në panel
            </h2>
            <p className="mt-1 text-sm text-[var(--pm-text-secondary)]">
              Përdor kredencialet e menaxherit për të vazhduar.
            </p>
          </div>
          <ManagerLoginForm />
        </section>
      </div>
    </main>
  );
}
