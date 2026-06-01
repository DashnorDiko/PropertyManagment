const ALBANIAN_MONTHS = [
  "janar",
  "shkurt",
  "mars",
  "prill",
  "maj",
  "qershor",
  "korrik",
  "gusht",
  "shtator",
  "tetor",
  "nëntor",
  "dhjetor",
] as const;

function getUtcMonthIndex(date: Date): number {
  return date.getUTCMonth();
}

function capitalizeFirstLetter(value: string): string {
  if (!value) {
    return value;
  }
  const firstChar = value.slice(0, 1).toLocaleUpperCase("sq-AL");
  return `${firstChar}${value.slice(1)}`;
}

export function formatMonthLabelSq(date: Date): string {
  return capitalizeFirstLetter(ALBANIAN_MONTHS[getUtcMonthIndex(date)]);
}

export function formatMonthYearLabelSq(date: Date): string {
  return `${formatMonthLabelSq(date)} ${date.getUTCFullYear()}`;
}
