import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const reportItems = [
  { name: "Monthly Charges", generatedAt: "2026-05-24", format: "PDF" },
  { name: "Parking Ledger", generatedAt: "2026-05-22", format: "CSV" },
  { name: "Collections Summary", generatedAt: "2026-05-21", format: "PDF" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Reports"
        description="Generate and review operational and financial reports."
      />
      <SurfaceCard title="Recent Exports">
        <ul className="space-y-2">
          {reportItems.map((report) => (
            <li
              key={`${report.name}-${report.generatedAt}`}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-800">{report.name}</span>
              <span className="text-slate-600">{report.generatedAt}</span>
              <span className="text-slate-500">{report.format}</span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
