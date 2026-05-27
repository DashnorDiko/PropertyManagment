import type { ReactNode } from "react";

type SurfaceCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SurfaceCard({ title, subtitle, children }: SurfaceCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
