"use client";

import { useMemo, useState } from "react";

import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatMonthYearLabelSq } from "@/lib/domain/date-format";

const now = new Date();
const currentYear = now.getUTCFullYear();
const currentMonth = now.getUTCMonth() + 1;

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const yearlyOptions = useMemo(() => {
    const start = currentYear - 5;
    return Array.from({ length: 8 }, (_, index) => start + index);
  }, []);

  const monthLabel = formatMonthYearLabelSq(
    new Date(Date.UTC(selectedYear, selectedMonth - 1, 1)),
  );

  const monthlyPdfHref = `/api/reports/monthly?year=${selectedYear}&month=${selectedMonth}`;
  const monthlyJsonHref = `/api/reports/monthly?year=${selectedYear}&month=${selectedMonth}&format=json`;
  const yearlyPdfHref = `/api/reports/yearly?year=${selectedYear}`;
  const yearlyJsonHref = `/api/reports/yearly?year=${selectedYear}&format=json`;

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Raporte"
        description="Gjenero dhe shkarko raporte mujore ose vjetore të pagesave."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Muaji i Zgjedhur">
          <p className="text-2xl font-bold text-[var(--pm-text-primary)]">{monthLabel}</p>
        </SurfaceCard>
        <SurfaceCard title="Viti i Zgjedhur">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{selectedYear}</p>
        </SurfaceCard>
        <SurfaceCard title="Llojet e Shkarkimit">
          <p className="text-2xl font-bold text-[var(--pm-text-primary)]">PDF + JSON</p>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Parametrat e Raportit" subtitle="Zgjidh periudhën përpara shkarkimit.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Viti</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
            >
              {yearlyOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-[var(--pm-text-secondary)]">Muaji</span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="w-full rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-3 py-2 text-sm text-[var(--pm-text-primary)] outline-none ring-[var(--pm-info-strong)]/40 transition focus:ring"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                  {String(month).padStart(2, "0")}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SurfaceCard>

      <SurfaceCard title="Shkarkimet" subtitle="Përdor këto butona për të eksportuar raportet direkt.">
        <div className="grid gap-3 md:grid-cols-2">
          <a
            href={monthlyPdfHref}
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Shkarko PDF Mujor
          </a>
          <a
            href={monthlyJsonHref}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-4 py-2 text-center text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
          >
            Shkarko JSON Mujor
          </a>
          <a
            href={yearlyPdfHref}
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Shkarko PDF Vjetor
          </a>
          <a
            href={yearlyJsonHref}
            className="rounded-lg border border-[var(--pm-border)] bg-[var(--pm-surface)] px-4 py-2 text-center text-sm font-medium text-[var(--pm-text-secondary)] transition hover:bg-[var(--pm-surface-soft)]"
          >
            Shkarko JSON Vjetor
          </a>
        </div>
      </SurfaceCard>
    </div>
  );
}
