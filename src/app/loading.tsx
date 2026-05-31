import { Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-[var(--pm-border)] bg-[var(--pm-surface)] p-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </main>
  );
}
