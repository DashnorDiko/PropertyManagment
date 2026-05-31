"use client";

import { useMemo, useState } from "react";

import {
  chargeSchedules,
  internetAccounts,
  managerSettings,
  parkingSpots,
} from "@/lib/data/manager";
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

function formatTotalsLine(eur: number, all: number): string {
  return `${formatCurrency(eur, "EUR")} / ${formatCurrency(all, "ALL")}`;
}

export default function AdministrationPage() {
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const [administrationFee, setAdministrationFee] = useState(managerSettings.administrationFee.toString());
  const [administrationCurrency, setAdministrationCurrency] = useState<Currency>(
    managerSettings.administrationCurrency,
  );

  const [expenseForm, setExpenseForm] = useState({
    month: currentMonthKey,
    description: "",
    amount: "",
    currency: "ALL" as Currency,
  });
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);

  const apartmentTotals = useMemo(() => {
    return chargeSchedules
      .filter((charge) => charge.chargeType === "rent" && charge.dueDate.slice(0, 7) === currentMonthKey)
      .reduce((totals, charge) => addToTotals(totals, charge.amount, charge.currency), createCurrencyTotals());
  }, [currentMonthKey]);

  const parkingTotals = useMemo(() => {
    return parkingSpots.reduce(
      (totals, spot) => addToTotals(totals, spot.rentAmount, spot.currency),
      createCurrencyTotals(),
    );
  }, []);

  const internetTotals = useMemo(() => {
    return internetAccounts.reduce(
      (totals, account) => addToTotals(totals, account.rentAmount, account.currency),
      createCurrencyTotals(),
    );
  }, []);

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
      </SurfaceCard>

      <SurfaceCard title="Gjurmuesi i Shpenzimeve Mujore" subtitle="Regjistro manualisht çdo shpenzim.">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const amountValue = Number(expenseForm.amount);
            if (!expenseForm.description.trim() || !Number.isFinite(amountValue) || amountValue < 0) {
              return;
            }
            const entry: ExpenseEntry = {
              id: `exp-${Date.now()}`,
              month: expenseForm.month,
              description: expenseForm.description.trim(),
              amount: amountValue,
              currency: expenseForm.currency,
            };
            setExpenses((current) => [entry, ...current]);
            setExpenseForm((current) => ({ ...current, description: "", amount: "" }));
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
            className="rounded-lg bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Regjistro
          </button>
        </form>

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
