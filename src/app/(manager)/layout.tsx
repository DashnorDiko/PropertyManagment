"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ManagerNavigation } from "@/components/ui/ManagerNavigation";

const managerNavigation = [
  { href: "/status", label: "Status Dashboard", icon: "dashboard", section: "Daily Operations" as const },
  { href: "/properties", label: "All Properties", icon: "home", section: "Daily Operations" as const },
  { href: "/administration", label: "Administration", icon: "building", section: "Daily Operations" as const },
  { href: "/reports", label: "Reports", icon: "reports", section: "Daily Operations" as const },
  { href: "/parking", label: "Parking Management", icon: "parking", section: "Independent Services" as const },
  { href: "/internet", label: "Internet Clients", icon: "internet", section: "Independent Services" as const },
];

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeNavItem = managerNavigation.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const pageTitle = activeNavItem?.label ?? "Dashboard";

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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold text-[var(--pm-text-secondary)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:scale-[1.02] hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)] active:translate-y-0 active:scale-[0.98]"
              aria-label="Settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z" />
                <path d="m19.3 13.2.9-.6-.9-2.6-1.1.1a6.9 6.9 0 0 0-.9-1.6l.5-1-2.2-1.6-.8.8a7.1 7.1 0 0 0-1.8-.4l-.5-1h-2.8l-.5 1a7.1 7.1 0 0 0-1.8.4l-.8-.8-2.2 1.6.5 1a6.9 6.9 0 0 0-.9 1.6l-1.1-.1-.9 2.6.9.6c0 .5 0 1 .2 1.4l-.8.7 1.1 2.5 1-.1a7 7 0 0 0 1.2 1.2l-.2 1 2.5 1.1.7-.8c.4.1.9.2 1.4.2l.6.9h2.8l.6-.9c.5 0 1-.1 1.4-.2l.7.8 2.5-1.1-.2-1a7 7 0 0 0 1.2-1.2l1 .1 1.1-2.5-.8-.7c.1-.4.2-.9.2-1.4Z" />
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
              <label className="relative hidden lg:block">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--pm-text-secondary)]"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  type="search"
                  placeholder="Search"
                  className="rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] py-2 pl-9 pr-4 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/25 transition-all duration-200 focus:border-[var(--pm-accent)]/35 focus:bg-[var(--pm-surface)] focus:ring"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-1.5 text-sm text-[var(--pm-text-secondary)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)] active:translate-y-0 active:scale-[0.99]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M4 7h16M7 12h10M10 17h4" />
                </svg>
                Customize
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#f4f5f9] p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
