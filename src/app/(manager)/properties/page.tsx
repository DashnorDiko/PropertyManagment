import Link from "next/link";

import { PropertyListTable } from "@/components/properties/PropertyListTable";
import { ModuleHeader } from "@/components/ui/ModuleHeader";

const propertyRows = [
  {
    id: "p-101",
    unit: "A-101",
    floor: 1,
    areaSqm: 87,
    occupancy: "occupied" as const,
    ownerName: "Ilir Dervishi",
    monthlyCharge: 42.5,
  },
  {
    id: "p-202",
    unit: "A-202",
    floor: 2,
    areaSqm: 64,
    occupancy: "vacant" as const,
    ownerName: "Mira Basha",
    monthlyCharge: 35.0,
  },
  {
    id: "p-305",
    unit: "B-305",
    floor: 3,
    areaSqm: 102,
    occupancy: "occupied" as const,
    ownerName: "Dorian Tafani",
    monthlyCharge: 58.75,
  },
];

export default function PropertiesPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Properties"
        description="Manage unit metadata, occupancy, and monthly billing setup."
        actions={
          <Link
            href="/properties/new"
            className="rounded-md border border-indigo-600 bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Property
          </Link>
        }
      />

      <PropertyListTable items={propertyRows} />
    </div>
  );
}
