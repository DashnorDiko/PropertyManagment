import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function AdministrationPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Administration"
        description="Keep key building details, policies, and service assignments in one place."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Total Units">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">34</p>
        </SurfaceCard>
        <SurfaceCard title="Service Contracts">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">12</p>
        </SurfaceCard>
        <SurfaceCard title="Open Policies">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">5</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard title="Building Profile">
          <ul className="space-y-2 text-sm text-[var(--pm-text-secondary)]">
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Name: Residence Aurora
            </li>
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Address: Rr. Dritan Hoxha, Tirana
            </li>
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Total Units: 34
            </li>
          </ul>
        </SurfaceCard>
        <SurfaceCard title="Key Contacts">
          <ul className="space-y-2 text-sm text-[var(--pm-text-secondary)]">
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Administrator: admin@aurora.example
            </li>
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Janitor: janitor@aurora.example
            </li>
            <li className="rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2">
              Security: security@aurora.example
            </li>
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
