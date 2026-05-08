// components/marketing/library/ebook-toc.tsx
//
// "Inside" — editorial numbered TOC preview. Pulls toc[] from the MDX
// frontmatter and renders each chapter as a row of (large mauve numeral,
// chapter title). If the TOC is longer than 8 items the rest are hidden
// behind a "…and more inside" line so the page never reveals the full book.

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";

interface EbookTOCProps {
  toc: readonly string[];
  maxVisible?: number;
}

export function EbookTOC({ toc, maxVisible = 8 }: EbookTOCProps) {
  const visible = toc.slice(0, maxVisible);
  const hidden = Math.max(0, toc.length - maxVisible);

  return (
    <section aria-labelledby="ebook-toc-heading" className="bg-cream-deep py-24 md:py-32">
      <Container>
        <div className="max-w-[820px]">
          <Eyebrow className="text-mauve">Inside</Eyebrow>
          <Heading as="h2" id="ebook-toc-heading" variant="h1" className="mt-4 max-w-[16ch]">
            What you&rsquo;ll find in these pages.
          </Heading>
        </div>

        <ol className="divide-ink/15 border-ink/15 mt-16 divide-y border-y">
          {visible.map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[64px_1fr] items-baseline gap-6 py-6 md:grid-cols-[120px_1fr] md:gap-10 md:py-8"
            >
              <span
                className="font-display text-mauve text-[clamp(36px,5vw,72px)] leading-none font-medium tracking-[-0.04em] tabular-nums"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-ink text-[18px] leading-[1.4] md:text-[22px]">{item}</span>
            </li>
          ))}
        </ol>

        {hidden > 0 && (
          <p className="text-ink-soft mt-8 text-[15px] tracking-wide italic">
            …and {hidden} more chapter{hidden === 1 ? "" : "s"} inside.
          </p>
        )}
      </Container>
    </section>
  );
}
