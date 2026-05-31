export type ChargeStatus = "paid" | "pending" | "partial" | "overdue" | "waived";

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
    label: "E paguar",
    className:
      "bg-[var(--pm-accent-soft)] text-[var(--pm-accent)] ring-[var(--pm-accent)]/20",
  },
  pending: {
    label: "Në pritje",
    className:
      "bg-[var(--pm-surface-muted)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
  },
  partial: {
    label: "Pjesërisht",
    className:
      "bg-[var(--pm-info-soft)] text-[var(--pm-info-strong)] ring-[var(--pm-info-strong)]/20",
  },
  overdue: {
    label: "Vonuar",
    className:
      "bg-[var(--pm-danger-soft)] text-[var(--pm-danger-strong)] ring-[var(--pm-danger-strong)]/20",
  },
  waived: {
    label: "Falur",
    className:
      "bg-[var(--pm-surface-soft)] text-[var(--pm-text-secondary)] ring-[var(--pm-border)]",
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
