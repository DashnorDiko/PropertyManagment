"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

import { formatCurrency } from "@/lib/domain/currency";
import { getPaymentState } from "@/lib/domain/payment-status";
import type { ChargeSchedule, Payment, PropertyStatus } from "@/lib/domain/types";

type ApartmentInfoModalProps = {
  apartmentName: string;
  apartmentSubtitle: string;
  apartmentStatus: PropertyStatus;
  tenantId?: string;
  tenantName: string;
  chargeHistory: ChargeSchedule[];
  paymentHistory: Payment[];
};

function chargeTypeLabel(type: string): string {
  switch (type) {
    case "rent":
      return "Qira";
    case "administration":
      return "Administrim";
    case "parking":
      return "Parkim";
    case "internet":
      return "Internet";
    default:
      return type;
  }
}

export function ApartmentInfoModal({
  apartmentName,
  apartmentSubtitle,
  apartmentStatus,
  tenantId,
  tenantName,
  chargeHistory,
  paymentHistory,
}: ApartmentInfoModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)] hover:text-[var(--pm-text-primary)]"
      >
        Më Shumë
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--pm-text-primary)]">Detajet e Apartamentit</h3>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-sm text-[var(--pm-text-secondary)] hover:text-[var(--pm-text-primary)]"
                  >
                    Mbyll
                  </button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
                    <span className="font-medium text-[var(--pm-text-primary)]">Apartamenti:</span>{" "}
                    <span className="text-[var(--pm-text-secondary)]">{apartmentName}</span>
                  </p>
                  <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
                    <span className="font-medium text-[var(--pm-text-primary)]">Vendndodhja:</span>{" "}
                    <span className="text-[var(--pm-text-secondary)]">{apartmentSubtitle}</span>
                  </p>
                  <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
                    <span className="font-medium text-[var(--pm-text-primary)]">Statusi:</span>{" "}
                    <span className="capitalize text-[var(--pm-text-secondary)]">
                      {apartmentStatus === "occupied"
                        ? "e zënë"
                        : apartmentStatus === "empty"
                          ? "bosh"
                          : "e shitur"}
                    </span>
                  </p>
                  <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
                    <span className="font-medium text-[var(--pm-text-primary)]">Qiramarrësi:</span>{" "}
                    <span className="text-[var(--pm-text-secondary)]">{tenantName}</span>
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--pm-text-primary)]">
                    Historiku i Detyrimeve të Qiramarrësit
                  </h4>
                  {tenantId && chargeHistory.length > 0 ? (
                    <ul className="max-h-44 space-y-2 overflow-y-auto pr-1">
                      {chargeHistory.map((charge) => {
                        const state = getPaymentState({
                          dueDate: charge.dueDate,
                          paidAt: charge.paidAt,
                        });
                        const stateTone =
                          state === "paid"
                            ? "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                            : state === "overdue"
                              ? "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)]"
                              : "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)]";
                        return (
                          <li
                            key={charge.id}
                            className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium capitalize text-[var(--pm-text-primary)]">
                                {chargeTypeLabel(charge.chargeType)} - {charge.monthLabel}
                              </p>
                              <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${stateTone}`}>
                                {state === "paid" ? "e paguar" : state === "overdue" ? "vonuar" : "në pritje"}
                              </span>
                            </div>
                            <p className="mt-1 text-[var(--pm-text-secondary)]">
                              {formatCurrency(charge.amount, charge.currency)} | Afati{" "}
                              {new Date(charge.dueDate).toLocaleDateString()}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-xs text-[var(--pm-text-secondary)]">
                      Nuk ka historik detyrimesh për këtë apartament.
                    </p>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <h4 className="text-sm font-semibold text-[var(--pm-text-primary)]">
                    Historiku i Pagesave të Qiramarrësit
                  </h4>
                  {tenantId && paymentHistory.length > 0 ? (
                    <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
                      {paymentHistory.map((payment) => (
                        <li
                          key={payment.id}
                          className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-[var(--pm-text-primary)] capitalize">
                              pagesë me {payment.method}
                            </p>
                            <p className="font-semibold text-[var(--pm-text-primary)]">
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                          </div>
                          <p className="mt-1 text-[var(--pm-text-secondary)]">
                            Data {new Date(payment.date).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-xs text-[var(--pm-text-secondary)]">
                      Nuk ka historik pagesash për këtë apartament.
                    </p>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
