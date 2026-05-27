import { differenceInDays, max, min, parseISO } from "date-fns";

import {
  addToTotals,
  createCurrencyTotals,
  emptyCurrencyTotals,
  type Currency,
  type CurrencyTotals,
} from "./currency";
import type {
  ChargeSchedule,
  Payment,
  Property,
  PropertyStatus,
  Tenancy,
} from "./types";

export interface ReportPayment {
  amount: number;
  currency: Currency;
  paidAt?: string | null;
}

export interface ReportStatistics {
  count: number;
  paidCount: number;
  unpaidCount: number;
  totals: CurrencyTotals;
  paidTotals: CurrencyTotals;
  unpaidTotals: CurrencyTotals;
}

function addAmount(totals: CurrencyTotals, currency: Currency, amount: number): void {
  totals[currency] += amount;
}

function roundTotals(totals: CurrencyTotals): CurrencyTotals {
  return {
    EUR: Math.round(totals.EUR * 100) / 100,
    ALL: Math.round(totals.ALL * 100) / 100,
  };
}

export function calculateReportStatistics(payments: ReportPayment[]): ReportStatistics {
  const totals = createCurrencyTotals();
  const paidTotals = createCurrencyTotals();
  const unpaidTotals = createCurrencyTotals();

  let paidCount = 0;

  for (const payment of payments) {
    addAmount(totals, payment.currency, payment.amount);

    if (payment.paidAt) {
      paidCount += 1;
      addAmount(paidTotals, payment.currency, payment.amount);
      continue;
    }

    addAmount(unpaidTotals, payment.currency, payment.amount);
  }

  return {
    count: payments.length,
    paidCount,
    unpaidCount: payments.length - paidCount,
    totals: roundTotals(totals),
    paidTotals: roundTotals(paidTotals),
    unpaidTotals: roundTotals(unpaidTotals),
  };
}

export function buildPortfolioStats(properties: Property[]) {
  return {
    totalProperties: properties.length,
    occupied: properties.filter((property) => property.status === "occupied").length,
    empty: properties.filter((property) => property.status === "empty").length,
  };
}

export function monthlyRentVolume(charges: ChargeSchedule[]) {
  return charges
    .filter((charge) => charge.chargeType === "rent")
    .reduce((acc, item) => addToTotals(acc, item.amount, item.currency), emptyCurrencyTotals());
}

export function tenantRevenue(payments: Payment[], tenantId: string) {
  return payments
    .filter((payment) => payment.tenantId === tenantId)
    .reduce(
      (acc, payment) => addToTotals(acc, payment.amount, payment.currency),
      emptyCurrencyTotals(),
    );
}

export function propertyOccupancyDays(
  property: Property,
  tenancies: Tenancy[],
  untilDate: Date = new Date(),
) {
  const propertyTenancies = tenancies.filter((tenancy) => tenancy.propertyId === property.id);
  if (!propertyTenancies.length) {
    return { occupiedDays: 0, emptyDays: 0 };
  }

  const registration = parseISO(property.registrationDate);
  const occupiedDays = propertyTenancies.reduce((sum, tenancy) => {
    const start = parseISO(tenancy.leaseStart);
    const end = tenancy.leaseEnd ? parseISO(tenancy.leaseEnd) : untilDate;
    return sum + Math.max(0, differenceInDays(end, start));
  }, 0);

  const timelineStart = min([registration, ...propertyTenancies.map((tenancy) => parseISO(tenancy.leaseStart))]);
  const timelineEnd = max([
    untilDate,
    ...propertyTenancies.map((tenancy) => (tenancy.leaseEnd ? parseISO(tenancy.leaseEnd) : untilDate)),
  ]);
  const totalDays = Math.max(0, differenceInDays(timelineEnd, timelineStart));

  return {
    occupiedDays,
    emptyDays: Math.max(0, totalDays - occupiedDays),
  };
}

export function propertyStatusColor(status: PropertyStatus): string {
  switch (status) {
    case "sold":
      return "bg-gray-200 text-gray-700";
    case "empty":
      return "bg-yellow-200 text-yellow-900";
    case "occupied":
      return "bg-green-200 text-green-900";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
