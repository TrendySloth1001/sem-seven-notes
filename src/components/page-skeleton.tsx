// Shown for a moment during client navigation while a page's URL-specific content streams in.
export function PageSkeleton() {
  return (
    <div
      className="px-4 py-8 sm:px-6 sm:py-12 lg:px-10"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="mt-4 h-10 w-3/4 rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-11/12 rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>
    </div>
  );
}
