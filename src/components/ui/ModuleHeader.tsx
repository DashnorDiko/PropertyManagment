import type { ReactNode } from "react";

type ModuleHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function ModuleHeader({ title, description, actions }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
