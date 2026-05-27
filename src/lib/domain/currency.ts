export const CURRENCIES = ["EUR", "ALL"] as const;

export type Currency = (typeof CURRENCIES)[number];

const DEFAULT_LOCALE = "sq-AL";

export type CurrencyTotals = Record<Currency, number>;

export function isCurrency(value: string): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

export function createCurrencyTotals(): CurrencyTotals {
  return { EUR: 0, ALL: 0 };
}

export function emptyCurrencyTotals(): CurrencyTotals {
  return createCurrencyTotals();
}

export function addToTotals(
  totals: CurrencyTotals,
  amount: number,
  currency: Currency,
): CurrencyTotals {
  return {
    ...totals,
    [currency]: Number((totals[currency] + amount).toFixed(2)),
  };
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
