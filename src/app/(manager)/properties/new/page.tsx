import { PropertyForm } from "@/components/properties/PropertyForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

export default function NewPropertyPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="New Property"
        description="Register a new apartment or unit for future billing and services."
      />
      <PropertyForm mode="create" />
    </div>
  );
}
