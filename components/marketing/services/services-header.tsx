import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp } from "@/components/motion/fade-up";
import { LetterStagger } from "@/components/motion/letter-stagger";

export function ServicesHeader() {
  return (
    <header className="bg-cream pt-32 pb-20 md:pt-40 md:pb-28">
      <Container>
        <FadeUp>
          <Eyebrow>Services</Eyebrow>
        </FadeUp>
        <LetterStagger
          as="h1"
          text="All the ways we can work together."
          className="font-display text-ink mt-6 block max-w-[16ch] text-[clamp(40px,6vw,96px)] leading-[1.02] font-medium tracking-[-0.03em]"
        />
        <FadeUp delay={0.2}>
          <p className="text-ink-soft mt-8 max-w-[52ch] text-[17px] leading-[1.6]">
            From a thirty-five minute consultation to a ninety-day coaching partnership, every
            program is built around one idea: nutrition that fits the life you actually live.
          </p>
        </FadeUp>
      </Container>
    </header>
  );
}
