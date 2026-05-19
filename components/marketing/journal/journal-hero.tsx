// components/marketing/journal/journal-hero.tsx
//
// Type-only editorial header for /journal — Eyebrow + LetterStagger title +
// short subhead, matching the focus/library pattern (master §3.11).

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

interface JournalHeroProps {
  postCount: number;
}

export function JournalHero({}: JournalHeroProps) {
  return (
    <section
      aria-label="Journal header"
      className="bg-cream pt-[clamp(48px,7vw,96px)] pb-[clamp(16px,2.5vw,32px)]"
    >
      <Container>
        <Eyebrow>Journal</Eyebrow>
      </Container>
    </section>
  );
}
