import { addMonths, format, subMonths } from "date-fns";

import { monthlyRentVolume, tenantRevenue } from "@/lib/domain/statistics";
import type {
  ChargeSchedule,
  InternetAccount,
  ManagerSettings,
  ParkingSpot,
  Payment,
  Property,
  Tenant,
  Tenancy,
} from "@/lib/domain/types";

export const properties: Property[] = [
  {
    id: "p1",
    apartmentName: "Apt 1",
    subtitle: "Building A, Staircase 1, Floor 2",
    status: "occupied",
    registrationDate: "2024-01-01",
    documentUrl: "https://example.com/documents/p1",
  },
  {
    id: "p2",
    apartmentName: "Apt 2",
    subtitle: "Building A, Staircase 1, Floor 3",
    status: "empty",
    registrationDate: "2024-03-01",
  },
  {
    id: "p3",
    apartmentName: "Apt 3",
    subtitle: "Building B, Staircase 2, Floor 1",
    status: "sold",
    registrationDate: "2023-09-10",
    buyerName: "Ardit Kola",
  },
];

export const tenants: Tenant[] = [
  { id: "t1", name: "Elira Hoxha" },
  { id: "t2", name: "Blerim Dauti" },
];

export const tenancies: Tenancy[] = [
  {
    id: "tn1",
    propertyId: "p1",
    tenantId: "t1",
    leaseStart: "2024-01-15",
  },
  {
    id: "tn2",
    propertyId: "p1",
    tenantId: "t2",
    leaseStart: "2023-03-01",
    leaseEnd: "2023-12-31",
  },
];

const now = new Date();
const dueMonths = [subMonths(now, 1), now, addMonths(now, 1)];

export const chargeSchedules: ChargeSchedule[] = dueMonths.flatMap((month, idx) => [
  {
    id: `rent-${idx}`,
    propertyId: "p1",
    tenantId: "t1",
    chargeType: "rent",
    dueDate: month.toISOString(),
    monthLabel: format(month, "MMMM yyyy"),
    amount: 350,
    currency: "EUR",
    paidAt: idx === 1 ? now.toISOString() : undefined,
  },
  {
    id: `admin-${idx}`,
    propertyId: "p1",
    tenantId: "t1",
    chargeType: "administration",
    dueDate: month.toISOString(),
    monthLabel: format(month, "MMMM yyyy"),
    amount: 3000,
    currency: "ALL",
    paidAt: idx === 1 ? now.toISOString() : undefined,
  },
  {
    id: `parking-${idx}`,
    propertyId: "p1",
    tenantId: "t1",
    chargeType: "parking",
    dueDate: month.toISOString(),
    monthLabel: format(month, "MMMM yyyy"),
    amount: 40,
    currency: "EUR",
    paidAt: idx === 1 ? now.toISOString() : undefined,
  },
]);

export const payments: Payment[] = [
  {
    id: "pay-1",
    date: subMonths(now, 1).toISOString(),
    method: "bank",
    amount: 390,
    currency: "EUR",
    tenantId: "t1",
    propertyId: "p1",
  },
  {
    id: "pay-2",
    date: now.toISOString(),
    method: "cash",
    amount: 3000,
    currency: "ALL",
    tenantId: "t1",
    propertyId: "p1",
  },
];

export const parkingSpots: ParkingSpot[] = [
  {
    id: "pk1",
    spotNumber: "P-12",
    accessCardNumber: "AC-1022",
    personName: "Elira Hoxha",
    tenantId: "t1",
    rentAmount: 40,
    currency: "EUR",
  },
  {
    id: "pk2",
    spotNumber: "P-13",
    accessCardNumber: "AC-2211",
    personName: "Erion Kasa",
    rentAmount: 5000,
    currency: "ALL",
  },
];

export const internetAccounts: InternetAccount[] = [
  {
    id: "in1",
    accountNumber: "INT-100",
    personName: "Elira Hoxha",
    tenantId: "t1",
    rentAmount: 20,
    currency: "EUR",
  },
  {
    id: "in2",
    accountNumber: "INT-101",
    personName: "Lina Bega",
    rentAmount: 2000,
    currency: "ALL",
  },
];

export const managerSettings: ManagerSettings = {
  administrationFee: 3000,
  administrationCurrency: "ALL",
};

export function getActiveTenancyForProperty(propertyId: string) {
  return tenancies.find((tenancy) => tenancy.propertyId === propertyId && !tenancy.leaseEnd);
}

export function getTenantById(tenantId?: string) {
  if (!tenantId) {
    return undefined;
  }
  return tenants.find((tenant) => tenant.id === tenantId);
}

export function getOccupiedDashboardCards() {
  return properties
    .filter((property) => property.status === "occupied")
    .map((property) => {
      const tenancy = getActiveTenancyForProperty(property.id);
      const tenant = getTenantById(tenancy?.tenantId);
      const charges = chargeSchedules.filter((charge) => charge.propertyId === property.id);
      return { property, tenancy, tenant, charges };
    });
}

export function getTenantStats(tenantId: string) {
  return {
    payments: payments.filter((payment) => payment.tenantId === tenantId),
    totalRevenue: tenantRevenue(payments, tenantId),
  };
}

export function getGlobalRevenue() {
  return monthlyRentVolume(chargeSchedules);
}
