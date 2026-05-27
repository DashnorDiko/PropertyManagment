export type PaymentState = "pending" | "paid" | "overdue";
export type PaymentColor = "gray" | "green" | "red";

export interface PaymentStatusInput {
  dueDate: Date | string;
  paidAt?: Date | string | null;
  now?: Date;
}

export interface PaymentStatusResult {
  state: PaymentState;
  color: PaymentColor;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function getPaymentStatus({
  dueDate,
  paidAt,
  now = new Date(),
}: PaymentStatusInput): PaymentStatusResult {
  if (paidAt) {
    return { state: "paid", color: "green" };
  }

  if (toDate(dueDate).getTime() < now.getTime()) {
    return { state: "overdue", color: "red" };
  }

  return { state: "pending", color: "gray" };
}

export function getPaymentState(input: {
  dueDate: string;
  paidAt?: string;
  now?: Date;
}): PaymentState {
  return getPaymentStatus({
    dueDate: input.dueDate,
    paidAt: input.paidAt,
    now: input.now,
  }).state;
}

export function paymentStateColor(state: PaymentState): string {
  switch (state) {
    case "pending":
      return "bg-gray-200 text-gray-700";
    case "paid":
      return "bg-green-200 text-green-800";
    case "overdue":
      return "bg-red-200 text-red-800";
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}
