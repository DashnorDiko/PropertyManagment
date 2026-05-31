import { emptyCurrencyTotals, addToTotals } from "@/lib/domain/currency";
import { listPaymentLogs } from "@/lib/data/payment-logs";
import { listProperties } from "@/lib/data/properties";

export async function buildMonthlyReportData() {
  const [properties, payments] = await Promise.all([
    listProperties(),
    listPaymentLogs(),
  ]);

  const totals = payments.reduce(
    (acc, payment) => addToTotals(acc, payment.amount, payment.currency),
    emptyCurrencyTotals(),
  );

  const occupiedProperties = properties.filter((property) => property.status === "occupied");

  return {
    period: "monthly",
    totals,
    properties: properties.map((property) => ({
      id: property.id,
      apartmentName: property.unitName,
      registrationDate: "N/A",
      totalHistoricalTenants: property.tenantName ? 1 : 0,
      occupancy: {
        occupiedDays: property.status === "occupied" ? 1 : 0,
        emptyDays: property.status === "occupied" ? 0 : 1,
      },
    })),
    tenantStats: occupiedProperties
      .filter((property) => property.tenantName.trim().length > 0)
      .map((property) => {
        const tenantPayments = payments.filter(
          (payment) =>
            payment.propertyId === property.id &&
            payment.tenantId === undefined,
        );
        const revenue = tenantPayments.reduce(
          (acc, payment) => addToTotals(acc, payment.amount, payment.currency),
          emptyCurrencyTotals(),
        );

        return {
          id: property.id,
          name: property.tenantName,
          revenue,
          paymentCount: tenantPayments.length,
        };
      }),
  };
}

export async function buildYearlyReportData() {
  const monthly = await buildMonthlyReportData();
  return {
    period: "yearly",
    totals: {
      EUR: Number((monthly.totals.EUR * 12).toFixed(2)),
      ALL: Number((monthly.totals.ALL * 12).toFixed(2)),
    },
    properties: monthly.properties,
    tenantStats: monthly.tenantStats,
  };
}
