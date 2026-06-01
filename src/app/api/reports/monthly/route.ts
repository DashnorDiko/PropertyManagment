import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { fetchPaymentsForRange } from "../../../../lib/data/reports";
import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "../../../../lib/auth/manager-auth";
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

function calculateCollectionRate(paidCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }
  return Math.round((paidCount / totalCount) * 1000) / 10;
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
    const cookieStore = await cookies();
    const session = readSessionToken(
      cookieStore.get(MANAGER_SESSION_COOKIE)?.value,
    );
    if (!session) {
      return Response.json(
        { error: "Unauthorized", message: "Kërkohet hyrja në sistem." },
        { status: 401 },
      );
    }

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
        insights: {
          collectionRate: calculateCollectionRate(statistics.paidCount, statistics.count),
          paidDeltaEUR: Number((statistics.paidTotals.EUR - statistics.unpaidTotals.EUR).toFixed(2)),
          paidDeltaALL: Number((statistics.paidTotals.ALL - statistics.unpaidTotals.ALL).toFixed(2)),
        },
        generatedAt: new Date().toISOString(),
      });
    }

    const pdf = await generateReportPdf({
      title: "Raporti Mujor i Pagesave",
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
    const message = error instanceof Error ? error.message : "Gabim i panjohur";

    return Response.json(
      {
        error: "Dështoi gjenerimi i raportit mujor",
        message,
      },
      { status: 500 },
    );
  }
}
