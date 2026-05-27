import { BulkPayModal } from "@/components/payments/BulkPayModal";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { chargeSchedules } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/domain/currency";

export default function PaymentsPage() {
  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Payments"
        description="Manual payment entry and multi-month payment processing."
      />
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Manual Input</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="text-sm text-slate-700">
            Property
            <input className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Tenant
            <input className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm text-slate-700">
            Payment Method
            <select className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Amount
            <input
              type="number"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Currency
            <select className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
              <option value="EUR">EUR</option>
              <option value="ALL">ALL</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Payment Date
            <input
              type="date"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 md:w-fit"
          >
            Record Payment
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Pending Charges</h3>
          <BulkPayModal schedules={chargeSchedules} />
        </div>
        <ul className="mt-4 space-y-2">
          {chargeSchedules
            .filter((item) => !item.paidAt)
            .map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="capitalize">
                  {item.chargeType} - {item.monthLabel}
                </span>
                <span className="font-medium">
                  {formatCurrency(item.amount, item.currency)}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
