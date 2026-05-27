import { describe, expect, it } from "vitest";

import { getPaymentStatus } from "../payment-status";

describe("getPaymentStatus", () => {
  it("returns paid/green when payment is settled", () => {
    const result = getPaymentStatus({
      dueDate: "2026-05-01T00:00:00.000Z",
      paidAt: "2026-05-02T00:00:00.000Z",
      now: new Date("2026-05-15T00:00:00.000Z"),
    });

    expect(result).toEqual({
      state: "paid",
      color: "green",
    });
  });

  it("returns pending/gray before due date", () => {
    const result = getPaymentStatus({
      dueDate: "2026-06-01T00:00:00.000Z",
      now: new Date("2026-05-15T00:00:00.000Z"),
    });

    expect(result).toEqual({
      state: "pending",
      color: "gray",
    });
  });

  it("returns overdue/red after due date when unpaid", () => {
    const result = getPaymentStatus({
      dueDate: "2026-04-01T00:00:00.000Z",
      now: new Date("2026-05-15T00:00:00.000Z"),
    });

    expect(result).toEqual({
      state: "overdue",
      color: "red",
    });
  });
});
