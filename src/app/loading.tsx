export default function HomeLoading() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="h-32 bg-sand rounded-card animate-pulse" />

      {/* Filters skeleton */}
      <div className="h-24 bg-sand rounded-card animate-pulse" />

      {/* Event cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-sand rounded-pill animate-pulse" />
              <div className="h-5 w-20 bg-sand rounded-pill animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-sand rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-sand rounded animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-sand rounded animate-pulse" />
              <div className="h-4 w-16 bg-sand rounded animate-pulse" />
              <div className="h-4 w-16 bg-sand rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
