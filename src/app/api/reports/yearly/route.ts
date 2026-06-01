import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { fetchPaymentsForRange } from "../../../../lib/data/reports";
import {
  MANAGER_SESSION_COOKIE,
  readSessionToken,
} from "../../../../lib/auth/manager-auth";
import { calculateReportStatistics } from "../../../../lib/domain/statistics";
import { generateReportPdf } from "../../../../lib/reports/pdf";
import type { ReportPaymentRecord } from "../../../../lib/data/reports";

export const runtime = "nodejs";

interface YearPeriodResult {
  year: number;
  from: string;
  to: string;
  label: string;
}

type MonthlyBreakdownItem = {
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

function buildMonthlyBreakdown(
  payments: ReportPaymentRecord[],
  year: number,
): MonthlyBreakdownItem[] {
  const byMonth = new Map<number, ReportPaymentRecord[]>();
  for (let month = 1; month <= 12; month += 1) {
    byMonth.set(month, []);
  }

  for (const payment of payments) {
    const dueDate = new Date(payment.dueDate);
    const paymentYear = dueDate.getUTCFullYear();
    if (paymentYear !== year) {
      continue;
    }
    const month = dueDate.getUTCMonth() + 1;
    const monthPayments = byMonth.get(month);
    if (!monthPayments) {
      continue;
    }
    monthPayments.push(payment);
  }

  return Array.from(byMonth.entries())
    .map(([month, monthPayments]) => {
      const statistics = calculateReportStatistics(monthPayments);
      return {
        month,
        label: `${year}-${String(month).padStart(2, "0")}`,
        count: statistics.count,
        paidCount: statistics.paidCount,
        unpaidCount: statistics.unpaidCount,
        totals: statistics.totals,
      };
    })
    .sort((left, right) => left.month - right.month);
}

function calculateCollectionRate(paidCount: number, totalCount: number): number {
  if (totalCount <= 0) {
    return 0;
  }
  return Math.round((paidCount / totalCount) * 1000) / 10;
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

    const period = getYearlyPeriod(request.nextUrl.searchParams);
    const format = request.nextUrl.searchParams.get("format");
    const payments = await fetchPaymentsForRange({
      from: period.from,
      to: period.to,
    });
    const statistics = calculateReportStatistics(payments);
    const monthlyBreakdown = buildMonthlyBreakdown(payments, period.year);

    if (format === "json") {
      return Response.json({
        type: "yearly",
        period,
        statistics,
        monthlyBreakdown,
        insights: {
          collectionRate: calculateCollectionRate(statistics.paidCount, statistics.count),
          strongestMonth:
            monthlyBreakdown.toSorted((left, right) => right.totals.EUR - left.totals.EUR)[0] ?? null,
        },
        generatedAt: new Date().toISOString(),
      });
    }

    const pdf = await generateReportPdf({
      title: "Raporti Vjetor i Pagesave",
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
        error: "Dështoi gjenerimi i raportit vjetor",
        message,
      },
      { status: 500 },
    );
  }
}
