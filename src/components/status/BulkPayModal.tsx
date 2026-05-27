"use client";

import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/domain/currency";
import type { ChargeSchedule, ChargeType } from "@/lib/domain/types";

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

type MonthChargeRow = {
  monthKey: string;
  monthLabel: string;
  dueDate: string;
  byType: Partial<Record<ChargeType, ChargeSchedule>>;
};

const chargeColumns: { key: ChargeType; label: string }[] = [
  { key: "rent", label: "Rent" },
  { key: "administration", label: "Administration" },
  { key: "parking", label: "Parking" },
  { key: "internet", label: "Internet" },
];

export function BulkPayModal({ schedules }: { schedules: ChargeSchedule[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime(),
      ),
    [schedules],
  );
  const pending = useMemo(
    () => sortedSchedules.filter((schedule) => !schedule.paidAt),
    [sortedSchedules],
  );
  const monthRows = useMemo<MonthChargeRow[]>(() => {
    const rowMap = new Map<string, MonthChargeRow>();

    for (const schedule of sortedSchedules) {
      const monthKey = `${schedule.monthLabel}-${schedule.dueDate.slice(0, 7)}`;
      const existing = rowMap.get(monthKey);

      if (existing) {
        existing.byType[schedule.chargeType] = schedule;
        continue;
      }

      rowMap.set(monthKey, {
        monthKey,
        monthLabel: schedule.monthLabel,
        dueDate: schedule.dueDate,
        byType: {
          [schedule.chargeType]: schedule,
        },
      });
    }

    return [...rowMap.values()].sort(
      (left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime(),
    );
  }, [sortedSchedules]);
  const selectedSchedules = pending.filter((schedule) => selected.includes(schedule.id));
  const total = selectedSchedules.reduce((sum, item) => sum + item.amount, 0);
  const effectivePaymentDate = paymentDate || getTodayDateString();

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setPaymentDate((current) => current || getTodayDateString());
        }}
        className="rounded-md bg-[var(--pm-accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--pm-accent-strong)]"
      >
        Pay
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--pm-text-primary)]">
                Bulk Payment
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--pm-text-secondary)] hover:text-[var(--pm-text-primary)]"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-[var(--pm-text-secondary)]">
              Check unpaid cells by month and charge type, then log them in one payment operation.
            </p>
            <div className="mt-4 rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] p-3">
              <label className="text-sm text-[var(--pm-text-secondary)]">
                Payment Date
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="mt-1 block w-full rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
                />
              </label>
              <p className="mt-2 text-xs text-[var(--pm-text-secondary)]">
                If no date is selected, payment is logged with today&apos;s date (
                {getTodayDateString()}).
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(pending.map((item) => item.id))}
                className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]"
              >
                Select All Unpaid
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]"
              >
                Clear
              </button>
            </div>
            <div className="mt-3 max-h-80 overflow-auto rounded-md border border-[var(--pm-border)]">
              <table className="min-w-full text-left text-xs">
                <thead className="sticky top-0 bg-[var(--pm-surface-soft)] text-[var(--pm-text-secondary)]">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Month</th>
                    {chargeColumns.map((column) => (
                      <th key={column.key} className="px-3 py-2 font-semibold">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthRows.map((row) => (
                    <tr key={row.monthKey} className="border-t border-[var(--pm-border)]/70">
                      <td className="px-3 py-2 font-medium text-[var(--pm-text-primary)]">{row.monthLabel}</td>
                      {chargeColumns.map((column) => {
                        const charge = row.byType[column.key];
                        if (!charge) {
                          return (
                            <td key={`${row.monthKey}-${column.key}`} className="px-3 py-2 text-[var(--pm-text-secondary)]">
                              -
                            </td>
                          );
                        }

                        if (charge.paidAt) {
                          return (
                            <td key={`${row.monthKey}-${column.key}`} className="px-3 py-2">
                              <span className="rounded-full bg-[var(--pm-accent-soft)] px-2 py-0.5 font-medium text-[var(--pm-accent)]">
                                Paid
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={`${row.monthKey}-${column.key}`} className="px-3 py-2">
                            <label className="inline-flex items-center gap-1.5 text-[var(--pm-text-primary)]">
                              <input
                                type="checkbox"
                                checked={selected.includes(charge.id)}
                                onChange={(event) =>
                                  setSelected((current) =>
                                    event.target.checked
                                      ? [...current, charge.id]
                                      : current.filter((id) => id !== charge.id),
                                  )
                                }
                              />
                              <span className="font-medium">
                                {formatCurrency(charge.amount, charge.currency)}
                              </span>
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--pm-border)] pt-3">
              <div>
                <p className="text-sm text-[var(--pm-text-secondary)]">
                  Total selected: <span className="font-semibold">{total.toFixed(2)}</span>
                </p>
                <p className="text-xs text-[var(--pm-text-secondary)]">
                  Logged date: {effectivePaymentDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentDate((current) => current || getTodayDateString());
                  setOpen(false);
                }}
                className="rounded-md bg-[var(--pm-accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--pm-accent-strong)]"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
