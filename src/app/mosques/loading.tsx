export default function MosquesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-sand rounded animate-pulse" />
      <div className="h-4 w-2/3 bg-sand rounded animate-pulse" />

      {/* Search skeleton */}
      <div className="h-10 bg-sand rounded-card animate-pulse" />

      {/* Map skeleton */}
      <div className="h-[350px] bg-sand rounded-card animate-pulse" />

      {/* Mosque cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-sand-dark rounded-card p-5 space-y-2">
            <div className="flex items-start justify-between">
              <div className="h-5 w-2/3 bg-sand rounded animate-pulse" />
              <div className="h-4 w-8 bg-sand rounded-pill animate-pulse" />
            </div>
            <div className="h-4 w-full bg-sand rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-sand rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
