"use client";

import { useMemo, useState } from "react";

import { allocateBulkPayment } from "@/lib/domain/payment-allocator";
import { formatCurrency } from "@/lib/domain/currency";
import type { ChargeSchedule } from "@/lib/domain/types";

export function BulkPayModal({ schedules }: { schedules: ChargeSchedule[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const pending = useMemo(
    () => schedules.filter((schedule) => !schedule.paidAt),
    [schedules],
  );
  const selectedSchedules = allocateBulkPayment(pending, selected);
  const total = selectedSchedules.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Pay
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Bulk Payment
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Select pending months and process them in one payment operation.
            </p>
            <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
              {pending.map((item) => (
                <li key={item.id} className="rounded-md border border-slate-200 px-3 py-2">
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={(event) =>
                          setSelected((current) =>
                            event.target.checked
                              ? [...current, item.id]
                              : current.filter((id) => id !== item.id),
                          )
                        }
                      />
                      <span className="capitalize">
                        {item.chargeType} - {item.monthLabel}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.amount, item.currency)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="text-sm text-slate-600">
                Total selected: <span className="font-semibold">{total.toFixed(2)}</span>
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500"
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
