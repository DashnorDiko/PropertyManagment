import Link from "next/link";

import { ParkingListTable } from "@/components/parking/ParkingListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const parkingSlots = [
  {
    id: "pk-01",
    spotCode: "P-01",
    status: "occupied" as const,
    assigneeType: "tenant" as const,
    assigneeName: "Elira Hoxha",
    parkingCardNumber: "CARD-1022",
  },
  {
    id: "pk-02",
    spotCode: "P-02",
    status: "free" as const,
    assigneeType: "tenant" as const,
    assigneeName: "",
    parkingCardNumber: "",
  },
  {
    id: "pk-03",
    spotCode: "P-03",
    status: "occupied" as const,
    assigneeType: "independent" as const,
    assigneeName: "Erion Kasa",
    parkingCardNumber: "CARD-3301",
  },
  {
    id: "pk-04",
    spotCode: "P-04",
    status: "free" as const,
    assigneeType: "independent" as const,
    assigneeName: "",
    parkingCardNumber: "",
  },
];

export default function ParkingPage() {
  const occupiedCount = parkingSlots.filter((slot) => slot.status === "occupied").length;
  const freeCount = parkingSlots.filter((slot) => slot.status === "free").length;

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Parking"
        description="Create and assign parking spots to tenants or independent clients."
        actions={
          <Link
            href="/parking/new"
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Add Spot
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Total Slots">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{parkingSlots.length}</p>
        </SurfaceCard>
        <SurfaceCard title="Occupied">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{occupiedCount}</p>
        </SurfaceCard>
        <SurfaceCard title="Free">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{freeCount}</p>
        </SurfaceCard>
      </div>
      <ParkingListTable items={parkingSlots} />
    </div>
  );
}
