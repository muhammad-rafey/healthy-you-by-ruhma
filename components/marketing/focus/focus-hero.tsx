// components/marketing/focus/focus-hero.tsx
//
// Type-only editorial hero for the focus pages. No image — the negative
// space is the design (master §3.7). Cream background, large display title,
// "Focus area" eyebrow, 2-line subhead.

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";

interface FocusHeroProps {
  eyebrow: string;
  title: string;
  subhead: string;
}

export function FocusHero({ eyebrow, title, subhead }: FocusHeroProps) {
  return (
    <section
      aria-label="Focus hero"
      className="bg-cream pt-[clamp(96px,12vw,180px)] pb-[clamp(48px,6vw,96px)]"
    >
      <Container>
        <div className="max-w-[880px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <LetterStagger
            as="h1"
            text={title}
            className="font-display text-ink mt-6 block text-[clamp(40px,8vw,96px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance"
          />
          <p className="text-ink-soft mt-8 max-w-[640px] text-[clamp(17px,1.4vw,19px)] leading-[1.55] text-pretty">
            {subhead}
          </p>
        </div>
      </Container>
    </section>
  );
}
