"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO(phase-15): Replace with real telemetry hook (Sentry / Vercel).
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <p className="text-mauve text-[11px] font-medium tracking-[0.16em] uppercase">
        Something went sideways
      </p>
      <h1 className="font-display text-ink mt-4 text-[clamp(40px,6vw,96px)] leading-[0.95] font-medium tracking-tight">
        A small interruption.
      </h1>
      <p className="text-ink-soft mt-6 max-w-xl text-base">
        The page hit an unexpected error. We&rsquo;ve logged it. You can try again, or head back to
        the home page.
      </p>
      <div className="mt-10 flex items-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="bg-ink text-cream hover:bg-mauve-deep rounded-full px-5 py-2.5 text-sm font-medium transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-mauve text-sm tracking-wide underline-offset-4 hover:underline"
        >
          Return home →
        </Link>
      </div>
      {error.digest ? (
        <p className="text-ink-soft/60 mt-12 text-xs">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      ) : null}
    </section>
  );
}
