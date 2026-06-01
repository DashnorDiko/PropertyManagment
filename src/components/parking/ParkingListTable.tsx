"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type ParkingListItem = {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  parkingCardNumber: string;
  price: number;
};

type ParkingListTableProps = {
  items: ParkingListItem[];
};

type StatusFilter = "all" | ParkingListItem["status"];
type AssigneeFilter = "all" | ParkingListItem["assigneeType"];
type StatusSort = "none" | "asc" | "desc";

const statusTone: Record<ParkingListItem["status"], string> = {
  free: "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] ring-[var(--pm-accent)]/20",
  occupied: "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
};

export function ParkingListTable({ items }: ParkingListTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>("all");
  const [statusSort, setStatusSort] = useState<StatusSort>("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();

  const visibleItems = useMemo(() => {
    const filtered = items.filter((spot) => {
      const statusMatch = statusFilter === "all" || spot.status === statusFilter;
      const assigneeMatch = assigneeFilter === "all" || spot.assigneeType === assigneeFilter;
      return statusMatch && assigneeMatch;
    });
    const searched = normalizedSearch
      ? filtered.filter((spot) =>
          [spot.spotCode, spot.assigneeName, spot.parkingCardNumber, String(spot.price)]
            .join(" ")
            .toLocaleLowerCase()
            .includes(normalizedSearch),
        )
      : filtered;

    if (statusSort === "none") {
      return searched;
    }

    const rankMap: Record<ParkingListItem["status"], number> = {
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

  const handleDelete = async (spotId: string) => {
    if (!window.confirm("A je i sigurt që dëshiron të fshish këtë vend parkimi?")) {
      return;
    }

    setErrorMessage(null);
    setDeletingId(spotId);

    try {
      const response = await fetch(`/api/parking?id=${encodeURIComponent(spotId)}`, {
        method: "DELETE",
      });
      const body = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        throw new Error(body.message || "Dështoi fshirja e vendit të parkimit.");
      }
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dështoi fshirja e vendit të parkimit. Provo përsëri.",
      );
    } finally {
      setDeletingId(null);
    }
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
          placeholder="Kërko sipas kodit, personit, kartës ose çmimit"
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
            option === "all"
              ? "Të gjithë personat"
              : option === "tenant"
                ? "Qiramarrës"
                : "I pavarur";

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
      {errorMessage ? (
        <p className="text-sm text-[var(--pm-danger)]">{errorMessage}</p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
            <tr>
              <th className="px-5 py-3 font-semibold">Vendi</th>
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
              <th className="px-5 py-3 font-semibold">Karta e Parkimit</th>
              <th className="px-5 py-3 font-semibold">Çmimi</th>
              <th className="px-5 py-3 font-semibold text-right">Veprime</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((spot) => (
              <tr
                key={spot.id}
                className="border-t border-[var(--pm-border)]/60 transition hover:bg-[var(--pm-surface-soft)]"
              >
                <td className="px-5 py-3 font-medium text-[var(--pm-text-primary)]">{spot.spotCode}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone[spot.status]}`}
                  >
                    {spot.status === "occupied" ? "I zënë" : "I lirë"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                  {spot.assigneeType === "tenant" ? "Qiramarrës" : "I pavarur"}
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                  {spot.assigneeName || "-"}
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                  {spot.parkingCardNumber || "-"}
                </td>
                <td className="px-5 py-3 text-[var(--pm-text-secondary)]">{spot.price.toFixed(2)} EUR</td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/parking/${spot.id}/edit`}
                      className="rounded-lg border border-[var(--pm-border)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
                    >
                      Ndrysho
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(spot.id)}
                      disabled={deletingId === spot.id}
                      className="rounded-lg border border-[var(--pm-danger)]/50 px-3 py-1.5 text-xs font-medium text-[var(--pm-danger)] transition hover:bg-[var(--pm-danger)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === spot.id ? "Duke fshirë..." : "Fshi"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visibleItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-sm text-[var(--pm-text-secondary)]">
                  Nuk ka vende parkimi që përputhen me filtrat e zgjedhur.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
