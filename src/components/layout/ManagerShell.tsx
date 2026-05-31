"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  ManagerNavigation,
  type ManagerNavigationItem,
} from "@/components/ui/ManagerNavigation";

const managerNavigation: ManagerNavigationItem[] = [
  {
    href: "/status",
    label: "Paneli i Gjendjes",
    icon: "dashboard",
    section: "Daily Operations",
  },
  {
    href: "/properties",
    label: "Të Gjitha Pronat",
    icon: "home",
    section: "Daily Operations",
  },
  {
    href: "/administration",
    label: "Administrim",
    icon: "building",
    section: "Daily Operations",
  },
  {
    href: "/reports",
    label: "Raporte",
    icon: "reports",
    section: "Daily Operations",
  },
  {
    href: "/parking",
    label: "Menaxhimi i Parkimit",
    icon: "parking",
    section: "Independent Services",
  },
  {
    href: "/internet",
    label: "Klientët e Internetit",
    icon: "internet",
    section: "Independent Services",
  },
];

export function ManagerShell({
  children,
  username,
}: {
  children: ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeNavItem = managerNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const pageTitle = activeNavItem?.label ?? "Paneli";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  useEffect(() => {
    const refreshSession = async () => {
      const response = await fetch("/api/auth/touch", { method: "POST" });
      if (!response.ok) {
        router.replace("/login");
        router.refresh();
      }
    };

    refreshSession();
    const interval = window.setInterval(refreshSession, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[linear-gradient(130deg,#aab8e8_0%,#b4b6ed_50%,#8498ea_100%)] text-[var(--pm-text-primary)]">
      <div className="flex h-full w-full overflow-hidden border-white/50 bg-[var(--pm-surface)]/95 shadow-[0_20px_45px_-22px_rgba(34,41,87,0.45)]">
        <aside className="hidden w-20 flex-col border-r border-[var(--pm-border)]/70 bg-[var(--pm-surface)] md:flex">
          <div className="flex h-16 items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(140deg,var(--pm-accent),#7b83f0)] text-sm font-bold text-white shadow-sm transition-transform duration-300 ease-out hover:scale-[1.05]">
              S
            </div>
          </div>
          <ManagerNavigation items={managerNavigation} />
          <div className="flex justify-center border-t border-[var(--pm-border)]/70 py-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold text-[var(--pm-text-secondary)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-[1.02] hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)] active:translate-y-0 active:scale-[0.98]"
              aria-label="Dil"
              title="Dil"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H4" />
              </svg>
            </button>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-[var(--pm-border)]/70 bg-[var(--pm-surface)] px-4 md:px-8">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--pm-text-primary)]">
              {pageTitle}
            </h1>
            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-1.5 text-sm text-[var(--pm-text-secondary)]">
                {username}
              </span>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#f4f5f9] p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
