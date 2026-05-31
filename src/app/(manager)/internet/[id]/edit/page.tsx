import { InternetForm } from "@/components/internet/InternetForm";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

type EditInternetServicePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditInternetServicePage({ params }: EditInternetServicePageProps) {
  const { id } = await params;
  const initialValues = {
    serviceCode: id.toUpperCase(),
    status: "free" as const,
    assigneeType: "tenant" as const,
    assigneeName: "",
    modemSerialNumber: "",
    price: "",
  };

  return (
    <div className="space-y-5">
      <ModuleHeader
        title={`Ndrysho Shërbimin ${initialValues.serviceCode}`}
        description="Përditëso statusin, caktimin, çmimin dhe të dhënat e modemit."
      />
      <InternetForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
