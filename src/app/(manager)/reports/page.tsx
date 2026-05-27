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
      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard title="Recent Exports">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">{reportItems.length}</p>
        </SurfaceCard>
        <SurfaceCard title="PDF Files">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">
            {reportItems.filter((report) => report.format === "PDF").length}
          </p>
        </SurfaceCard>
        <SurfaceCard title="CSV Files">
          <p className="text-3xl font-bold text-[var(--pm-text-primary)]">
            {reportItems.filter((report) => report.format === "CSV").length}
          </p>
        </SurfaceCard>
      </div>

      <SurfaceCard title="Recent Exports">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--pm-border)]/60 bg-[var(--pm-surface-soft)] text-xs uppercase tracking-wide text-[var(--pm-text-secondary)]">
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Generated</th>
                <th className="px-4 py-3">Format</th>
              </tr>
            </thead>
            <tbody>
              {reportItems.map((report) => (
                <tr
                  key={`${report.name}-${report.generatedAt}`}
                  className="border-b border-[var(--pm-border)]/60 hover:bg-[var(--pm-surface-soft)]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--pm-text-primary)]">{report.name}</td>
                  <td className="px-4 py-3 text-[var(--pm-text-secondary)]">{report.generatedAt}</td>
                  <td className="px-4 py-3 text-[var(--pm-text-secondary)]">{report.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
