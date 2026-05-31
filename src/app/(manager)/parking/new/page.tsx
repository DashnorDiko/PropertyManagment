import { ParkingForm } from "@/components/parking/ParkingForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

export default function NewParkingSpotPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Vend i Ri Parkimi"
        description="Krijo një vend parkimi dhe caktoje për qiramarrës ose person të pavarur."
      />
      <ParkingForm mode="create" />
    </div>
  );
}
