import Link from "next/link";
import type { ReactNode } from "react";

const managerNavigation = [
  { href: "/status", label: "Status" },
  { href: "/properties", label: "Properties" },
  { href: "/administration", label: "Administration" },
  { href: "/parking", label: "Parking" },
  { href: "/internet", label: "Internet" },
  { href: "/payments", label: "Payments" },
  { href: "/reports", label: "Reports" },
  { href: "/notifications", label: "Notifications" },
];

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Building Manager
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                Administrim Pallati
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Shared module workspace for operations and billing
            </p>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {managerNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
