import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

export default function AdministrationPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Administration"
        description="Keep key building details, policies, and service assignments in one place."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <SurfaceCard title="Building Profile">
          <ul className="space-y-1 text-sm text-slate-700">
            <li>Name: Residence Aurora</li>
            <li>Address: Rr. Dritan Hoxha, Tirana</li>
            <li>Total Units: 34</li>
          </ul>
        </SurfaceCard>
        <SurfaceCard title="Key Contacts">
          <ul className="space-y-1 text-sm text-slate-700">
            <li>Administrator: admin@aurora.example</li>
            <li>Janitor: janitor@aurora.example</li>
            <li>Security: security@aurora.example</li>
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
