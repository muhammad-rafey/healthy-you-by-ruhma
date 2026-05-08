// components/marketing/journal/journal-hero.tsx
//
// Type-only editorial header for /journal — Eyebrow + LetterStagger title +
// short subhead, matching the focus/library pattern (master §3.11).

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";

interface JournalHeroProps {
  postCount: number;
}

export function JournalHero({ postCount }: JournalHeroProps) {
  const subhead =
    postCount > 1
      ? "Notes from the clinic — on hormones, food, and the small habits that actually move the needle. Read at your own pace."
      : "Notes from the clinic, beginning soon — on hormones, food, and the small habits that actually move the needle.";

  return (
    <section
      aria-label="Journal header"
      className="bg-cream pt-[clamp(96px,12vw,180px)] pb-[clamp(40px,6vw,96px)]"
    >
      <Container>
        <Eyebrow>Journal</Eyebrow>
        <LetterStagger
          as="h1"
          text="Notes from the clinic."
          className="font-display text-ink mt-6 block max-w-[14ch] text-[clamp(40px,8vw,96px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance"
        />
        <p className="text-ink-soft mt-8 max-w-[58ch] text-[clamp(17px,1.4vw,19px)] leading-[1.55] text-pretty">
          {subhead}
        </p>
      </Container>
    </section>
  );
}
