import { ParkingForm } from "@/components/parking/ParkingForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditParkingSpotPageProps = {
  params: Promise<{ id: string }>;
};

const mockById: Record<
  string,
  {
    spotCode: string;
    status: "free" | "occupied";
    assigneeType: "tenant" | "independent";
    assigneeName: string;
    parkingCardNumber: string;
  }
> = {
  "pk-01": {
    spotCode: "P-01",
    status: "occupied",
    assigneeType: "tenant",
    assigneeName: "Elira Hoxha",
    parkingCardNumber: "CARD-1022",
  },
  "pk-03": {
    spotCode: "P-03",
    status: "occupied",
    assigneeType: "independent",
    assigneeName: "Erion Kasa",
    parkingCardNumber: "CARD-3301",
  },
};

export default async function EditParkingSpotPage({ params }: EditParkingSpotPageProps) {
  const { id } = await params;
  const initialValues = mockById[id] ?? {
    spotCode: id.toUpperCase(),
    status: "free" as const,
    assigneeType: "tenant" as const,
    assigneeName: "",
    parkingCardNumber: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Edit Parking Spot ${initialValues.spotCode}`}
        description="Update status, assignment details, and parking card information."
      />
      <ParkingForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
