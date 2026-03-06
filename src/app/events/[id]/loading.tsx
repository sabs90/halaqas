export default function EventDetailLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="h-4 w-28 bg-sand rounded animate-pulse" />

      <div className="bg-white border border-sand-dark rounded-card p-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-sand rounded-pill animate-pulse" />
        </div>
        <div className="h-8 w-3/4 bg-sand rounded animate-pulse" />
        <div className="h-5 w-1/3 bg-sand rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-sand rounded animate-pulse" />

        <div className="flex flex-wrap gap-4">
          <div className="h-4 w-20 bg-sand rounded animate-pulse" />
          <div className="h-4 w-32 bg-sand rounded animate-pulse" />
          <div className="h-4 w-16 bg-sand rounded animate-pulse" />
          <div className="h-4 w-16 bg-sand rounded animate-pulse" />
        </div>

        <div className="pt-2 border-t border-sand-dark">
          <div className="h-4 w-full bg-sand rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-sand rounded animate-pulse mt-2" />
        </div>

        <div className="flex gap-3 pt-2">
          <div className="h-9 w-32 bg-sand rounded-button animate-pulse" />
          <div className="h-9 w-24 bg-sand rounded-button animate-pulse" />
        </div>
      </div>
    </div>
  );
}
