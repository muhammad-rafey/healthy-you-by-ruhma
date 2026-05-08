// components/marketing/focus/pull-quote.tsx
//
// Pull-quote treatment for MDX `<blockquote>` inside the focus longread
// body — Epilogue large, italic, mauve, indented, with a small botanical
// flourish. Used as the MDX `blockquote` override and also exposed as the
// explicit `<Pullquote>` MDX component for prose authors who want it
// inline.

import Image from "next/image";
import type { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: string;
}

export function FocusPullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <figure className="focus-pullquote relative mx-auto my-12 max-w-[640px]">
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
