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

export function formatMonthLabelSq(date: Date): string {
  return ALBANIAN_MONTHS[getUtcMonthIndex(date)];
}

export function formatMonthYearLabelSq(date: Date): string {
  return `${formatMonthLabelSq(date)} ${date.getUTCFullYear()}`;
}
