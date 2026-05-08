"use client";

import { LetterStagger } from "@/components/motion/letter-stagger";
import { Container } from "@/components/ui/container";

const MANIFESTO = [
  "Nourishing you inside out,",
  "for a healthy you throughout.",
  "One quiet meal at a time.",
];

export function MomentBand() {
  return (
    <section
      aria-label="Manifesto"
      className="bg-cream relative overflow-hidden py-24 md:py-32 lg:py-40"
    >
      <div aria-hidden="true" className="bg-ink/[0.06] absolute inset-x-0 top-0 h-px" />

      <Container className="flex flex-col items-center text-center">
        <LetterStagger
          as="h2"
          text="nourish"
          className="font-display block translate-x-[0.02em] text-[clamp(64px,18vw,220px)] leading-[0.9] font-semibold tracking-[-0.04em] text-[var(--color-ink)] lowercase select-none"
        />

        <p className="text-ink-soft mt-10 max-w-md font-sans text-[18px] leading-[1.55] tracking-normal italic md:mt-12">
          {MANIFESTO.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}
