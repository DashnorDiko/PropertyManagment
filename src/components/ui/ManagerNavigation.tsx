"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type ManagerNavigationItem = {
  href: string;
  label: string;
  icon:
    | "dashboard"
    | "home"
    | "building"
    | "reports"
    | "parking"
    | "internet";
  section: "Daily Operations" | "Independent Services";
};

type ManagerNavigationProps = {
  items: ManagerNavigationItem[];
};

function NavigationIcon({ name }: { name: ManagerNavigationItem["icon"] }) {
  const baseClass = "h-5 w-5";

  switch (name) {
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
          <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
          <rect x="3.5" y="12.5" width="7" height="8" rx="1.5" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <path d="M4 10.5 12 4l8 6.5" />
          <path d="M6.5 9.8v9h11v-9" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <rect x="5" y="3.5" width="14" height="17" rx="2" />
          <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <path d="M5 19.5h14" />
          <path d="M8 17V10m4 7V6m4 11v-4" />
        </svg>
      );
    case "parking":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <rect x="5" y="4.5" width="14" height="15" rx="2" />
          <path d="M9 16V8h4.2a2.2 2.2 0 1 1 0 4.4H9" />
        </svg>
      );
    case "internet":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={baseClass}>
          <path d="M3.5 9.5a12 12 0 0 1 17 0" />
          <path d="M6.8 12.8a7.4 7.4 0 0 1 10.4 0" />
          <path d="M10 16a2.8 2.8 0 0 1 4 0" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ManagerNavigation({ items }: ManagerNavigationProps) {
  const pathname = usePathname();
  const dailyItems = items.filter((item) => item.section === "Daily Operations");
  const serviceItems = items.filter((item) => item.section === "Independent Services");
  const itemClassName =
    "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all duration-200 ease-out";

  return (
    <nav className="flex flex-1 flex-col items-center gap-6 overflow-y-auto py-5">
      <ul className="space-y-2">
        {dailyItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={[
                  itemClassName,
                  isActive
                    ? "scale-[1.03] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] shadow-[0_6px_14px_-10px_rgba(63,92,77,0.65)]"
                    : "text-[var(--pm-text-secondary)] hover:-translate-y-[1px] hover:scale-[1.02] hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)] active:translate-y-0 active:scale-[0.98]",
                ].join(" ")}
              >
                <NavigationIcon name={item.icon} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="space-y-2">
        {serviceItems.map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={item.label}
                className={[
                  itemClassName,
                  isActive
                    ? "scale-[1.03] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] shadow-[0_6px_14px_-10px_rgba(63,92,77,0.65)]"
                    : "text-[var(--pm-text-secondary)] hover:-translate-y-[1px] hover:scale-[1.02] hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)] active:translate-y-0 active:scale-[0.98]",
                ].join(" ")}
              >
                <NavigationIcon name={item.icon} />
                <span className="sr-only">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
