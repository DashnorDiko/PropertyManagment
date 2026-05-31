export const CURRENCIES = ["EUR", "ALL"] as const;

export type Currency = (typeof CURRENCIES)[number];

const DEFAULT_LOCALE = "sq-AL";
const CURRENCY_SYMBOL: Record<Currency, string> = {
  EUR: "€",
  ALL: "L",
};

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
  const sign = amount < 0 ? "-" : "";
  const absoluteAmount = Math.abs(amount);
  const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split(".");
  const groupingSeparator = locale === "sq-AL" ? "." : ",";
  const decimalSeparator = locale === "sq-AL" ? "," : ".";
  const groupedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    groupingSeparator,
  );
  const formattedNumber = `${sign}${groupedIntegerPart}${decimalSeparator}${decimalPart}`;
  const symbol = CURRENCY_SYMBOL[currency];

  return locale === "sq-AL"
    ? `${formattedNumber}\u00A0${symbol}`
    : `${symbol}${formattedNumber}`;
}
