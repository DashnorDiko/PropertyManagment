type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={[
        "animate-pulse rounded-md bg-[var(--pm-surface-muted)]/80",
        className ?? "",
      ].join(" ")}
      aria-hidden="true"
    />
  );
}
