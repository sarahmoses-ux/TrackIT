import clsx from "../utils/clsx";

export default function Skeleton({ className }) {
  return <div className={clsx("skeleton-block", className)} />;
}

const gridClassMap = {
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
};

export function TableSkeleton({ columns = 6, rows = 5 }) {
  const gridClass = gridClassMap[columns] ?? "grid-cols-6";

  return (
    <div className="table-shell">
      <div className="min-w-full">
        <div className={clsx("grid gap-3 border-b border-border bg-slate-50 px-4 py-3", gridClass)}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-20" />
          ))}
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={clsx("grid gap-3", gridClass)}
            >
              {Array.from({ length: columns }).map((_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
