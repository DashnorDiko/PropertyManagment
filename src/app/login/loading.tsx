import { Skeleton } from "@/components/ui/Skeleton";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(130deg,#aab8e8_0%,#b4b6ed_50%,#8498ea_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/35 bg-[var(--pm-surface)]/95 md:grid-cols-[1.1fr_1fr]">
        <section className="hidden min-h-[520px] bg-[radial-gradient(circle_at_30%_20%,#9aa7e8_0%,#8498ea_45%,#7d8df0_100%)] p-8 md:flex md:flex-col md:justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl bg-white/35" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3 bg-white/35" />
            <Skeleton className="h-4 w-3/4 bg-white/30" />
            <Skeleton className="h-4 w-1/2 bg-white/30" />
          </div>
          <Skeleton className="h-4 w-1/2 bg-white/30" />
        </section>
        <section className="flex min-h-[520px] flex-col justify-center p-6 sm:p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </section>
      </div>
    </main>
  );
}
