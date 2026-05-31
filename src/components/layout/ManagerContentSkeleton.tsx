import { Skeleton } from "@/components/ui/Skeleton";

export function ManagerContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-10 w-72 rounded-full" />
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );
}
