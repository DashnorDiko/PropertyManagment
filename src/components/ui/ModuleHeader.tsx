import type { ReactNode } from "react";

type ModuleHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function ModuleHeader({ title, description, actions }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] px-5 py-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[var(--pm-text-primary)]">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--pm-text-secondary)]">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
