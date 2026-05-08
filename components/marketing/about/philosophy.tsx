import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";

interface PhilosophyProps {
  principles: string[];
  eyebrow?: string;
  heading?: string;
}

export function Philosophy({
  principles,
  eyebrow = "Philosophy",
  heading = "Four ideas the practice runs on.",
}: PhilosophyProps) {
  if (process.env.NODE_ENV !== "production" && principles.length !== 4) {
    // The signature visual is built around four numerals — guard against drift.
    console.warn(`[Philosophy] Expected exactly 4 principles, received ${principles.length}.`);
  }

  return (
    <section aria-labelledby="philosophy-heading" className="bg-cream-deep py-28 md:py-32 lg:py-40">
      <Container>
        <FadeUp className="mb-16 max-w-[640px] md:mb-20 lg:mb-24">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Heading as="h2" id="philosophy-heading" variant="h1" className="mt-4">
            {heading}
          </Heading>
        </FadeUp>

        <ol className="list-none space-y-14 md:space-y-16 lg:space-y-20">
          {principles.map((principle, i) => {
            const numeral = String(i + 1).padStart(2, "0");
            return (
              <FadeUp key={numeral} as="li" delay={i * 0.05}>
                <div className="grid grid-cols-12 items-baseline gap-6 md:gap-8">
                  <span
                    aria-hidden
                    className="font-display text-mauve col-span-3 text-[clamp(56px,9vw,144px)] leading-[0.9] font-medium tracking-[-0.04em] tabular-nums md:col-span-2"
                  >
                    {numeral}
                  </span>

                  <p className="text-ink col-span-9 max-w-[60ch] font-sans text-[clamp(18px,1.4vw,22px)] leading-[1.45] tracking-[-0.005em] md:col-span-9 lg:col-span-8">
                    {principle}
                  </p>
                </div>
              </FadeUp>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
