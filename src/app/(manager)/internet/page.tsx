import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const internetPlans = [
  { provider: "FiberOne", speed: "300 Mbps", units: 14 },
  { provider: "FiberOne", speed: "100 Mbps", units: 8 },
  { provider: "SkyNet", speed: "500 Mbps", units: 5 },
];

export default function InternetPage() {
  const totalUnits = internetPlans.reduce((sum, plan) => sum + plan.units, 0);

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Internet Services"
        description="Overview of provider plans assigned to building units."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Providers">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">
            {new Set(internetPlans.map((plan) => plan.provider)).size}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Plans">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{internetPlans.length}</p>
        </SurfaceCard>
        <SurfaceCard title="Linked Units">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{totalUnits}</p>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Provider Distribution">
        <ul className="space-y-2">
          {internetPlans.map((plan) => (
            <li
              key={`${plan.provider}-${plan.speed}`}
              className="grid grid-cols-3 items-center rounded-lg border border-[var(--pm-border)]/70 bg-[var(--pm-surface-soft)] px-3 py-2 text-sm"
            >
              <span className="font-medium text-[var(--pm-text-primary)]">{plan.provider}</span>
              <span className="text-[var(--pm-text-secondary)]">{plan.speed}</span>
              <span className="text-[var(--pm-text-secondary)]">{plan.units} units</span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
