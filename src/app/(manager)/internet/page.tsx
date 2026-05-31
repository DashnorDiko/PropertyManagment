import Link from "next/link";

import { InternetListTable } from "@/components/internet/InternetListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { listInternetServices } from "@/lib/data/internet";

export default async function InternetPage() {
  const internetServices = await listInternetServices();
  const occupiedCount = internetServices.filter((item) => item.status === "occupied").length;
  const freeCount = internetServices.filter((item) => item.status === "free").length;
  const monthlyTotal = internetServices.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Shërbimet e Internetit"
        description="Krijo dhe cakto shërbime interneti për qiramarrës ose persona të pavarur."
        actions={
          <Link
            href="/internet/new"
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Shto Shërbim
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <SurfaceCard title="Totali i Shërbimeve">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{internetServices.length}</p>
        </SurfaceCard>
        <SurfaceCard title="Të Zëna">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{occupiedCount}</p>
        </SurfaceCard>
        <SurfaceCard title="Të Lira">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{freeCount}</p>
        </SurfaceCard>
        <SurfaceCard title="Totali Mujor">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{monthlyTotal.toFixed(2)} EUR</p>
        </SurfaceCard>
      </div>
      <InternetListTable items={internetServices} />
    </div>
  );
}
