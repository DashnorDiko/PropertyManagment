import Link from "next/link";

import { ParkingListTable } from "@/components/parking/ParkingListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const parkingSlots: {
  id: string;
  spotCode: string;
  status: "free" | "occupied";
  assigneeType: "tenant" | "independent";
  assigneeName: string;
  parkingCardNumber: string;
  price: number;
}[] = [];

export default function ParkingPage() {
  const occupiedCount = parkingSlots.filter((slot) => slot.status === "occupied").length;
  const freeCount = parkingSlots.filter((slot) => slot.status === "free").length;
  const monthlyTotal = parkingSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Parkim"
        description="Krijo dhe cakto vende parkimi për qiramarrës ose persona të pavarur."
        actions={
          <Link
            href="/parking/new"
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Shto Vend
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <SurfaceCard title="Totali i Vendeve">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{parkingSlots.length}</p>
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
      <ParkingListTable items={parkingSlots} />
    </div>
  );
}
