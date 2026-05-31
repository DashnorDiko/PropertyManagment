import { InternetForm } from "@/components/internet/InternetForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

export default function NewInternetServicePage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Shërbim i Ri Interneti"
        description="Krijo një shërbim interneti dhe caktoje për qiramarrës ose person të pavarur."
      />
      <InternetForm mode="create" />
    </div>
  );
}
