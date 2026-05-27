import { PropertyForm } from "@/components/properties/PropertyForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

const mockById: Record<
  string,
  {
    unitName: string;
    locationSubtitle: string;
    rentAmount: string;
    rentCurrency: "EUR" | "ALL";
    status: "vacant" | "occupied" | "sold";
    tenantName: string;
  }
> = {
  "p-101": {
    unitName: "Apartment 1",
    locationSubtitle: "Building A, Staircase 1, Floor 1",
    rentAmount: "420",
    rentCurrency: "EUR",
    status: "occupied",
    tenantName: "Elira Hoxha",
  },
  "p-202": {
    unitName: "Apartment 2",
    locationSubtitle: "Building A, Staircase 1, Floor 2",
    rentAmount: "350",
    rentCurrency: "EUR",
    status: "vacant",
    tenantName: "",
  },
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const initialValues = mockById[id] ?? {
    unitName: `Apartment ${id.toUpperCase()}`,
    locationSubtitle: "",
    rentAmount: "",
    rentCurrency: "EUR" as const,
    status: "vacant" as const,
    tenantName: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Edit Property ${initialValues.unitName}`}
        description="Update metadata and occupancy details. Backend persistence can be added after API wiring."
      />
      <PropertyForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
