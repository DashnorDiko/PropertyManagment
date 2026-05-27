import { PropertyForm } from "@/components/properties/PropertyForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

const mockById: Record<
  string,
  {
    unit: string;
    floor: string;
    areaSqm: string;
    ownerName: string;
    monthlyCharge: string;
    occupancy: "vacant" | "occupied";
    tenantName: string;
  }
> = {
  "p-101": {
    unit: "A-101",
    floor: "1",
    areaSqm: "87",
    ownerName: "Ilir Dervishi",
    monthlyCharge: "42.5",
    occupancy: "occupied",
    tenantName: "Ardit Kola",
  },
  "p-202": {
    unit: "A-202",
    floor: "2",
    areaSqm: "64",
    ownerName: "Mira Basha",
    monthlyCharge: "35",
    occupancy: "vacant",
    tenantName: "",
  },
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const initialValues = mockById[id] ?? {
    unit: id.toUpperCase(),
    floor: "0",
    areaSqm: "",
    ownerName: "",
    monthlyCharge: "",
    occupancy: "vacant" as const,
    tenantName: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Edit Property ${initialValues.unit}`}
        description="Update metadata and occupancy details. Backend persistence can be added after API wiring."
      />
      <PropertyForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
