"use client";

import { useEffect, useMemo, useState } from "react";

import { ManagerContentSkeleton } from "@/components/layout/ManagerContentSkeleton";
import { addToTotals, createCurrencyTotals, formatCurrency, type Currency } from "@/lib/domain/currency";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

type ExpenseEntry = {
  id: string;
  month: string;
  description: string;
  amount: number;
  currency: Currency;
};

type PropertyApiRow = {
  id: string;
  status: "vacant" | "occupied" | "sold";
  rentAmount?: number;
  rentCurrency: Currency;
};

type ParkingApiRow = {
  id: string;
  price: number;
};

type InternetApiRow = {
  id: string;
  price: number;
};

function formatTotalsLine(eur: number, all: number): string {
  return `${formatCurrency(eur, "EUR")} / ${formatCurrency(all, "ALL")}`;
}

export default function AdministrationPage() {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [administrationFee, setAdministrationFee] = useState("0");
  const [administrationCurrency, setAdministrationCurrency] = useState<Currency>("ALL");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);

  const [expenseForm, setExpenseForm] = useState({
    month: currentMonthKey,
    description: "",
    amount: "",
    currency: "ALL" as Currency,
  });
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [properties, setProperties] = useState<PropertyApiRow[]>([]);
  const [parkingServices, setParkingServices] = useState<ParkingApiRow[]>([]);
  const [internetServices, setInternetServices] = useState<InternetApiRow[]>([]);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [expenseMessage, setExpenseMessage] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const apartmentTotals = useMemo(() => {
    return properties
      .filter((property) => property.status === "occupied")
      .reduce(
        (totals, property) =>
          addToTotals(totals, property.rentAmount ?? 0, property.rentCurrency),
        createCurrencyTotals(),
      );
  }, [properties]);

  const parkingTotals = useMemo(() => {
    return parkingServices.reduce(
      (totals, spot) => addToTotals(totals, spot.price, "EUR"),
      createCurrencyTotals(),
    );
  }, [parkingServices]);

  const internetTotals = useMemo(() => {
    return internetServices.reduce(
      (totals, account) => addToTotals(totals, account.price, "EUR"),
      createCurrencyTotals(),
    );
  }, [internetServices]);

  const expenseTotals = useMemo(() => {
    return expenses.reduce(
      (totals, expense) => addToTotals(totals, expense.amount, expense.currency),
      createCurrencyTotals(),
    );
  }, [expenses]);

  const administrationFeeNumber = Number(administrationFee);
  const administrationPreview = Number.isFinite(administrationFeeNumber)
    ? formatCurrency(administrationFeeNumber, administrationCurrency)
    : "Vlerë e pavlefshme";

  useEffect(() => {
    let isCancelled = false;

    async function loadSettings() {
      try {
        const [settingsResponse, propertiesResponse, parkingResponse, internetResponse, expensesResponse] =
          await Promise.all([
            fetch("/api/manager-settings"),
            fetch("/api/properties"),
            fetch("/api/parking"),
            fetch("/api/internet"),
            fetch("/api/manager-expenses"),
          ]);

        if (
          !settingsResponse.ok ||
          !propertiesResponse.ok ||
          !parkingResponse.ok ||
          !internetResponse.ok ||
          !expensesResponse.ok
        ) {
          return;
        }

        const [settingsBody, propertiesBody, parkingBody, internetBody, expensesBody] =
          await Promise.all([
            settingsResponse.json() as Promise<{
              data?: { administrationFee: number; administrationCurrency: Currency };
            }>,
            propertiesResponse.json() as Promise<{ data?: PropertyApiRow[] }>,
            parkingResponse.json() as Promise<{ data?: ParkingApiRow[] }>,
            internetResponse.json() as Promise<{ data?: InternetApiRow[] }>,
            expensesResponse.json() as Promise<{ data?: ExpenseEntry[] }>,
          ]);

        if (isCancelled) {
          return;
        }

        if (settingsBody.data) {
          setAdministrationFee(settingsBody.data.administrationFee.toString());
          setAdministrationCurrency(settingsBody.data.administrationCurrency);
        }
        setProperties(propertiesBody.data ?? []);
        setParkingServices(parkingBody.data ?? []);
        setInternetServices(internetBody.data ?? []);
        setExpenses(expensesBody.data ?? []);
      } catch {
        // Keep defaults when endpoint is unavailable.
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
      }
    }

    loadSettings();
    return () => {
      isCancelled = true;
    };
  }, []);

  const saveAdministrationSettings = async () => {
    const fee = Number(administrationFee);
    if (!Number.isFinite(fee) || fee < 0) {
      setSettingsMessage("Tarifa duhet të jetë vlerë jo negative.");
      return;
    }

    setIsSavingSettings(true);
    setSettingsMessage(null);
    try {
      const response = await fetch("/api/manager-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          administrationFee: fee,
          administrationCurrency,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setSettingsMessage(body?.message ?? "Dështoi ruajtja e tarifës së administrimit.");
        return;
      }

      setSettingsMessage("Tarifa e administrimit u ruajt me sukses.");
    } catch {
      setSettingsMessage("Gabim rrjeti gjatë ruajtjes së tarifës.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveExpense = async () => {
    const amountValue = Number(expenseForm.amount);
    if (!expenseForm.description.trim() || !Number.isFinite(amountValue) || amountValue < 0) {
      setExpenseMessage("Plotëso saktë përshkrimin dhe shumën e shpenzimit.");
      return;
    }

    setIsSavingExpense(true);
    setExpenseMessage(null);
    try {
      const response = await fetch("/api/manager-expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: expenseForm.month,
          description: expenseForm.description.trim(),
          amount: amountValue,
          currency: expenseForm.currency,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setExpenseMessage(body?.message ?? "Dështoi ruajtja e shpenzimit.");
        return;
      }

      const body = (await response.json()) as { data?: ExpenseEntry };
      if (body.data) {
        setExpenses((current) => [body.data as ExpenseEntry, ...current]);
      }
      setExpenseForm((current) => ({ ...current, description: "", amount: "" }));
      setExpenseMessage("Shpenzimi u ruajt me sukses.");
    } catch {
      setExpenseMessage("Gabim rrjeti gjatë ruajtjes së shpenzimit.");
    } finally {
      setIsSavingExpense(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <ManagerContentSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Administrim"
        description="Konfiguro tarifën e administrimit, shiko totalet e shërbimeve dhe regjistro shpenzimet mujore."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Totali i Apartamenteve (Muaji)">
          <p className="text-lg font-bold text-[var(--pm-text-primary)]">
            {formatTotalsLine(apartmentTotals.EUR, apartmentTotals.ALL)}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Totali i Parkimit">
          <p className="text-lg font-bold text-[var(--pm-text-primary)]">
            {formatTotalsLine(parkingTotals.EUR, parkingTotals.ALL)}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Totali i Internetit">
          <p className="text-lg font-bold text-[var(--pm-text-primary)]">
            {formatTotalsLine(internetTotals.EUR, internetTotals.ALL)}
          </p>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Tarifa e Administrimit">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Shuma</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={administrationFee}
              onChange={(event) => setAdministrationFee(event.target.value)}
              className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Monedha</span>
            <select
              value={administrationCurrency}
              onChange={(event) => setAdministrationCurrency(event.target.value as Currency)}
              className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
            >
              <option value="EUR">EUR</option>
              <option value="ALL">ALL</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-[var(--pm-text-secondary)]">
          Tarifa aktuale: <span className="font-semibold text-[var(--pm-text-primary)]">{administrationPreview}</span>
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={saveAdministrationSettings}
            disabled={isSavingSettings}
            className="rounded-lg bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)] disabled:cursor-not-allowed disabled:bg-[var(--pm-surface-muted)] disabled:text-[var(--pm-text-secondary)]"
          >
            {isSavingSettings ? "Duke ruajtur..." : "Ruaj Tarifën"}
          </button>
          {settingsMessage ? (
            <p className="text-sm text-[var(--pm-text-secondary)]">{settingsMessage}</p>
          ) : null}
        </div>
      </SurfaceCard>

      <SurfaceCard title="Gjurmuesi i Shpenzimeve Mujore" subtitle="Regjistro manualisht çdo shpenzim.">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await saveExpense();
          }}
          className="grid gap-3 md:grid-cols-[160px_1fr_160px_110px_auto]"
        >
          <input
            type="month"
            value={expenseForm.month}
            onChange={(event) => setExpenseForm((current) => ({ ...current, month: event.target.value }))}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          <input
            placeholder="P.sh. Riparim ashensori"
            value={expenseForm.description}
            onChange={(event) => setExpenseForm((current) => ({ ...current, description: event.target.value }))}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Shuma"
            value={expenseForm.amount}
            onChange={(event) => setExpenseForm((current) => ({ ...current, amount: event.target.value }))}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          />
          <select
            value={expenseForm.currency}
            onChange={(event) => setExpenseForm((current) => ({ ...current, currency: event.target.value as Currency }))}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
          >
            <option value="EUR">EUR</option>
            <option value="ALL">ALL</option>
          </select>
          <button
            type="submit"
            disabled={isSavingExpense}
            className="rounded-lg bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)] disabled:cursor-not-allowed disabled:bg-[var(--pm-surface-muted)] disabled:text-[var(--pm-text-secondary)]"
          >
            {isSavingExpense ? "Duke ruajtur..." : "Regjistro"}
          </button>
        </form>
        {expenseMessage ? (
          <p className="mt-3 text-sm text-[var(--pm-text-secondary)]">{expenseMessage}</p>
        ) : null}

        <div className="mt-4 rounded-xl border border-[var(--pm-border)]/70">
          <div className="grid grid-cols-[140px_1fr_130px_90px] gap-2 border-b border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--pm-text-secondary)]">
            <span>Muaji</span>
            <span>Përshkrimi</span>
            <span>Shuma</span>
            <span>Monedha</span>
          </div>
          {expenses.length === 0 ? (
            <p className="px-3 py-4 text-sm text-[var(--pm-text-secondary)]">Nuk ka shpenzime të regjistruara ende.</p>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="grid grid-cols-[140px_1fr_130px_90px] gap-2 border-b border-[var(--pm-border)]/50 px-3 py-2 text-sm last:border-b-0"
              >
                <span className="text-[var(--pm-text-secondary)]">{expense.month}</span>
                <span className="text-[var(--pm-text-primary)]">{expense.description}</span>
                <span className="font-medium text-[var(--pm-text-primary)]">{expense.amount.toFixed(2)}</span>
                <span className="text-[var(--pm-text-secondary)]">{expense.currency}</span>
              </div>
            ))
          )}
        </div>

        <p className="mt-3 text-sm text-[var(--pm-text-secondary)]">
          Totali i shpenzimeve:{" "}
          <span className="font-semibold text-[var(--pm-text-primary)]">
            {formatTotalsLine(expenseTotals.EUR, expenseTotals.ALL)}
          </span>
        </p>
      </SurfaceCard>
    </div>
  );
}
