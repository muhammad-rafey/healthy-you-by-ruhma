// components/marketing/focus/conditions-list.tsx
//
// "Where this shows up" — three numbered conditions for a focus area
// (master §3.7). Cream-deep panel, Epilogue heading, numbered editorial list.

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { Condition } from "@/lib/focus-data";

interface ConditionsListProps {
  conditions: readonly Condition[];
  heading?: string;
}

export function ConditionsList({
  conditions,
  heading = "Where this shows up",
}: ConditionsListProps) {
  return (
    <section
      aria-labelledby="focus-conditions-heading"
      className="bg-cream-deep py-[clamp(72px,10vw,128px)]"
    >
      <Container>
        <FadeUp>
          <Eyebrow>Reference</Eyebrow>
          <Heading
            as="h2"
            variant="h1"
            id="focus-conditions-heading"
            className="mt-4 max-w-[720px]"
          >
            {heading}
          </Heading>
        </FadeUp>

        <ol className="mt-14 grid list-none grid-cols-1 gap-12 p-0 md:grid-cols-3 md:gap-10">
          {conditions.map((c, i) => (
            <FadeUp as="li" key={c.title} delay={0.05 * (i + 1)}>
              <span className="font-display text-mauve block text-[32px] leading-none tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-ink mt-4 text-[24px] leading-[1.2] font-medium tracking-[-0.01em]">
                {c.title}
              </h3>
              <p className="text-ink-soft mt-3 text-[16px] leading-[1.55] text-pretty">
                {c.summary}
              </p>
            </FadeUp>
          ))}
        </ol>
      </Container>
    </section>
  );
}
