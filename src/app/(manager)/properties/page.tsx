import Link from "next/link";

import { PropertyListTable } from "@/components/properties/PropertyListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const propertyRows: {
  id: string;
  unitName: string;
  locationSubtitle: string;
  status: "vacant" | "occupied" | "sold";
  tenantName: string;
  rentAmount?: number;
  rentCurrency: "EUR" | "ALL";
}[] = [];

export default function PropertiesPage() {
  const occupiedCount = propertyRows.filter((item) => item.status === "occupied").length;
  const vacantCount = propertyRows.filter((item) => item.status === "vacant").length;
  const soldCount = propertyRows.filter((item) => item.status === "sold").length;
  const totalRent = propertyRows.reduce((sum, item) => sum + (item.rentAmount ?? 0), 0);

  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Pronat"
        description="Menaxho të dhënat e njësive, statusin dhe konfigurimin mujor të qirasë."
        actions={
          <Link
            href="/properties/new"
            className="rounded-lg border border-[var(--pm-accent)] bg-[var(--pm-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pm-accent-strong)]"
          >
            Shto Pronë
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Totali i Njësive">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{propertyRows.length}</p>
        </SurfaceCard>
        <SurfaceCard title="E Zënë / Bosh / Shitur">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">
            {occupiedCount} / {vacantCount} / {soldCount}
          </p>
        </SurfaceCard>
        <SurfaceCard title="Totali i Qirasë">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">EUR {totalRent.toFixed(2)}</p>
        </SurfaceCard>
      </div>

      <PropertyListTable items={propertyRows} />
    </div>
  );
}
