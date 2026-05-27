type ChargeStatus = "paid" | "pending" | "partial" | "overdue" | "waived";

type ChargeBadgeProps = {
  status: ChargeStatus;
  dueDate?: string | null;
};

type StatusVisual = {
  label: string;
  className: string;
};

const statusMap: Record<ChargeStatus, StatusVisual> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  partial: {
    label: "Partial",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  overdue: {
    label: "Overdue",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  waived: {
    label: "Waived",
    className: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

function isPastDue(dueDate?: string | null): boolean {
  if (!dueDate) return false;

  const parsedDate = new Date(dueDate);
  if (Number.isNaN(parsedDate.getTime())) return false;

  const now = new Date();
  return parsedDate.getTime() < now.getTime();
}

export function ChargeBadge({ status, dueDate }: ChargeBadgeProps) {
  const effectiveStatus: ChargeStatus =
    status === "pending" && isPastDue(dueDate) ? "overdue" : status;
  const visual = statusMap[effectiveStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${visual.className}`}
    >
      {visual.label}
    </span>
  );
}
