"use client";

import Link from "next/link";

export type ParkingListItem = {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  parkingCardNumber: string;
};

type ParkingListTableProps = {
  items: ParkingListItem[];
};

const statusTone: Record<ParkingListItem["status"], string> = {
  free: "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] ring-[var(--pm-accent)]/20",
  occupied: "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
};

export function ParkingListTable({ items }: ParkingListTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Spot</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Assigned Type</th>
            <th className="px-5 py-3 font-semibold">Assigned Person</th>
            <th className="px-5 py-3 font-semibold">Parking Card</th>
            <th className="px-5 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((spot) => (
            <tr
              key={spot.id}
              className="border-t border-[var(--pm-border)]/60 transition hover:bg-[var(--pm-surface-soft)]"
            >
              <td className="px-5 py-3 font-medium text-[var(--pm-text-primary)]">{spot.spotCode}</td>
              <td className="px-5 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusTone[spot.status]}`}
                >
                  {spot.status}
                </span>
              </td>
              <td className="px-5 py-3 capitalize text-[var(--pm-text-secondary)]">{spot.assigneeType}</td>
              <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                {spot.assigneeName || "-"}
              </td>
              <td className="px-5 py-3 text-[var(--pm-text-secondary)]">
                {spot.parkingCardNumber || "-"}
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/parking/${spot.id}/edit`}
                  className="rounded-lg border border-[var(--pm-border)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
