import { formatCurrency } from "@/lib/domain/currency";
import { getPaymentState, paymentStateColor } from "@/lib/domain/payment-status";
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

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h3 className="text-base font-semibold text-slate-900">
          {property.apartmentName}
        </h3>
        <p className="text-sm text-slate-500">{property.subtitle}</p>
        <p className="mt-1 text-sm text-slate-700">
          Tenant: {tenant?.name ?? "Unassigned"}
        </p>
      </header>
      <ul className="space-y-2">
        {charges.map((charge) => {
          const state = getPaymentState({
            dueDate: charge.dueDate,
            paidAt: charge.paidAt,
          });
          return (
            <li
              key={charge.id}
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 capitalize">
                  {charge.chargeType}
                </p>
                <p className="text-xs text-slate-500">{charge.monthLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(charge.amount, charge.currency)}
                </p>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentStateColor(
                    state,
                  )}`}
                >
                  {state}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
