export default function MosqueDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-28 bg-sand rounded animate-pulse" />

      <div className="bg-white border border-sand-dark rounded-card p-6 space-y-3">
        <div className="h-8 w-2/3 bg-sand rounded animate-pulse" />
        <div className="h-4 w-full bg-sand rounded animate-pulse" />
        <div className="h-3 w-1/4 bg-sand rounded animate-pulse" />
        <div className="flex gap-3 mt-4">
          <div className="h-9 w-36 bg-sand rounded-button animate-pulse" />
          <div className="h-9 w-28 bg-sand rounded-button animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-6 w-48 bg-sand rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-sand-dark rounded-card p-5 space-y-3">
              <div className="h-5 w-16 bg-sand rounded-pill animate-pulse" />
              <div className="h-5 w-3/4 bg-sand rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-sand rounded animate-pulse" />
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-sand rounded animate-pulse" />
                <div className="h-4 w-16 bg-sand rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
