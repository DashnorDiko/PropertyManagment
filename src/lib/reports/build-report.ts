import { chargeSchedules, payments, properties, tenancies, tenants } from "@/lib/data/mock";
import { emptyCurrencyTotals, addToTotals } from "@/lib/domain/currency";
import { propertyOccupancyDays, tenantRevenue } from "@/lib/domain/statistics";

export function buildMonthlyReportData() {
  const totals = chargeSchedules.reduce(
    (acc, charge) => addToTotals(acc, charge.amount, charge.currency),
    emptyCurrencyTotals(),
  );

  return {
    period: "monthly",
    totals,
    properties: properties.map((property) => ({
      id: property.id,
      apartmentName: property.apartmentName,
      registrationDate: property.registrationDate,
      totalHistoricalTenants: tenancies.filter((item) => item.propertyId === property.id).length,
      occupancy: propertyOccupancyDays(property, tenancies),
    })),
    tenantStats: tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      revenue: tenantRevenue(payments, tenant.id),
      paymentCount: payments.filter((payment) => payment.tenantId === tenant.id).length,
    })),
  };
}

export function buildYearlyReportData() {
  const monthly = buildMonthlyReportData();
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
