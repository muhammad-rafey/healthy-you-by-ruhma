// Editorial route-level loading skeleton. No spinner; subtle pulse on
// typographic placeholders so it feels like the layout that will follow.
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <div className="bg-ink/10 h-3 w-24 animate-pulse rounded-full" />
      <div className="bg-ink/10 mt-6 h-12 w-3/4 max-w-2xl animate-pulse rounded-md" />
      <div className="bg-ink/10 mt-4 h-12 w-1/2 max-w-xl animate-pulse rounded-md" />
      <div className="bg-ink/10 mt-10 h-4 w-2/3 max-w-lg animate-pulse rounded" />
      <div className="bg-ink/10 mt-2 h-4 w-1/2 max-w-md animate-pulse rounded" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
