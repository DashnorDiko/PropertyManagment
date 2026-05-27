import Link from "next/link";

import { PropertyListTable } from "@/components/properties/PropertyListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const propertyRows = [
  {
    id: "p-101",
    unitName: "Apartment 1",
    locationSubtitle: "Building A, Staircase 1, Floor 1",
    status: "occupied" as const,
    tenantName: "Elira Hoxha",
    rentAmount: 420,
    rentCurrency: "EUR" as const,
  },
  {
    id: "p-202",
    unitName: "Apartment 2",
    locationSubtitle: "Building A, Staircase 1, Floor 2",
    status: "vacant" as const,
    tenantName: "Unassigned",
    rentAmount: 350,
    rentCurrency: "EUR" as const,
  },
  {
    id: "p-305",
    unitName: "Apartment 3",
    locationSubtitle: "Building B, Staircase 2, Floor 3",
    status: "sold" as const,
    tenantName: "Ardit Kola",
    rentAmount: undefined,
    rentCurrency: "ALL" as const,
  },
];

export default function PropertiesPage() {
  const occupiedCount = propertyRows.filter((item) => item.status === "occupied").length;
  const vacantCount = propertyRows.filter((item) => item.status === "vacant").length;
  const soldCount = propertyRows.filter((item) => item.status === "sold").length;
  const totalRent = propertyRows.reduce((sum, item) => sum + (item.rentAmount ?? 0), 0);

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Properties"
        description="Manage unit metadata, occupancy, and monthly billing setup."
        actions={
          <Link
            href="/properties/new"
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Add Property
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Total Units">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{propertyRows.length}</p>
        </SurfaceCard>
        <SurfaceCard title="Occupied / Vacant / Sold">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">
            {occupiedCount} / {vacantCount} / {soldCount}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Rent Total">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">EUR {totalRent.toFixed(2)}</p>
        </SurfaceCard>
      </div>

      <PropertyListTable items={propertyRows} />
    </div>
  );
}
