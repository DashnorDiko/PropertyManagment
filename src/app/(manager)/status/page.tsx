import { BulkPayModal } from "@/components/payments/BulkPayModal";
import { OccupiedPropertyCard } from "@/components/status/OccupiedPropertyCard";
import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { getOccupiedDashboardCards } from "@/lib/data/mock";

export default function StatusPage() {
  const cards = getOccupiedDashboardCards();

  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Status Dashboard"
        description="Shows currently occupied apartments and active obligations."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {cards.map((card) => (
          <div key={card.property.id} className="space-y-3">
            <OccupiedPropertyCard
              property={card.property}
              tenant={card.tenant}
              charges={card.charges}
            />
            <BulkPayModal schedules={card.charges} />
          </div>
        ))}
      </div>
    </section>
  );
}
