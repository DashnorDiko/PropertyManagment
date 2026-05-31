import { PropertyForm } from "@/components/properties/PropertyForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

export default function NewPropertyPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Pronë e Re"
        description="Regjistro një apartament ose njësi të re për qira dhe shërbime."
      />
      <PropertyForm mode="create" />
    </div>
  );
}
