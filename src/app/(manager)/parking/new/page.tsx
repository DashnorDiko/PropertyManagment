import { ParkingForm } from "@/components/parking/ParkingForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

export default function NewParkingSpotPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="New Parking Spot"
        description="Create a parking spot and assign it to a tenant or an independent person."
      />
      <ParkingForm mode="create" />
    </div>
  );
}
