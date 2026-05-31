"use client";

import { useEffect, useState } from "react";

import { ManagerContentSkeleton } from "@/components/layout/ManagerContentSkeleton";
import { ApartmentInfoModal } from "@/components/status/ApartmentInfoModal";
import { BulkPayModal } from "@/components/status/BulkPayModal";
import { addToTotals, createCurrencyTotals, formatCurrency } from "@/lib/domain/currency";
import { formatMonthYearLabelSq } from "@/lib/domain/date-format";
import type { ChargeSchedule, ChargeType, Payment } from "@/lib/domain/types";

type RowStatus = "pending" | "clear";
type StatusFilter = "all" | RowStatus;
type StatusTab = "apartments" | "parking" | "internet";

type PropertyStatusRow = {
  id: string;
  apartmentName: string;
  subtitle: string;
  status: "occupied" | "empty" | "sold";
  tenantName: string;
  rentAmount: number;
  rentCurrency: "EUR" | "ALL";
};

type ParkingStatusRow = {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  price: number;
};

type InternetStatusRow = {
  id: string;
  serviceCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  price: number;
};

type PropertyApiRow = {
  id: string;
  unitName: string;
  locationSubtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenantName: string;
  rentAmount?: number;
  rentCurrency: "EUR" | "ALL";
};

type ParkingApiRow = {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  price: number;
};

type InternetApiRow = {
  id: string;
  serviceCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  price: number;
};

type ManagerSettingsApiRow = {
  administrationFee: number;
  administrationCurrency: "EUR" | "ALL";
};

type PaymentApiRow = Payment;

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function chargeTypeLabel(type: string): string {
  switch (type) {
    case "rent":
      return "Qira";
    case "administration":
      return "Administrim";
    case "parking":
      return "Parkim";
    case "internet":
      return "Internet";
    default:
      return type;
  }
}

function getRowState(charges: ChargeSchedule[]): RowStatus {
  return charges.length > 0 ? "pending" : "clear";
}

function serviceTagTone(active: boolean): string {
  return active
    ? "border-[var(--pm-accent)] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
    : "border-[var(--pm-border)] bg-[var(--pm-surface-soft)] text-[var(--pm-text-secondary)]";
}

export default function StatusPage() {
  const [loggedPayments, setLoggedPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTab>("apartments");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<PropertyStatusRow[]>([]);
  const [parkingServices, setParkingServices] = useState<ParkingStatusRow[]>([]);
  const [internetServices, setInternetServices] = useState<InternetStatusRow[]>([]);
  const [managerSettings, setManagerSettings] = useState<ManagerSettingsApiRow>({
    administrationFee: 0,
    administrationCurrency: "ALL",
  });
  const [paymentsFromDb, setPaymentsFromDb] = useState<Payment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        const [
          propertiesResponse,
          parkingResponse,
          internetResponse,
          managerSettingsResponse,
          paymentLogsResponse,
        ] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/parking"),
          fetch("/api/internet"),
          fetch("/api/manager-settings"),
          fetch("/api/payment-logs"),
        ]);

        if (
          !propertiesResponse.ok ||
          !parkingResponse.ok ||
          !internetResponse.ok ||
          !managerSettingsResponse.ok
          || !paymentLogsResponse.ok
        ) {
          return;
        }

        const [
          propertiesBody,
          parkingBody,
          internetBody,
          managerSettingsBody,
          paymentLogsBody,
        ] = await Promise.all([
          propertiesResponse.json() as Promise<{ data?: PropertyApiRow[] }>,
          parkingResponse.json() as Promise<{ data?: ParkingApiRow[] }>,
          internetResponse.json() as Promise<{ data?: InternetApiRow[] }>,
          managerSettingsResponse.json() as Promise<{ data?: ManagerSettingsApiRow }>,
          paymentLogsResponse.json() as Promise<{ data?: PaymentApiRow[] }>,
        ]);

        if (isCancelled) {
          return;
        }

        setProperties(
          (propertiesBody.data ?? []).map((property) => ({
            id: property.id,
            apartmentName: property.unitName,
            subtitle: property.locationSubtitle,
            status: property.status === "vacant" ? "empty" : property.status,
            tenantName: property.tenantName,
            rentAmount: property.rentAmount ?? 0,
            rentCurrency: property.rentCurrency,
          })),
        );
        setParkingServices(parkingBody.data ?? []);
        setInternetServices(internetBody.data ?? []);
        if (managerSettingsBody.data) {
          setManagerSettings(managerSettingsBody.data);
        }
        setPaymentsFromDb(paymentLogsBody.data ?? []);
      } catch {
        // Keep empty-state fallback on dashboard if data fetch fails.
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const portfolioStats = {
    totalProperties: properties.length,
    occupied: properties.filter((property) => property.status === "occupied").length,
    empty: properties.filter((property) => property.status === "empty").length,
  };

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthKey = now.toISOString().slice(0, 7);
  const currentMonthLabel = formatMonthYearLabelSq(now);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase();
  const paymentLedger = [...paymentsFromDb, ...loggedPayments];
  const coverageMap = new Map<string, string>();

  paymentLedger.forEach((payment) => {
    if (!payment.propertyId || !payment.chargeType || !payment.coveredMonth) {
      return;
    }
    const key = `${payment.propertyId}-${payment.chargeType}-${payment.coveredMonth}`;
    const existingDate = coverageMap.get(key);
    if (!existingDate || existingDate < payment.date) {
      coverageMap.set(key, payment.date);
    }
  });

  const monthsOfYear = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = new Date(Date.UTC(currentYear, monthIndex, 1));
    return {
      monthKey: `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`,
      monthLabel: formatMonthYearLabelSq(monthDate),
      dueDate: monthDate.toISOString(),
    };
  });

  const buildSchedules = (
    propertyId: string,
    tenantId: string | undefined,
    chargeType: ChargeType,
    amount: number,
    currency: "EUR" | "ALL",
  ): ChargeSchedule[] =>
    monthsOfYear.map((month) => ({
      id: `${propertyId}-${chargeType}-${month.monthKey}`,
      propertyId,
      tenantId,
      chargeType,
      dueDate: month.dueDate,
      monthLabel: month.monthLabel,
      amount,
      currency,
      paidAt: coverageMap.get(`${propertyId}-${chargeType}-${month.monthKey}`),
    }));

  const matchedParkingServiceIds = new Set<string>();
  const matchedInternetServiceIds = new Set<string>();

  const occupiedRows = properties
    .filter((property) => property.status === "occupied")
    .map((property) => {
      const tenantId = undefined;
      const normalizedTenantName = normalizeName(property.tenantName);
      const parkingPlan =
        normalizedTenantName.length > 0
          ? parkingServices.find(
              (spot) =>
                spot.status === "occupied" &&
                normalizeName(spot.assigneeName) === normalizedTenantName,
            )
          : undefined;
      const internetPlan =
        normalizedTenantName.length > 0
          ? internetServices.find(
              (service) =>
                service.status === "occupied" &&
                normalizeName(service.assigneeName) === normalizedTenantName,
            )
          : undefined;
      if (parkingPlan) {
        matchedParkingServiceIds.add(parkingPlan.id);
      }
      if (internetPlan) {
        matchedInternetServiceIds.add(internetPlan.id);
      }
      const rentSchedules = buildSchedules(
        property.id,
        tenantId,
        "rent",
        property.rentAmount,
        property.rentCurrency,
      );
      const adminSchedules = buildSchedules(
        property.id,
        tenantId,
        "administration",
        managerSettings.administrationFee,
        managerSettings.administrationCurrency,
      );
      const parkingSchedules = parkingPlan
        ? buildSchedules(property.id, tenantId, "parking", parkingPlan.price, "EUR")
        : [];
      const internetSchedules = internetPlan
        ? buildSchedules(property.id, tenantId, "internet", internetPlan.price, "EUR")
        : [];
      const charges = [...rentSchedules, ...adminSchedules, ...parkingSchedules, ...internetSchedules];
      const unpaidCharges = charges.filter((charge) => !charge.paidAt);
      const hasParkingService = parkingSchedules.length > 0;
      const hasInternetService = internetSchedules.length > 0;

      return {
        propertyId: property.id,
        unit: property.apartmentName,
        subtitle: property.subtitle,
        status: property.status,
        tenantId,
        tenant: property.tenantName || "Pa caktuar",
        charges,
        unpaidCharges,
        hasParkingService,
        hasInternetService,
        tenantChargeHistory: charges
          .filter((charge) => (tenantId ? charge.tenantId === tenantId : false))
          .toSorted((left, right) => right.dueDate.localeCompare(left.dueDate)),
        tenantPaymentHistory: paymentLedger
          .filter(
            (payment) => payment.propertyId === property.id && (tenantId ? payment.tenantId === tenantId : false),
          )
          .toSorted((left, right) => right.date.localeCompare(left.date)),
      };
    });

  const standaloneParkingRows = parkingServices
    .filter((service) => service.status === "occupied" && !matchedParkingServiceIds.has(service.id))
    .map((service) => {
      const charges = buildSchedules(service.id, undefined, "parking", service.price, "EUR");
      const unpaidCharges = charges.filter((charge) => !charge.paidAt);

      return {
        propertyId: service.id,
        unit: `Parkim ${service.spotCode}`,
        subtitle: service.assigneeType === "independent" ? "Shërbim i pavarur" : "Shërbim parkimi",
        status: "occupied" as const,
        tenantId: undefined,
        tenant: service.assigneeName || "Pa caktuar",
        charges,
        unpaidCharges,
        hasParkingService: true,
        hasInternetService: false,
        tenantChargeHistory: charges.toSorted((left, right) => right.dueDate.localeCompare(left.dueDate)),
        tenantPaymentHistory: paymentLedger
          .filter((payment) => payment.propertyId === service.id)
          .toSorted((left, right) => right.date.localeCompare(left.date)),
      };
    });

  const standaloneInternetRows = internetServices
    .filter((service) => service.status === "occupied" && !matchedInternetServiceIds.has(service.id))
    .map((service) => {
      const charges = buildSchedules(service.id, undefined, "internet", service.price, "EUR");
      const unpaidCharges = charges.filter((charge) => !charge.paidAt);

      return {
        propertyId: service.id,
        unit: `Internet ${service.serviceCode}`,
        subtitle: service.assigneeType === "independent" ? "Shërbim i pavarur" : "Shërbim interneti",
        status: "occupied" as const,
        tenantId: undefined,
        tenant: service.assigneeName || "Pa caktuar",
        charges,
        unpaidCharges,
        hasParkingService: false,
        hasInternetService: true,
        tenantChargeHistory: charges.toSorted((left, right) => right.dueDate.localeCompare(left.dueDate)),
        tenantPaymentHistory: paymentLedger
          .filter((payment) => payment.propertyId === service.id)
          .toSorted((left, right) => right.date.localeCompare(left.date)),
      };
    });

  const monthlyIncome = paymentLedger
    .filter((payment) => payment.date.slice(0, 7) === currentMonthKey)
    .reduce(
      (acc, payment) => {
        if (!payment.chargeType) {
          return acc;
        }
        if (payment.chargeType === "administration") {
          return acc;
        }
        if (payment.chargeType === "rent") {
          return {
            ...acc,
            apartments: addToTotals(acc.apartments, payment.amount, payment.currency),
          };
        }
        if (payment.chargeType === "parking") {
          return {
            ...acc,
            parking: addToTotals(acc.parking, payment.amount, payment.currency),
          };
        }
        if (payment.chargeType === "internet") {
          return {
            ...acc,
            internet: addToTotals(acc.internet, payment.amount, payment.currency),
          };
        }
        return acc;
      },
      {
        apartments: createCurrencyTotals(),
        parking: createCurrencyTotals(),
        internet: createCurrencyTotals(),
      },
    );

  const totalMonthlyIncome = {
    EUR: monthlyIncome.apartments.EUR + monthlyIncome.parking.EUR + monthlyIncome.internet.EUR,
    ALL: monthlyIncome.apartments.ALL + monthlyIncome.parking.ALL + monthlyIncome.internet.ALL,
  };
  const monthlyPaymentCount = paymentLedger.filter((payment) => payment.date.slice(0, 7) === currentMonthKey).length;

  const apartmentRows = occupiedRows.map((row) => {
    const tabSchedules = row.charges.filter(
      (charge) => charge.chargeType === "rent" || charge.chargeType === "administration",
    );
    const tabUnpaidCharges = tabSchedules.filter((charge) => !charge.paidAt);
    return {
      ...row,
      tabSchedules,
      tabUnpaidCharges,
      rowState: getRowState(tabUnpaidCharges),
    };
  });

  const parkingRows = [...occupiedRows, ...standaloneParkingRows]
    .map((row) => {
      const tabSchedules = row.charges.filter((charge) => charge.chargeType === "parking");
      const tabUnpaidCharges = tabSchedules.filter((charge) => !charge.paidAt);
      return {
        ...row,
        tabSchedules,
        tabUnpaidCharges,
        rowState: getRowState(tabUnpaidCharges),
      };
    })
    .filter((row) => row.tabSchedules.length > 0);

  const internetRows = [...occupiedRows, ...standaloneInternetRows]
    .map((row) => {
      const tabSchedules = row.charges.filter((charge) => charge.chargeType === "internet");
      const tabUnpaidCharges = tabSchedules.filter((charge) => !charge.paidAt);
      return {
        ...row,
        tabSchedules,
        tabUnpaidCharges,
        rowState: getRowState(tabUnpaidCharges),
      };
    })
    .filter((row) => row.tabSchedules.length > 0);

  const getSourceRowsForTab = (tab: StatusTab) =>
    tab === "apartments" ? apartmentRows : tab === "parking" ? parkingRows : internetRows;

  const getVisibleRowsForTab = (tab: StatusTab) => {
    const sourceRows = getSourceRowsForTab(tab);
    const filteredRows =
      statusFilter === "all"
        ? sourceRows
        : sourceRows.filter((row) => row.rowState === statusFilter);
    const searchedRows = normalizedSearch
      ? filteredRows.filter((row) => {
          const searchBlob = [
            row.unit,
            row.subtitle,
            row.tenant,
            ...row.tabUnpaidCharges.map((charge) => `${chargeTypeLabel(charge.chargeType)} ${charge.monthLabel}`),
          ]
            .join(" ")
            .toLocaleLowerCase();
          return searchBlob.includes(normalizedSearch);
        })
      : filteredRows;

    return searchedRows;
  };

  const tabOrder: StatusTab[] = ["apartments", "parking", "internet"];
  const activeTabIndex = tabOrder.indexOf(activeTab);
  const tabLabelMap: Record<StatusTab, string> = {
    apartments: "Detyrimet e Apartamenteve",
    parking: "Parkim",
    internet: "Internet",
  };
  const tabSearchPlaceholderMap: Record<StatusTab, string> = {
    apartments: "Kërko sipas njësisë, qiramarrësit ose detyrimit",
    parking: "Kërko sipas njësisë, qiramarrësit ose parkimit",
    internet: "Kërko sipas njësisë, qiramarrësit ose internetit",
  };

  if (isLoadingData) {
    return (
      <section className="space-y-6">
        <ManagerContentSkeleton />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Të ardhura Mujore - Apartamente</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(monthlyIncome.apartments.EUR, "EUR")} / {formatCurrency(monthlyIncome.apartments.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">Vetëm nga qiraja (pa administrim)</p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Të ardhura Mujore - Parkim</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(monthlyIncome.parking.EUR, "EUR")} / {formatCurrency(monthlyIncome.parking.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">Të ardhura vetëm nga parkimi</p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Të ardhura Mujore - Internet</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(monthlyIncome.internet.EUR, "EUR")} / {formatCurrency(monthlyIncome.internet.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">Të ardhura vetëm nga interneti</p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Njësi të Zëna</p>
          <p className="mt-1 text-3xl font-bold text-[var(--pm-text-primary)]">{portfolioStats.occupied}</p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">Nga {portfolioStats.totalProperties} njësi gjithsej</p>
        </article>
        <article className="rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">Totali i të Ardhurave Mujore</p>
          <p className="mt-1 text-lg font-bold text-[var(--pm-text-primary)]">
            {formatCurrency(totalMonthlyIncome.EUR, "EUR")} / {formatCurrency(totalMonthlyIncome.ALL, "ALL")}
          </p>
          <p className="mt-1 text-xs text-[var(--pm-text-secondary)]">
            {monthlyPaymentCount} pagesa të regjistruara këtë muaj
          </p>
        </article>
      </div>

      <article className="overflow-hidden rounded-3xl border border-[var(--pm-border)] bg-[var(--pm-surface)] shadow-sm">
        <header className="flex items-center justify-between border-b border-[var(--pm-border)] bg-[var(--pm-surface)] px-6 py-4">
          <h3 className="text-2xl font-semibold text-[var(--pm-text-primary)]">Detyrimet e Apartamenteve</h3>
          <span className="rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--pm-text-secondary)]">
            Statistika Bazë
          </span>
        </header>

        <div className="border-b border-[var(--pm-border)]/70 bg-[var(--pm-surface)] px-6 py-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {tabOrder.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    isActive
                      ? "border-[var(--pm-accent)] bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                      : "border-[var(--pm-border)] bg-[var(--pm-surface)] text-[var(--pm-text-secondary)] hover:bg-[var(--pm-surface-soft)]",
                  ].join(" ")}
                >
                  {tabLabelMap[tab]}
                </button>
              );
            })}
          </div>
          <div className="mb-3">
            <label className="relative block max-w-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--pm-text-secondary)]"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={tabSearchPlaceholderMap[activeTab]}
                className="w-full rounded-full border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] py-2 pl-9 pr-4 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/25 transition-all duration-200 focus:border-[var(--pm-accent)]/35 focus:bg-[var(--pm-surface)] focus:ring"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "pending", "clear"] as const).map((option) => {
              const isActive = statusFilter === option;
              const label =
                option === "all"
                  ? "Të gjitha"
                  : option === "clear"
                    ? "Në rregull"
                    : "Në pritje";

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

        <div className="overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeTabIndex * 100}%)` }}
          >
            {tabOrder.map((tab) => {
              const rows = getVisibleRowsForTab(tab);
              const allowedTypes: ChargeType[] =
                tab === "apartments"
                  ? ["rent", "administration"]
                  : tab === "parking"
                    ? ["parking"]
                    : ["internet"];

              return (
                <div key={tab} className="w-full shrink-0 overflow-x-auto">
                  <table className="min-w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--pm-border)] bg-[var(--pm-surface-soft)] text-xs font-semibold uppercase tracking-wide text-[var(--pm-text-secondary)]">
                        <th className="px-6 py-3">Njësia</th>
                        <th className="px-6 py-3">Qiramarrësi</th>
                        <th className="px-6 py-3">Paguar deri më</th>
                        <th className="px-6 py-3">{`Gjendja (${currentMonthLabel})`}</th>
                        <th className="px-6 py-3 text-right">Veprime</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-[var(--pm-text-primary)]">
                      {rows.map((row) => {
                        const hasAnySchedule = row.tabSchedules.length > 0;
                        const monthProgress = row.tabSchedules.reduce<
                          Map<string, { dueDateMs: number; total: number; paid: number }>
                        >((acc, schedule) => {
                          const monthKey = schedule.dueDate.slice(0, 7);
                          const dueDateMs = new Date(schedule.dueDate).getTime();
                          const current = acc.get(monthKey);

                          if (!current) {
                            acc.set(monthKey, {
                              dueDateMs,
                              total: 1,
                              paid: schedule.paidAt ? 1 : 0,
                            });
                            return acc;
                          }

                          current.total += 1;
                          if (schedule.paidAt) {
                            current.paid += 1;
                          }
                          if (dueDateMs > current.dueDateMs) {
                            current.dueDateMs = dueDateMs;
                          }
                          return acc;
                        }, new Map());
                        const fullyPaidMonths = [...monthProgress.values()].filter(
                          (month) => month.paid === month.total,
                        );
                        const unpaidMonthCount = [...monthProgress.values()].filter(
                          (month) => month.paid < month.total,
                        ).length;
                        const paidUntilDate =
                          fullyPaidMonths.length > 0
                            ? new Date(Math.max(...fullyPaidMonths.map((month) => month.dueDateMs)))
                            : null;
                        const paidUntilLabel = hasAnySchedule
                          ? paidUntilDate
                            ? formatMonthYearLabelSq(paidUntilDate)
                            : "Pa pagesë"
                          : "Pa shërbim";
                        const currentMonthProgress = monthProgress.get(currentMonthKey);
                        const isCurrentMonthPaid =
                          hasAnySchedule &&
                          currentMonthProgress !== undefined &&
                          currentMonthProgress.total > 0 &&
                          currentMonthProgress.paid === currentMonthProgress.total;
                        const statusClass = !hasAnySchedule
                          ? "bg-[var(--pm-surface-muted)] text-[var(--pm-text-secondary)]"
                          : isCurrentMonthPaid
                            ? "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)]"
                            : "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)]";
                        const statusLabel = !hasAnySchedule
                          ? "Pa shërbim"
                          : isCurrentMonthPaid
                            ? "Paguar"
                            : "Papaguar";
                        return (
                          <tr
                            key={`${tab}-${row.propertyId}`}
                            className="border-b border-[var(--pm-border)]/60 align-top hover:bg-[var(--pm-surface-soft)]"
                          >
                            <td className="px-6 py-3 font-medium">{row.unit}</td>
                            <td className="px-6 py-3">
                              <p>{row.tenant}</p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {tab === "apartments" ? (
                                  <>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceTagTone(row.hasParkingService)}`}
                                    >
                                      {row.hasParkingService ? "Ka parkim" : "Pa parkim"}
                                    </span>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceTagTone(row.hasInternetService)}`}
                                    >
                                      {row.hasInternetService ? "Ka internet" : "Pa internet"}
                                    </span>
                                  </>
                                ) : tab === "parking" ? (
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceTagTone(row.hasInternetService)}`}
                                  >
                                    {row.hasInternetService ? "Ka edhe internet" : "Pa internet"}
                                  </span>
                                ) : (
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${serviceTagTone(row.hasParkingService)}`}
                                  >
                                    {row.hasParkingService ? "Ka edhe parkim" : "Pa parkim"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <div>
                                <p className="font-medium capitalize text-[var(--pm-text-primary)]">{paidUntilLabel}</p>
                                <p className="text-xs text-[var(--pm-text-secondary)]">
                                  {unpaidMonthCount > 0
                                    ? `${unpaidMonthCount} muaj ende të papaguar`
                                    : "I përditësuar"}
                                </p>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                {row.tabUnpaidCharges.length > 0 ? (
                                  <BulkPayModal
                                    schedules={row.tabSchedules}
                                    allowedChargeTypes={allowedTypes}
                                    buttonLabel={
                                      tab === "apartments" ? "Paguaj" : tab === "parking" ? "Paguaj Parkimin" : "Paguaj Internetin"
                                    }
                                    onConfirmPayment={async (selectedSchedules, paymentDate) => {
                                      const newPayments: Payment[] = selectedSchedules.map((schedule, index) => ({
                                        id: `tmp-${schedule.id}-${Date.now()}-${index}`,
                                        date: paymentDate,
                                        method: "cash",
                                        amount: schedule.amount,
                                        currency: schedule.currency,
                                        tenantId: row.tenantId,
                                        propertyId: row.propertyId,
                                        chargeType: schedule.chargeType,
                                        coveredMonth: schedule.dueDate.slice(0, 7),
                                      }));

                                      setLoggedPayments((current) => [...current, ...newPayments]);

                                      try {
                                        const response = await fetch("/api/payment-logs", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify(
                                            newPayments.map((payment) => ({
                                              date: payment.date,
                                              method: payment.method,
                                              amount: payment.amount,
                                              currency: payment.currency,
                                              tenantId: payment.tenantId,
                                              propertyId: payment.propertyId,
                                              chargeType: payment.chargeType,
                                              coveredMonth: payment.coveredMonth,
                                            })),
                                          ),
                                        });

                                        if (!response.ok) {
                                          throw new Error("Failed to persist payment logs.");
                                        }

                                        const body = (await response.json()) as { data?: Payment[] };
                                        const persisted = body.data ?? [];
                                        if (persisted.length > 0) {
                                          setPaymentsFromDb((current) => [...persisted, ...current]);
                                        }
                                        setLoggedPayments((current) =>
                                          current.filter((payment) => !payment.id.startsWith("tmp-")),
                                        );
                                      } catch {
                                        // Keep temporary in-memory entries visible until refresh if persistence fails.
                                      }
                                    }}
                                  />
                                ) : (
                                  <span className="rounded-md border border-[var(--pm-border)] bg-[var(--pm-surface-soft)] px-3 py-2 text-xs text-[var(--pm-text-secondary)]">
                                    Paguaj
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
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-6 text-center text-sm text-[var(--pm-text-secondary)]">
                            Nuk ka apartamente që përputhen me këtë filtër statusi.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </article>
    </section>
  );
}
