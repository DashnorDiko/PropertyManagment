"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type InternetListItem = {
  id: string;
  serviceCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  modemSerialNumber: string;
  price: number;
};

type InternetListTableProps = {
  items: InternetListItem[];
};

type StatusFilter = "all" | InternetListItem["status"];
type AssigneeFilter = "all" | InternetListItem["assigneeType"];
type StatusSort = "none" | "asc" | "desc";

const statusTone: Record<InternetListItem["status"], string> = {
  free: "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] ring-[var(--pm-accent)]/20",
  occupied: "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
};

export function InternetListTable({ items }: InternetListTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const [statusSort, setStatusSort] = useState<StatusSort>("none");
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const visibleItems = useMemo(() => {
    const filtered = items.filter((service) => {
      const statusMatch = statusFilter === "all" || service.status === statusFilter;
      const assigneeMatch = assigneeFilter === "all" || service.assigneeType === assigneeFilter;
      return statusMatch && assigneeMatch;
    });

    const searched = normalizedSearch
      ? filtered.filter((service) =>
          [service.serviceCode, service.assigneeName, service.modemSerialNumber, String(service.price)]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        )
      : filtered;

    if (statusSort === "none") {
      return searched;
    }

    const rankMap: Record<InternetListItem["status"], number> = {
      occupied: 0,
      free: 1,
    };
    const direction = statusSort === "asc" ? 1 : -1;

    return [...searched].sort(
      (left, right) => (rankMap[left.status] - rankMap[right.status]) * direction,
    );
  }, [assigneeFilter, items, normalizedSearch, statusFilter, statusSort]);

  const toggleStatusSort = () => {
    setStatusSort((current) => {
      if (current === "none") return "asc";
      if (current === "asc") return "desc";
      return "none";
    });
  };

  return (
    <div className="space-y-3">
      <label className="relative block max-w-sm">
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
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Kërko sipas kodit, personit, modemit ose çmimit"
          className="w-full rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] py-2 pl-9 pr-4 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/25 transition-all duration-200 focus:border-[var(--pm-accent)]/35 focus:bg-[var(--pm-surface)] focus:ring"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "occupied", "free"] as const).map((option) => {
          const isActive = statusFilter === option;
          const labelMap: Record<typeof option, string> = {
            all: "Të gjithë statuset",
            occupied: "I zënë",
            free: "I lirë",
          };
          const label = labelMap[option];

          return (
            <button
              key={option}
              type="button"
              onClick={() => setStatusFilter(option)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                isActive
                  ? "border-[var(--pm-accent)] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                  : "border-[var(--pm-border)] bg-[var(--pm-surface)] text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
        {(["all", "tenant", "independent"] as const).map((option) => {
          const isActive = assigneeFilter === option;
          const label =
            option === "all" ? "Të gjithë personat" : option === "tenant" ? "Qiramarrës" : "I pavarur";

          return (
            <button
              key={option}
              type="button"
              onClick={() => setAssigneeFilter(option)}
              className={[
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                isActive
                  ? "border-[var(--pm-accent)] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                  : "border-[var(--pm-border)] bg-[var(--pm-surface)] text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Shërbimi</th>
              <th className="px-5 py-3 font-semibold">
                <button
                  type="button"
                  onClick={toggleStatusSort}
                  className="inline-flex items-center gap-1 transition hover:text-[var(--pm-text-primary)]"
                >
                  Statusi
                  <span className="text-[10px]">
                    {statusSort === "asc" ? "▲" : statusSort === "desc" ? "▼" : "↕"}
                  </span>
                </button>
              </th>
              <th className="px-5 py-3 font-semibold">Lloji i Caktimit</th>
              <th className="px-5 py-3 font-semibold">Personi i Caktuar</th>
              <th className="px-5 py-3 font-semibold">Nr. Modemi</th>
              <th className="px-5 py-3 font-semibold">Çmimi</th>
              <th className="px-5 py-3 font-semibold text-right">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((service) => (
              <tr
                key={service.id}
                className="border-t border-[var(--pm-border)]/60 transition hover:bg-[var(--pm-surface-soft)]"
              >
                <td className="px-5 py-3 font-medium text-[var(--pm-text-primary)]">{service.serviceCode}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone[service.status]}`}
                  >
                    {service.status === "occupied" ? "I zënë" : "I lirë"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                  {service.assigneeType === "tenant" ? "Qiramarrës" : "I pavarur"}
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">{service.assigneeName || "-"}</td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">{service.modemSerialNumber || "-"}</td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">{service.price.toFixed(2)} EUR</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/internet/${service.id}/edit`}
                    className="rounded-lg border border-[var(--pm-border)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
                  >
                    Ndrysho
                  </Link>
                </td>
              </tr>
            ))}
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-[var(--pm-text-secondary)]">
                  Nuk ka shërbime interneti që përputhen me filtrat e zgjedhur.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
