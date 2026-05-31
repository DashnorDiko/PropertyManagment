import { formatCurrency } from "@/lib/domain/currency";
import { getPaymentState } from "@/lib/domain/payment-status";
import type { ChargeSchedule, Property, Tenant } from "@/lib/domain/types";

export function OccupiedPropertyCard({
  property,
  tenant,
  charges,
}: {
  property: Property;
  tenant?: Tenant;
  charges: ChargeSchedule[];
}) {
  const paymentStates = charges.map((charge) =>
    getPaymentState({
      dueDate: charge.dueDate,
      paidAt: charge.paidAt,
    }),
  );
  const hasOverdue = paymentStates.includes("overdue");
  const allPaid = paymentStates.length > 0 && paymentStates.every((state) => state === "paid");
  const cardTone = hasOverdue
    ? "border-[var(--pm-danger-strong)]/35 ring-1 ring-[var(--pm-danger-strong)]/15"
    : "border-[var(--pm-border)]/80";
  const statusTone = allPaid
    ? "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
    : hasOverdue
      ? "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)]"
      : "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)]";
  const statusLabel = allPaid ? "Të gjitha të paguara" : hasOverdue ? "Vonuar" : "Në pritje";

  return (
    <article className={`rounded-xl border bg-[var(--pm-surface)] shadow-sm ${cardTone}`}>
      <header className="border-b border-[var(--pm-border)]/60 px-4 py-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-[var(--pm-text-primary)]">
            {property.apartmentName}
          </h3>
          <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusTone}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-[var(--pm-text-secondary)]">{property.subtitle}</p>
        <p className="mt-1 text-sm text-[var(--pm-text-secondary)]">
          Qiramarrësi: {tenant?.name ?? "Pa caktuar"}
        </p>
      </header>
      <ul className="space-y-2 bg-[var(--pm-surface-soft)] px-4 py-4">
        {charges.map((charge) => {
          const state = getPaymentState({
            dueDate: charge.dueDate,
            paidAt: charge.paidAt,
          });
          const dotTone =
            state === "paid"
              ? "bg-[var(--pm-accent)]"
              : state === "overdue"
                ? "bg-[var(--pm-danger-strong)]"
                : "bg-[var(--pm-info-strong)]/40";
          return (
            <li
              key={charge.id}
              className="flex items-center justify-between rounded-lg border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] px-3 py-2 text-sm"
            >
              <div>
                <p className="text-sm font-medium text-[var(--pm-text-primary)] capitalize">
                  {charge.chargeType}
                </p>
                <p className="text-xs text-[var(--pm-text-secondary)]">{charge.monthLabel}</p>
              </div>
              <div className="flex items-center gap-2 text-right">
                <p className="text-sm font-semibold text-[var(--pm-text-primary)]">
                  {formatCurrency(charge.amount, charge.currency)}
                </p>
                <span className={`h-2.5 w-2.5 rounded-full ${dotTone}`} />
              </div>
            </li>
          );
        })}
      </ul>
      <footer className="border-t border-[var(--pm-border)]/60 px-4 py-3">
        <button
          type="button"
          className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-2 text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-muted)] hover:text-[var(--pm-text-primary)]"
        >
          {allPaid ? "Shiko Detajet" : "Paguaj Tani"}
        </button>
      </footer>
    </article>
  );
}
