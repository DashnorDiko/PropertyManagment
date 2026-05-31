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

export const properties: Property[] = [];
export const tenants: Tenant[] = [];
export const tenancies: Tenancy[] = [];
export const chargeSchedules: ChargeSchedule[] = [];
export const payments: Payment[] = [];
export const parkingSpots: ParkingSpot[] = [];
export const internetAccounts: InternetAccount[] = [];

export const managerSettings: ManagerSettings = {
  administrationFee: 0,
  administrationCurrency: "ALL",
};

export function getActiveTenancyForProperty(propertyId: string) {
  return tenancies.find(
    (tenancy) => tenancy.propertyId === propertyId && !tenancy.leaseEnd,
  );
}

export function getTenantById(tenantId?: string) {
  if (!tenantId) {
    return undefined;
  }

  return tenants.find((tenant) => tenant.id === tenantId);
}
