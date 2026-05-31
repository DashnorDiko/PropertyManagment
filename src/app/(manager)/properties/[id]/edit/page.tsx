import { PropertyForm } from "@/components/properties/PropertyForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const initialValues = {
    unitName: `Apartamenti ${id.toUpperCase()}`,
    locationSubtitle: "",
    rentAmount: "",
    rentCurrency: "EUR" as const,
    status: "vacant" as const,
    tenantName: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Ndrysho Pronën ${initialValues.unitName}`}
        description="Përditëso detajet e njësisë dhe statusin. Ruajtja në backend mund të shtohet pas lidhjes së API-ve."
      />
      <PropertyForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
