import { describe, expect, it } from "vitest";

import { allocatePaymentAcrossMonths } from "../payment-allocator";
import { calculateReportStatistics } from "../statistics";

describe("calculateReportStatistics", () => {
  it("separates totals by EUR and ALL", () => {
    const result = calculateReportStatistics([
      { amount: 100, currency: "EUR", paidAt: "2026-01-15T00:00:00.000Z" },
      { amount: 50, currency: "EUR", paidAt: null },
      { amount: 8000, currency: "ALL", paidAt: null },
      { amount: 3000, currency: "ALL", paidAt: "2026-01-10T00:00:00.000Z" },
    ]);

    expect(result.count).toBe(4);
    expect(result.paidCount).toBe(2);
    expect(result.unpaidCount).toBe(2);
    expect(result.totals).toEqual({ EUR: 150, ALL: 11000 });
    expect(result.paidTotals).toEqual({ EUR: 100, ALL: 3000 });
    expect(result.unpaidTotals).toEqual({ EUR: 50, ALL: 8000 });
  });
});

describe("allocatePaymentAcrossMonths", () => {
  it("allocates payment over selected months only", () => {
    const result = allocatePaymentAcrossMonths({
      totalPayment: 250,
      selectedMonthKeys: ["2026-01", "2026-03"],
      charges: [
        { monthKey: "2026-01", amountDue: 100, amountPaid: 0 },
        { monthKey: "2026-02", amountDue: 120, amountPaid: 0 },
        { monthKey: "2026-03", amountDue: 200, amountPaid: 50 },
      ],
    });

    expect(result.allocations).toEqual([
      {
        monthKey: "2026-01",
        allocatedAmount: 100,
        remainingBalance: 0,
      },
      {
        monthKey: "2026-03",
        allocatedAmount: 150,
        remainingBalance: 0,
      },
    ]);
    expect(result.unallocatedAmount).toBe(0);
  });
});
