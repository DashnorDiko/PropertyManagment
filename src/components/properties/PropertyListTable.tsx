"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/domain/currency";
import type { Currency } from "@/lib/domain/types";

type PropertyListItem = {
  id: string;
  unitName: string;
  locationSubtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenantName: string;
  rentAmount?: number;
  rentCurrency: Currency;
};

type PropertyListTableProps = {
  items: PropertyListItem[];
};

type StatusFilter = "all" | PropertyListItem["status"];
type StatusSort = "none" | "asc" | "desc";

const statusClassMap: Record<PropertyListItem["status"], string> = {
  occupied:
    "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] ring-[var(--pm-accent)]/20",
  vacant:
    "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
  sold:
    "bg-[var(--pm-surface-soft)] text-[var(--pm-text-secondary)] ring-[var(--pm-border)]",
};

export function PropertyListTable({ items }: PropertyListTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusSort, setStatusSort] = useState<StatusSort>("none");
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const visibleItems = useMemo(() => {
    const filtered =
      statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter);
    const searched = normalizedSearch
      ? filtered.filter((item) =>
          [item.unitName, item.locationSubtitle, item.tenantName]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        )
      : filtered;

    if (statusSort === "none") {
      return searched;
    }

    const rankMap: Record<PropertyListItem["status"], number> = {
      occupied: 0,
      vacant: 1,
      sold: 2,
    };

    const direction = statusSort === "asc" ? 1 : -1;
    return [...searched].sort((left, right) => (rankMap[left.status] - rankMap[right.status]) * direction);
  }, [items, normalizedSearch, statusFilter, statusSort]);

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
          placeholder="Kërko sipas njësisë, vendndodhjes ose qiramarrësit"
          className="w-full rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] py-2 pl-9 pr-4 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/25 transition-all duration-200 focus:border-[var(--pm-accent)]/35 focus:bg-[var(--pm-surface)] focus:ring"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "occupied", "vacant", "sold"] as const).map((option) => {
          const isActive = statusFilter === option;
          const labelMap: Record<typeof option, string> = {
            all: "Të gjitha",
            occupied: "E zënë",
            vacant: "Bosh",
            sold: "E shitur",
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
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Njësia</th>
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
            <th className="px-5 py-3 font-semibold">Qiramarrësi</th>
            <th className="px-5 py-3 font-semibold">Qiraja</th>
            <th className="px-5 py-3 font-semibold text-right">Veprime</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((property) => (
            <tr
              key={property.id}
              className={[
                "border-t border-[var(--pm-border)]/60 transition hover:bg-[var(--pm-surface-soft)]",
                property.status === "occupied"
                  ? "bg-[var(--pm-accent-soft)]/45 shadow-[inset_3px_0_0_0_var(--pm-accent)]"
                  : "",
                property.status === "sold" ? "bg-[var(--pm-surface-soft)]/60 opacity-75" : "",
              ].join(" ")}
            >
              <td className="px-5 py-3 font-medium text-[var(--pm-text-primary)]">
                <p>{property.unitName}</p>
                <p className="text-xs font-normal text-[var(--pm-text-secondary)]">
                  {property.locationSubtitle}
                </p>
              </td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClassMap[property.status]}`}
                >
                  {property.status === "occupied"
                    ? "E zënë"
                    : property.status === "vacant"
                      ? "Bosh"
                      : "E shitur"}
                </span>
              </td>
              <td className="px-5 py-3 text-[var(--pm-text-secondary)]">{property.tenantName}</td>
              <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                {typeof property.rentAmount === "number"
                  ? formatCurrency(property.rentAmount, property.rentCurrency)
                  : "-"}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/properties/${property.id}/edit`}
                  className="rounded-lg border border-[var(--pm-border)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
                >
                  Ndrysho
                </Link>
              </td>
            </tr>
          ))}
          {visibleItems.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-6 text-center text-sm text-[var(--pm-text-secondary)]">
                Nuk ka prona që përputhen me këtë filtër statusi.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
    </div>
  );
}
