import { ParkingForm } from "@/components/parking/ParkingForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditParkingSpotPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditParkingSpotPage({ params }: EditParkingSpotPageProps) {
  const { id } = await params;
  const initialValues = {
    spotCode: id.toUpperCase(),
    status: "free" as const,
    assigneeType: "tenant" as const,
    assigneeName: "",
    parkingCardNumber: "",
    price: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Ndrysho Vendin ${initialValues.spotCode}`}
        description="Përditëso statusin, caktimin dhe të dhënat e kartës së parkimit."
      />
      <ParkingForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
