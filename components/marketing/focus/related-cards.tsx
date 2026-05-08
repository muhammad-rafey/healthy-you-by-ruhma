// components/marketing/focus/related-cards.tsx
//
// "Where to go next." — 2 link cards pointing into Programs / Library, used
// as the soft funnel out of a focus longread (master §3.7). Restrained,
// editorial — not the main library product grid.

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { RelatedCard } from "@/lib/focus-data";

const KIND_LABEL: Record<RelatedCard["kind"], string> = {
  program: "Program",
  library: "Guidebook",
};

interface RelatedCardsProps {
  items: readonly RelatedCard[];
}

export function RelatedCards({ items }: RelatedCardsProps) {
  return (
    <section
      aria-labelledby="focus-related-heading"
      className="bg-cream py-[clamp(72px,10vw,128px)]"
    >
      <Container>
        <FadeUp>
          <Eyebrow>Related</Eyebrow>
          <Heading as="h2" variant="h1" id="focus-related-heading" className="mt-4 max-w-[720px]">
            Where to go next.
          </Heading>
        </FadeUp>

        <ul className="mt-14 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
          {items.map((item, i) => (
            <FadeUp as="li" key={`${item.kind}-${item.href}`} delay={0.05 * (i + 1)}>
              <Link
                href={item.href}
                className="group bg-paper hover:bg-shell/40 focus-visible:ring-mauve block h-full p-8 transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none md:p-10"
              >
                <Eyebrow>{`${KIND_LABEL[item.kind]} · ${item.eyebrow}`}</Eyebrow>
                <h3 className="font-display text-ink mt-5 text-[clamp(22px,2vw,28px)] leading-[1.2] font-medium tracking-[-0.01em]">
                  {item.title}
                </h3>
                <p className="text-ink-soft mt-3 text-[15px] leading-[1.55] text-pretty">
                  {item.description}
                </p>
                <span className="text-mauve group-hover:text-mauve-deep mt-6 inline-flex items-center gap-2 text-[14px] tracking-[0.02em] transition-colors">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            </FadeUp>
          ))}
        </ul>
      </Container>
    </section>
  );
}
