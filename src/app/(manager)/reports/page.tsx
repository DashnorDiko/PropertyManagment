"use client";

import { useEffect, useMemo, useState } from "react";

import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatCurrency } from "@/lib/domain/currency";
import { formatMonthYearLabelSq } from "@/lib/domain/date-format";

const now = new Date();
const currentYear = now.getUTCFullYear();
const currentMonth = now.getUTCMonth() + 1;

type ReportStatistics = {
  count: number;
  paidCount: number;
  unpaidCount: number;
  totals: {
    EUR: number;
    ALL: number;
  };
  paidTotals: {
    EUR: number;
    ALL: number;
  };
  unpaidTotals: {
    EUR: number;
    ALL: number;
  };
};

type MonthlyReportResponse = {
  type: "monthly";
  period: {
    year: number;
    month: number;
    from: string;
    to: string;
    label: string;
  };
  statistics: ReportStatistics;
  insights: {
    collectionRate: number;
    paidDeltaEUR: number;
    paidDeltaALL: number;
  };
  generatedAt: string;
};

type YearlyBreakdownRow = {
  month: number;
  label: string;
  count: number;
  paidCount: number;
  unpaidCount: number;
  totals: {
    EUR: number;
    ALL: number;
  };
};

type YearlyReportResponse = {
  type: "yearly";
  period: {
    year: number;
    from: string;
    to: string;
    label: string;
  };
  statistics: ReportStatistics;
  monthlyBreakdown: YearlyBreakdownRow[];
  insights: {
    collectionRate: number;
    strongestMonth: YearlyBreakdownRow | null;
  };
  generatedAt: string;
};

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [monthlyData, setMonthlyData] = useState<MonthlyReportResponse | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyReportResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  useEffect(() => {
    const controller = new AbortController();

    async function loadPreviewData() {
      setIsLoadingPreview(true);
      setPreviewError(null);

      try {
        const [monthlyResponse, yearlyResponse] = await Promise.all([
          fetch(monthlyJsonHref, { signal: controller.signal }),
          fetch(yearlyJsonHref, { signal: controller.signal }),
        ]);

        const monthlyBody = (await monthlyResponse.json()) as {
          message?: string;
        } & Partial<MonthlyReportResponse>;
        const yearlyBody = (await yearlyResponse.json()) as {
          message?: string;
        } & Partial<YearlyReportResponse>;

        if (!monthlyResponse.ok) {
          throw new Error(monthlyBody.message || "Dështoi ngarkimi i raportit mujor.");
        }
        if (!yearlyResponse.ok) {
          throw new Error(yearlyBody.message || "Dështoi ngarkimi i raportit vjetor.");
        }

        setMonthlyData(monthlyBody as MonthlyReportResponse);
        setYearlyData(yearlyBody as YearlyReportResponse);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setPreviewError(
          error instanceof Error
            ? error.message
            : "Nuk u ngarkua përmbledhja e raporteve. Provo përsëri.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPreview(false);
        }
      }
    }

    void loadPreviewData();

    return () => {
      controller.abort();
    };
  }, [monthlyJsonHref, yearlyJsonHref]);

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

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard title="Përmbledhje Mujore" subtitle="Performanca e pagesave për muajin e zgjedhur.">
          {isLoadingPreview ? (
            <p className="text-sm text-[var(--pm-text-secondary)]">Duke ngarkuar të dhënat mujore...</p>
          ) : monthlyData ? (
            <div className="space-y-2 text-sm text-[var(--pm-text-secondary)]">
              <p>
                Norma e arkëtimit:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {monthlyData.insights.collectionRate.toFixed(1)}%
                </span>
              </p>
              <p>
                Pagesa të kryera / të papaguara:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {monthlyData.statistics.paidCount} / {monthlyData.statistics.unpaidCount}
                </span>
              </p>
              <p>
                Totali i arkëtuar:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {formatCurrency(monthlyData.statistics.paidTotals.EUR, "EUR")} /{" "}
                  {formatCurrency(monthlyData.statistics.paidTotals.ALL, "ALL")}
                </span>
              </p>
              <p>
                Totali i papaguar:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {formatCurrency(monthlyData.statistics.unpaidTotals.EUR, "EUR")} /{" "}
                  {formatCurrency(monthlyData.statistics.unpaidTotals.ALL, "ALL")}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--pm-text-secondary)]">Nuk ka të dhëna mujore për t&apos;u shfaqur.</p>
          )}
        </SurfaceCard>

        <SurfaceCard title="Përmbledhje Vjetore" subtitle="Panoramë e pagesave për vitin e zgjedhur.">
          {isLoadingPreview ? (
            <p className="text-sm text-[var(--pm-text-secondary)]">Duke ngarkuar të dhënat vjetore...</p>
          ) : yearlyData ? (
            <div className="space-y-2 text-sm text-[var(--pm-text-secondary)]">
              <p>
                Norma e arkëtimit:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {yearlyData.insights.collectionRate.toFixed(1)}%
                </span>
              </p>
              <p>
                Regjistra total / të paguar:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {yearlyData.statistics.count} / {yearlyData.statistics.paidCount}
                </span>
              </p>
              <p>
                Totali vjetor:{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {formatCurrency(yearlyData.statistics.totals.EUR, "EUR")} /{" "}
                  {formatCurrency(yearlyData.statistics.totals.ALL, "ALL")}
                </span>
              </p>
              <p>
                Muaji më i fortë (EUR):{" "}
                <span className="font-semibold text-[var(--pm-text-primary)]">
                  {yearlyData.insights.strongestMonth
                    ? `${yearlyData.insights.strongestMonth.label} (${formatCurrency(
                        yearlyData.insights.strongestMonth.totals.EUR,
                        "EUR",
                      )})`
                    : "Nuk ka të dhëna"}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--pm-text-secondary)]">Nuk ka të dhëna vjetore për t&apos;u shfaqur.</p>
          )}
        </SurfaceCard>
      </div>

      {previewError ? (
        <SurfaceCard title="Gabim gjatë ngarkimit">
          <p className="text-sm text-[var(--pm-danger)]">{previewError}</p>
        </SurfaceCard>
      ) : null}

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

      <SurfaceCard title="Detajim Mujor i Vitit" subtitle="Pamje mujore për raportin vjetor.">
        {isLoadingPreview ? (
          <p className="text-sm text-[var(--pm-text-secondary)]">Duke ngarkuar detajimin e vitit...</p>
        ) : yearlyData ? (
          <div className="overflow-x-auto rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Muaji</th>
                  <th className="px-4 py-3 font-semibold">Regjistra</th>
                  <th className="px-4 py-3 font-semibold">Paguar</th>
                  <th className="px-4 py-3 font-semibold">Papaguar</th>
                  <th className="px-4 py-3 font-semibold">Total EUR</th>
                  <th className="px-4 py-3 font-semibold">Total ALL</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.monthlyBreakdown.map((row) => (
                  <tr
                    key={row.label}
                    className="border-t border-[var(--pm-border)]/60 transition hover:bg-[var(--pm-surface-soft)]"
                  >
                    <td className="px-4 py-3 text-[var(--pm-text-primary)]">
                      {formatMonthYearLabelSq(new Date(Date.UTC(selectedYear, row.month - 1, 1)))}
                    </td>
                    <td className="px-4 py-3 text-[var(--pm-text-secondary)]">{row.count}</td>
                    <td className="px-4 py-3 text-[var(--pm-text-secondary)]">{row.paidCount}</td>
                    <td className="px-4 py-3 text-[var(--pm-text-secondary)]">{row.unpaidCount}</td>
                    <td className="px-4 py-3 text-[var(--pm-text-secondary)]">
                      {formatCurrency(row.totals.EUR, "EUR")}
                    </td>
                    <td className="px-4 py-3 text-[var(--pm-text-secondary)]">
                      {formatCurrency(row.totals.ALL, "ALL")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--pm-text-secondary)]">Nuk ka detajim vjetor për t&apos;u shfaqur.</p>
        )}
      </SurfaceCard>
    </div>
  );
}
