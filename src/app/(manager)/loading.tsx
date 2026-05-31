import { ManagerContentSkeleton } from "@/components/layout/ManagerContentSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManagerLoading() {
  return (
    <div className="h-screen w-full overflow-hidden bg-[linear-gradient(130deg,#aab8e8_0%,#b4b6ed_50%,#8498ea_100%)] text-[var(--pm-text-primary)]">
      <div className="flex h-full w-full overflow-hidden border-white/50 bg-[var(--pm-surface)]/95 shadow-[0_20px_45px_-22px_rgba(34,41,87,0.45)]">
        <aside className="hidden w-20 flex-col border-r border-[var(--pm-border)]/70 bg-[var(--pm-surface)] md:flex">
          <div className="flex h-16 items-center justify-center">
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <div className="flex flex-1 flex-col items-center gap-3 py-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-10 rounded-xl" />
            ))}
          </div>
        </aside>
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b border-[var(--pm-border)]/70 bg-[var(--pm-surface)] px-4 md:px-8">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </header>
          <div className="flex-1 overflow-auto bg-[#f4f5f9] p-4 md:p-6">
            <ManagerContentSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
