import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const internetPlans = [
  { provider: "FiberOne", speed: "300 Mbps", units: 14 },
  { provider: "FiberOne", speed: "100 Mbps", units: 8 },
  { provider: "SkyNet", speed: "500 Mbps", units: 5 },
];

export default function InternetPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Internet Services"
        description="Overview of provider plans assigned to building units."
      />
      <SurfaceCard title="Provider Distribution">
        <ul className="space-y-2">
          {internetPlans.map((plan) => (
            <li
              key={`${plan.provider}-${plan.speed}`}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-800">{plan.provider}</span>
              <span className="text-slate-600">{plan.speed}</span>
              <span className="text-slate-500">{plan.units} units</span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
