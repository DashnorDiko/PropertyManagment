export type Currency = "EUR" | "ALL";

export type PropertyStatus = "occupied" | "empty" | "sold";

export type ChargeType = "rent" | "administration" | "parking" | "internet";

export type PaymentMethod = "cash" | "bank";

export interface Property {
  id: string;
  apartmentName: string;
  subtitle: string;
  status: PropertyStatus;
  registrationDate: string;
  buyerName?: string;
  documentUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
}

export interface Tenancy {
  id: string;
  propertyId: string;
  tenantId: string;
  leaseStart: string;
  leaseEnd?: string;
}

export interface ChargeSchedule {
  id: string;
  propertyId: string;
  tenantId?: string;
  chargeType: ChargeType;
  dueDate: string;
  monthLabel: string;
  amount: number;
  currency: Currency;
  paidAt?: string;
}

export interface Payment {
  id: string;
  date: string;
  method: PaymentMethod;
  amount: number;
  currency: Currency;
  tenantId?: string;
  propertyId?: string;
  chargeType?: ChargeType;
  coveredMonth?: string; // Format: YYYY-MM
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  accessCardNumber: string;
  personName: string;
  tenantId?: string;
  rentAmount: number;
  currency: Currency;
}

export interface InternetAccount {
  id: string;
  accountNumber: string;
  personName: string;
  tenantId?: string;
  rentAmount: number;
  currency: Currency;
}

export interface ManagerSettings {
  administrationFee: number;
  administrationCurrency: Currency;
}
