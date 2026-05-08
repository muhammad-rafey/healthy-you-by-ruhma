// components/marketing/journal/pull-quote.tsx
//
// Pull-quote treatment for MDX <blockquote> inside a journal post body —
// Epilogue, mauve, italic, with a small botanical flourish. Mirrors the
// focus pull-quote (lib/components/marketing/focus/pull-quote.tsx) but
// is its own component so journal-specific tweaks don't ripple back.

import Image from "next/image";
import type { ReactNode } from "react";

interface JournalPullQuoteProps {
  children: ReactNode;
  attribution?: string;
}

export function JournalPullQuote({ children, attribution }: JournalPullQuoteProps) {
  return (
    <figure className="relative mx-auto my-12 max-w-[600px]">
      <Image
        src="/illustrations/sprig.svg"
        alt=""
        width={36}
        height={36}
        aria-hidden
        className="absolute -top-4 -left-2 h-9 w-9 opacity-30"
        unoptimized
      />
      <blockquote className="font-display text-mauve relative pl-8 text-[clamp(22px,2.5vw,32px)] leading-[1.25] font-normal tracking-[-0.01em] text-balance italic">
        {children}
      </blockquote>
      {attribution ? (
        <figcaption className="text-ink-soft mt-4 pl-8 font-sans text-[13px] tracking-[0.04em] not-italic">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
