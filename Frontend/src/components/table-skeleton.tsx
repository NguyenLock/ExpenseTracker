import { Skeleton } from "@/components/ui/skeleton";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export function TableSkeleton({ columns = 3, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div
        className="grid gap-3 border-b border-border bg-background/60 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`h-${index}`} className="h-3 w-20" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={`r-${row}`}
            className="grid items-center gap-3 px-4 py-3.5"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={`c-${row}-${col}`}
                className={col === 0 ? "h-4 w-36" : "h-4 w-16"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
