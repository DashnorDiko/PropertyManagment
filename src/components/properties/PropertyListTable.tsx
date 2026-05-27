import Link from "next/link";

type PropertyListItem = {
  id: string;
  unit: string;
  floor: number;
  areaSqm: number;
  occupancy: "vacant" | "occupied";
  ownerName: string;
  monthlyCharge: number;
};

type PropertyListTableProps = {
  items: PropertyListItem[];
};

const occupancyClassMap: Record<PropertyListItem["occupancy"], string> = {
  occupied: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  vacant: "bg-amber-50 text-amber-700 ring-amber-200",
};

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

export function PropertyListTable({ items }: PropertyListTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Unit</th>
            <th className="px-4 py-3 font-semibold">Floor</th>
            <th className="px-4 py-3 font-semibold">Owner</th>
            <th className="px-4 py-3 font-semibold">Area</th>
            <th className="px-4 py-3 font-semibold">Monthly Charge</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((property) => (
            <tr key={property.id} className="border-t border-slate-100">
              <td className="px-4 py-3 font-medium text-slate-900">{property.unit}</td>
              <td className="px-4 py-3 text-slate-600">{property.floor}</td>
              <td className="px-4 py-3 text-slate-600">{property.ownerName}</td>
              <td className="px-4 py-3 text-slate-600">{property.areaSqm} m²</td>
              <td className="px-4 py-3 text-slate-600">
                {formatCurrency.format(property.monthlyCharge)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${occupancyClassMap[property.occupancy]}`}
                >
                  {property.occupancy}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/properties/${property.id}/edit`}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
