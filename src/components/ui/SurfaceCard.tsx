import type { ReactNode } from "react";

type SurfaceCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SurfaceCard({ title, subtitle, children }: SurfaceCardProps) {
  return (
    <section className="rounded-2xl border border-[var(--pm-border)]/80 bg-[var(--pm-surface)] p-5 shadow-sm">
      <div className="mb-4 border-b border-[var(--pm-border)]/60 pb-3">
        <h3 className="text-lg font-semibold text-[var(--pm-text-primary)]">{title}</h3>
        {subtitle ? <p className="text-sm text-[var(--pm-text-secondary)]">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
