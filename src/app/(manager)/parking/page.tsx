import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const parkingSlots = [
  { slot: "P-01", tenant: "Ardit Kola", status: "Assigned" },
  { slot: "P-02", tenant: "Vacant", status: "Available" },
  { slot: "P-03", tenant: "Eda Leka", status: "Assigned" },
  { slot: "P-04", tenant: "Visitor", status: "Temporary" },
];

export default function ParkingPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Parking"
        description="Track parking slot allocation and temporary visitor access."
      />
      <SurfaceCard title="Parking Slots" subtitle="Current slot occupancy">
        <ul className="space-y-2">
          {parkingSlots.map((slot) => (
            <li
              key={slot.slot}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-800">{slot.slot}</span>
              <span className="text-slate-600">{slot.tenant}</span>
              <span className="text-slate-500">{slot.status}</span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
