import { ModuleHeader } from "@/components/ui/ModuleHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";

const notificationQueue = [
  {
    id: "n-1",
    channel: "Email",
    title: "Maintenance fee reminder",
    audience: "12 recipients",
  },
  {
    id: "n-2",
    channel: "SMS",
    title: "Water interruption alert",
    audience: "34 recipients",
  },
  {
    id: "n-3",
    channel: "Email",
    title: "Monthly report ready",
    audience: "Board members",
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <ModuleHeader
        title="Notifications"
        description="Prepare and send resident notifications by channel."
      />
      <SurfaceCard title="Queued Messages">
        <ul className="space-y-2">
          {notificationQueue.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                {item.channel}
              </span>
              <span className="font-medium text-slate-800">{item.title}</span>
              <span className="text-slate-500">{item.audience}</span>
            </li>
          ))}
        </ul>
      </SurfaceCard>
    </div>
  );
}
