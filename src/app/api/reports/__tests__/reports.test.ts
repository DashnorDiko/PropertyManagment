import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchPaymentsForRange } from "../../../../lib/data/reports";
import { GET as getMonthlyReport } from "../monthly/route";
import { GET as getYearlyReport } from "../yearly/route";

vi.mock("../../../../lib/data/reports", () => ({
  fetchPaymentsForRange: vi.fn(),
}));

const mockedFetchPaymentsForRange = vi.mocked(fetchPaymentsForRange);

describe("reports routes", () => {
  beforeEach(() => {
    mockedFetchPaymentsForRange.mockReset();
  });

  it("returns monthly JSON metadata in test mode", async () => {
    mockedFetchPaymentsForRange.mockResolvedValue([
      {
        id: "p1",
        dueDate: "2026-05-10",
        amount: 100,
        currency: "EUR",
        paidAt: null,
      },
      {
        id: "p2",
        dueDate: "2026-05-20",
        amount: 5000,
        currency: "ALL",
        paidAt: "2026-05-21T00:00:00.000Z",
      },
    ]);

    const response = await getMonthlyReport(
      new NextRequest("http://localhost/api/reports/monthly?year=2026&month=5&format=json"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.type).toBe("monthly");
    expect(body.period.label).toBe("2026-05");
    expect(body.statistics.totals).toEqual({
      EUR: 100,
      ALL: 5000,
    });
    expect(mockedFetchPaymentsForRange).toHaveBeenCalledWith({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("returns monthly PDF by default", async () => {
    mockedFetchPaymentsForRange.mockResolvedValue([]);

    const response = await getMonthlyReport(new NextRequest("http://localhost/api/reports/monthly"));
    const body = new Uint8Array(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-disposition")).toContain("monthly-report-");
    expect(new TextDecoder().decode(body.slice(0, 4))).toBe("%PDF");
  });

  it("returns yearly JSON metadata in test mode", async () => {
    mockedFetchPaymentsForRange.mockResolvedValue([
      {
        id: "p3",
        dueDate: "2026-03-15",
        amount: 300,
        currency: "EUR",
        paidAt: "2026-03-15T00:00:00.000Z",
      },
    ]);

    const response = await getYearlyReport(
      new NextRequest("http://localhost/api/reports/yearly?year=2026&format=json"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.type).toBe("yearly");
    expect(body.period).toMatchObject({
      year: 2026,
      from: "2026-01-01",
      to: "2026-12-31",
    });
    expect(body.statistics.paidTotals.EUR).toBe(300);
    expect(mockedFetchPaymentsForRange).toHaveBeenCalledWith({
      from: "2026-01-01",
      to: "2026-12-31",
    });
  });
});
