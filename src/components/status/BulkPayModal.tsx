"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { formatCurrency } from "@/lib/domain/currency";
import { formatMonthLabelSq } from "@/lib/domain/date-format";
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
  { key: "rent", label: "Qira" },
  { key: "administration", label: "Administrim" },
  { key: "parking", label: "Parkim" },
  { key: "internet", label: "Internet" },
];

type BulkPayModalProps = {
  schedules: ChargeSchedule[];
  allowedChargeTypes?: ChargeType[];
  buttonLabel?: string;
  onConfirmPayment?: (selectedSchedules: ChargeSchedule[], paymentDate: string) => void;
};

export function BulkPayModal({
  schedules,
  allowedChargeTypes = ["rent", "administration", "parking", "internet"],
  buttonLabel = "Paguaj",
  onConfirmPayment,
}: BulkPayModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const visibleColumns = useMemo(
    () => chargeColumns.filter((column) => allowedChargeTypes.includes(column.key)),
    [allowedChargeTypes],
  );

  const sortedSchedules = useMemo(
    () =>
      schedules
        .filter((schedule) => allowedChargeTypes.includes(schedule.chargeType))
        .sort(
        (left, right) => new Date(right.dueDate).getTime() - new Date(left.dueDate).getTime(),
      ),
    [allowedChargeTypes, schedules],
  );
  const pending = useMemo(
    () => sortedSchedules.filter((schedule) => !schedule.paidAt),
    [sortedSchedules],
  );
  const monthRows = useMemo<MonthChargeRow[]>(() => {
    const inferredYear =
      sortedSchedules.length > 0
        ? new Date(sortedSchedules[0].dueDate).getUTCFullYear()
        : new Date().getUTCFullYear();

    const rows: MonthChargeRow[] = Array.from({ length: 12 }, (_, monthIndex) => {
      const monthDate = new Date(Date.UTC(inferredYear, monthIndex, 1));
      return {
        monthKey: `${inferredYear}-${String(monthIndex + 1).padStart(2, "0")}`,
        monthLabel: formatMonthLabelSq(monthDate),
        dueDate: monthDate.toISOString(),
        byType: {},
      };
    });

    for (const schedule of sortedSchedules) {
      const dueDate = new Date(schedule.dueDate);
      const monthIndex = dueDate.getUTCMonth();
      if (monthIndex < 0 || monthIndex > 11) {
        continue;
      }
      rows[monthIndex].byType[schedule.chargeType] = schedule;
    }

    return rows;
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
        {buttonLabel}
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-xl rounded-xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pm-text-primary)]">
                    Pagesë në Grup
                  </h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-[var(--pm-text-secondary)] hover:text-[var(--pm-text-primary)]"
                  >
                    Mbyll
                  </button>
                </div>
                <p className="mt-1 text-sm text-[var(--pm-text-secondary)]">
                  Zgjidh qelizat e papaguara sipas muajit dhe llojit të detyrimit, pastaj regjistroji me një pagesë.
                </p>
                <div className="mt-4 rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] p-3">
                  <label className="text-sm text-[var(--pm-text-secondary)]">
                    Data e Pagesës
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                      className="mt-1 block w-full rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
                    />
                  </label>
                  <p className="mt-2 text-xs text-[var(--pm-text-secondary)]">
                    Nëse nuk zgjidhet datë, pagesa regjistrohet me datën e sotme (
                    {getTodayDateString()}).
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(pending.map((item) => item.id))}
                    className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]"
                  >
                    Zgjidh të Gjitha të Papaguarat
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected([])}
                    className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-1.5 text-xs font-medium text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]"
                  >
                    Pastro
                  </button>
                </div>
                <div className="mt-3 max-h-80 overflow-auto rounded-md border border-[var(--pm-border)]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[var(--pm-surface-soft)] text-[var(--pm-text-secondary)]">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Muaji</th>
                        {visibleColumns.map((column) => (
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
                          {visibleColumns.map((column) => {
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
                                    E paguar
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
                      Totali i zgjedhur: <span className="font-semibold">{total.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-[var(--pm-text-secondary)]">
                      Data e regjistrimit: {effectivePaymentDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const paidDate = paymentDate || getTodayDateString();
                      if (selectedSchedules.length > 0) {
                        onConfirmPayment?.(selectedSchedules, paidDate);
                      }
                      setPaymentDate((current) => current || getTodayDateString());
                      setSelected([]);
                      setOpen(false);
                    }}
                    className="rounded-md bg-[var(--pm-accent)] px-3 py-2 text-sm font-medium text-white hover:bg-[var(--pm-accent-strong)]"
                  >
                    Konfirmo Pagesën
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
