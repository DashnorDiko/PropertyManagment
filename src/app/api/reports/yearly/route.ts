import type { NextRequest } from "next/server";

import { fetchPaymentsForRange } from "../../../../lib/data/reports";
import { calculateReportStatistics } from "../../../../lib/domain/statistics";
import { generateReportPdf } from "../../../../lib/reports/pdf";

export const runtime = "nodejs";

interface YearPeriodResult {
  year: number;
  from: string;
  to: string;
  label: string;
}

function getYearlyPeriod(searchParams: URLSearchParams): YearPeriodResult {
  const now = new Date();
  const yearInput = Number(searchParams.get("year"));
  const year = Number.isInteger(yearInput) && yearInput > 0 ? yearInput : now.getUTCFullYear();

  return {
    year,
    from: `${year}-01-01`,
    to: `${year}-12-31`,
    label: String(year),
  };
}

function createFilename(periodLabel: string): string {
  return `yearly-report-${periodLabel}.pdf`;
}

export async function GET(request: NextRequest) {
  try {
    const period = getYearlyPeriod(request.nextUrl.searchParams);
    const format = request.nextUrl.searchParams.get("format");
    const payments = await fetchPaymentsForRange({
      from: period.from,
      to: period.to,
    });
    const statistics = calculateReportStatistics(payments);

    if (format === "json") {
      return Response.json({
        type: "yearly",
        period,
        statistics,
        generatedAt: new Date().toISOString(),
      });
    }

    const pdf = await generateReportPdf({
      title: "Yearly Payments Report",
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
        error: "Failed to generate yearly report",
        message,
      },
      { status: 500 },
    );
  }
}
