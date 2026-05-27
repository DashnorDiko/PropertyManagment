"use client";

import { useState } from "react";

import {
  chargeSchedules,
  getActiveTenancyForProperty,
  getGlobalRevenue,
  getTenantById,
  payments,
  properties,
} from "@/lib/data/mock";
import { ApartmentInfoModal } from "@/components/status/ApartmentInfoModal";
import { BulkPayModal } from "@/components/status/BulkPayModal";
import { formatCurrency } from "@/lib/domain/currency";
import { getPaymentState } from "@/lib/domain/payment-status";
import { buildPortfolioStats, calculateReportStatistics } from "@/lib/domain/statistics";

type RowStatus = "overdue" | "pending" | "clear";
type StatusFilter = "all" | RowStatus;
type StatusSort = "none" | "asc" | "desc";

export default function StatusPage() {
  const portfolioStats = buildPortfolioStats(properties);
  const scheduleStats = calculateReportStatistics(
    chargeSchedules.map((charge) => ({
      amount: charge.amount,
      currency: charge.currency,
      paidAt: charge.paidAt,
    })),
  );
  const rentVolume = getGlobalRevenue();
  const now = new Date();
  const inSevenDays = new Date(now);
  inSevenDays.setDate(now.getDate() + 7);
  const apartmentRows = properties
    .filter((property) => property.status === "occupied")
    .map((property) => {
    const tenancy = getActiveTenancyForProperty(property.id);
    const tenant = getTenantById(tenancy?.tenantId);
    const tenantId = tenancy?.tenantId;
    const charges = chargeSchedules.filter((charge) => charge.propertyId === property.id);
    const unpaidCharges = charges.filter((charge) => !charge.paidAt);
    const hasOverdue = unpaidCharges.some(
      (charge) =>
        getPaymentState({
          dueDate: charge.dueDate,
          paidAt: charge.paidAt,
        }) === "overdue",
    );
    const rowState: RowStatus =
      hasOverdue ? "overdue" : unpaidCharges.length > 0 ? "pending" : "clear";

      return {
        propertyId: property.id,
        unit: property.apartmentName,
        subtitle: property.subtitle,
        status: property.status,
        tenantId,
        tenant: tenant?.name ?? "Unassigned",
        charges,
        unpaidCharges,
        tenantChargeHistory: charges
          .filter((charge) => (tenantId ? charge.tenantId === tenantId : false))
          .toSorted((left, right) => right.dueDate.localeCompare(left.dueDate)),
        tenantPaymentHistory: payments
          .filter(
            (payment) => payment.propertyId === property.id && (tenantId ? payment.tenantId === tenantId : false),
          )
          .toSorted((left, right) => right.date.localeCompare(left.date)),
        rowState,
      };
    });
  const allUnpaidCharges = apartmentRows.flatMap((row) => row.unpaidCharges);
  const overdueCharges = allUnpaidCharges.filter(
    (charge) =>
      getPaymentState({
        dueDate: charge.dueDate,
        paidAt: charge.paidAt,
      }) === "overdue",
  );
  const overdueStats = calculateReportStatistics(
    overdueCharges.map((charge) => ({
      amount: charge.amount,
      currency: charge.currency,
      paidAt: charge.paidAt,
    })),
  );
  const dueSoonCharges = allUnpaidCharges.filter((charge) => {
    const dueDate = new Date(charge.dueDate);
    return dueDate >= now && dueDate <= inSevenDays;
  });
  const dueSoonStats = calculateReportStatistics(
    dueSoonCharges.map((charge) => ({
      amount: charge.amount,
      currency: charge.currency,
      paidAt: charge.paidAt,
    })),
  );
  const oldestOverdueDays = overdueCharges.length
    ? Math.max(
        ...overdueCharges.map((charge) =>
          Math.max(0, Math.floor((now.getTime() - new Date(charge.dueDate).getTime()) / 86400000)),
        ),
      )
    : 0;
  const occupiedUnitsWithUnpaid = apartmentRows.filter((row) => row.unpaidCharges.length > 0).length;
  const occupiedUnitsWithOverdue = apartmentRows.filter((row) => row.rowState === "overdue").length;
  const collectionRate = scheduleStats.count
    ? Math.round((scheduleStats.paidCount / scheduleStats.count) * 100)
    : 0;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statusSort, setStatusSort] = useState<StatusSort>("none");

  const filteredRows =
    statusFilter === "all"
      ? apartmentRows
      : apartmentRows.filter((row) => row.rowState === statusFilter);

  const visibleApartmentRows = (() => {
    if (statusSort === "none") {
      return filteredRows;
    }

    const rankMap: Record<RowStatus, number> = {
      overdue: 0,
      pending: 1,
      clear: 2,
    };
    const direction = statusSort === "asc" ? 1 : -1;

    return [...filteredRows].sort(
      (left, right) => (rankMap[left.rowState] - rankMap[right.rowState]) * direction,
    );
  })();

  const toggleStatusSort = () => {
    setStatusSort((current) => {
      if (current === "none") return "asc";
      if (current === "asc") return "desc";
      return "none";
    });
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Collection Rate</p>
          <p className="mt-1 text-3xl font-bold text-[var(--pm-text-primary)]">{collectionRate}%</p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            {scheduleStats.paidCount} paid out of {scheduleStats.count} total charges
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Overdue Exposure</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(overdueStats.unpaidTotals.EUR, "EUR")} /{" "}
            {formatCurrency(overdueStats.unpaidTotals.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            {overdueCharges.length} overdue charges across {occupiedUnitsWithOverdue} occupied units
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Unpaid Now</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(scheduleStats.unpaidTotals.EUR, "EUR")} /{" "}
            {formatCurrency(scheduleStats.unpaidTotals.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            {allUnpaidCharges.length} unpaid charges in {occupiedUnitsWithUnpaid} occupied units
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Due In 7 Days</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(dueSoonStats.unpaidTotals.EUR, "EUR")} /{" "}
            {formatCurrency(dueSoonStats.unpaidTotals.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">{dueSoonCharges.length} charges due soon</p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Oldest Overdue</p>
          <p className="mt-1 text-3xl font-bold text-[var(--pm-text-primary)]">{oldestOverdueDays} days</p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            Longest outstanding item age
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Expected Rent Volume</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(rentVolume.EUR, "EUR")} / {formatCurrency(rentVolume.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            Occupied units: {portfolioStats.occupied}
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-3xl border border-[var(--pm-border)] bg-[var(--pm-surface)] shadow-sm">
        <header className="flex items-center justify-between border-b border-[var(--pm-border)] bg-[var(--pm-surface)] px-6 py-4">
          <h3 className="text-2xl font-semibold text-[var(--pm-text-primary)]">Apartment Charges</h3>
          <span className="rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--pm-text-secondary)]">
            Basic Statistics
          </span>
        </header>

        <div className="border-b border-[var(--pm-border)]/70 bg-[var(--pm-surface)] px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "overdue", "pending", "clear"] as const).map((option) => {
              const isActive = statusFilter === option;
              const label =
                option === "all" ? "All" : option === "clear" ? "Up to date" : option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-medium capitalize transition",
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-[var(--pm-border)] bg-[var(--pm-surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--pm-text-secondary)]">
                <th className="px-6 py-3">Unit</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Charges (Unpaid)</th>
                <th className="px-6 py-3">
                  <button
                    type="button"
                    onClick={toggleStatusSort}
                    className="inline-flex items-center gap-1 transition hover:text-[var(--pm-text-primary)]"
                  >
                    Status
                    <span className="text-[10px]">
                      {statusSort === "asc" ? "▲" : statusSort === "desc" ? "▼" : "↕"}
                    </span>
                  </button>
                </th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[var(--pm-text-primary)]">
              {visibleApartmentRows.map((row) => {
                const statusClass =
                  row.rowState === "overdue"
                      ? "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)]"
                      : row.rowState === "pending"
                        ? "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)]"
                        : "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]";
                return (
                  <tr
                    key={row.propertyId}
                    className="border-b border-[var(--pm-border)]/60 align-top hover:bg-[var(--pm-surface-soft)]"
                  >
                    <td className="px-6 py-3 font-medium">{row.unit}</td>
                    <td className="px-6 py-3">{row.tenant}</td>
                    <td className="px-6 py-3">
                      {row.unpaidCharges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {row.unpaidCharges.map((charge) => {
                            const chargeState = getPaymentState({
                              dueDate: charge.dueDate,
                              paidAt: charge.paidAt,
                            });
                            const chipTone =
                              chargeState === "paid"
                                ? "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                                : chargeState === "overdue"
                                  ? "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)]"
                                  : "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)]";
                            return (
                              <span
                                key={charge.id}
                                className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${chipTone}`}
                                title={formatCurrency(charge.amount, charge.currency)}
                              >
                                {charge.chargeType} {charge.monthLabel}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[var(--pm-text-secondary)]">No unpaid charges</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass}`}>
                        {row.rowState === "clear" ? "up to date" : row.rowState}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {row.unpaidCharges.length > 0 ? (
                          <BulkPayModal schedules={row.charges} />
                        ) : (
                          <span className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-2 text-xs text-[var(--pm-text-secondary)]">
                            Pay
                          </span>
                        )}
                        <ApartmentInfoModal
                          apartmentName={row.unit}
                          apartmentSubtitle={row.subtitle}
                          apartmentStatus={row.status}
                          tenantId={row.tenantId}
                          tenantName={row.tenant}
                          chargeHistory={row.tenantChargeHistory}
                          paymentHistory={row.tenantPaymentHistory}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleApartmentRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-sm text-[var(--pm-text-secondary)]">
                    No apartments match this status filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
