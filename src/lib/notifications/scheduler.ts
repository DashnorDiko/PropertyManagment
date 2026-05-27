import { addDays, isAfter, isBefore, parseISO } from "date-fns";

import { chargeSchedules } from "@/lib/data/mock";

export function collectUpcomingAndOverdueNotifications(now: Date = new Date()) {
  const upcomingThreshold = addDays(now, 5);

  return chargeSchedules
    .filter((charge) => !charge.paidAt)
    .map((charge) => {
      const due = parseISO(charge.dueDate);
      if (isBefore(due, now)) {
        return {
          type: "overdue" as const,
          message: `${charge.chargeType} for ${charge.monthLabel} is overdue`,
          dueDate: charge.dueDate,
        };
      }
      if (isAfter(due, now) && isBefore(due, upcomingThreshold)) {
        return {
          type: "upcoming" as const,
          message: `${charge.chargeType} for ${charge.monthLabel} is due soon`,
          dueDate: charge.dueDate,
        };
      }
      return undefined;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
