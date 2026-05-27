import { isCurrency, type Currency } from "../domain/currency";
import { createSupabaseServerClient } from "../supabase/server";

export interface ReportPaymentRecord {
  id: string;
  dueDate: string;
  amount: number;
  currency: Currency;
  paidAt: string | null;
}

interface PaymentRow {
  id: string;
  due_date: string;
  amount: number;
  currency: string;
  paid_at: string | null;
}

export interface FetchPaymentsInput {
  from: string;
  to: string;
}

export async function fetchPaymentsForRange({
  from,
  to,
}: FetchPaymentsInput): Promise<ReportPaymentRecord[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id,due_date,amount,currency,paid_at")
    .gte("due_date", from)
    .lte("due_date", to)
    .order("due_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to load report payments: ${error.message}`);
  }

  const typedData = (data ?? []) as PaymentRow[];

  return typedData
    .filter((row) => isCurrency(row.currency))
    .map((row) => ({
      id: row.id,
      dueDate: row.due_date,
      amount: row.amount,
      currency: row.currency as Currency,
      paidAt: row.paid_at,
    }));
}
