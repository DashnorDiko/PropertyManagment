import type { NextRequest } from "next/server";

import { fetchPaymentsForRange } from "../../../../lib/data/reports";
import { calculateReportStatistics } from "../../../../lib/domain/statistics";
import { generateReportPdf } from "../../../../lib/reports/pdf";

export const runtime = "nodejs";

interface PeriodResult {
  year: number;
  month: number;
  from: string;
  to: string;
  label: string;
}

function getMonthlyPeriod(searchParams: URLSearchParams): PeriodResult {
  const now = new Date();
  const yearInput = Number(searchParams.get("year"));
  const monthInput = Number(searchParams.get("month"));

  const year = Number.isInteger(yearInput) && yearInput > 0 ? yearInput : now.getUTCFullYear();
  const month =
    Number.isInteger(monthInput) && monthInput >= 1 && monthInput <= 12
      ? monthInput
      : now.getUTCMonth() + 1;

  const fromDate = new Date(Date.UTC(year, month - 1, 1));
  const toDate = new Date(Date.UTC(year, month, 0));

  return {
    year,
    month,
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
    label: `${year}-${String(month).padStart(2, "0")}`,
  };
}

function createFilename(periodLabel: string): string {
  return `monthly-report-${periodLabel}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    const period = getMonthlyPeriod(request.nextUrl.searchParams);
    const format = request.nextUrl.searchParams.get("format");
    const payments = await fetchPaymentsForRange({
      from: period.from,
      to: period.to,
    });
    const statistics = calculateReportStatistics(payments);

    if (format === "json") {
      return Response.json({
        type: "monthly",
        period,
        statistics,
        generatedAt: new Date().toISOString(),
      });
    }

    const pdf = await generateReportPdf({
      title: "Monthly Payments Report",
      periodLabel: period.label,
      generatedAt: new Date(),
      statistics,
    });

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${createFilename(period.label)}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return Response.json(
      {
        error: "Failed to generate monthly report",
        message,
      },
      { status: 500 },
    );
  }
}
