export interface MonthlyCharge {
  monthKey: string;
  amountDue: number;
  amountPaid: number;
}

export interface MonthAllocation {
  monthKey: string;
  allocatedAmount: number;
  remainingBalance: number;
}

export interface BulkAllocationInput {
  totalPayment: number;
  selectedMonthKeys: string[];
  charges: MonthlyCharge[];
}

export interface BulkAllocationResult {
  allocations: MonthAllocation[];
  unallocatedAmount: number;
}

function roundToCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function allocatePaymentAcrossMonths({
  totalPayment,
  selectedMonthKeys,
  charges,
}: BulkAllocationInput): BulkAllocationResult {
  const selected = new Set(selectedMonthKeys);
  const orderedCharges = charges.filter((charge) => selected.has(charge.monthKey));

  let remainingPayment = Math.max(0, totalPayment);

  const allocations = orderedCharges.map((charge) => {
    const outstanding = Math.max(0, charge.amountDue - charge.amountPaid);
    const allocatedAmount = Math.min(outstanding, remainingPayment);
    remainingPayment = roundToCurrency(remainingPayment - allocatedAmount);

    return {
      monthKey: charge.monthKey,
      allocatedAmount: roundToCurrency(allocatedAmount),
      remainingBalance: roundToCurrency(outstanding - allocatedAmount),
    };
  });

  return {
    allocations,
    unallocatedAmount: roundToCurrency(remainingPayment),
  };
}

interface ScheduleLike {
  id: string;
  dueDate: string;
}

export function allocateBulkPayment<T extends ScheduleLike>(
  schedules: T[],
  selectedScheduleIds: string[],
): T[] {
  const selected = new Set(selectedScheduleIds);
  return schedules
    .filter((item) => selected.has(item.id))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}
