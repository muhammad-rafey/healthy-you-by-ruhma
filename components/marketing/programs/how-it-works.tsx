import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";

interface Step {
  n: string;
  title: string;
  body: string;
}

interface HowItWorksProps {
  steps: readonly Step[];
  heading?: string;
  eyebrow?: string;
  ariaLabel?: string;
}

export function HowItWorks({
  steps,
  heading = "From inquiry to result.",
  eyebrow = "How it works",
  ariaLabel = "How it works",
}: HowItWorksProps) {
  return (
    <section aria-label={ariaLabel} className="bg-cream-deep py-24 md:py-32">
      <Container>
        <FadeUp>
          <Eyebrow>{eyebrow}</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" variant="h1" className="mt-4 max-w-[18ch]">
            {heading}
          </Heading>
        </FadeUp>
      </Container>

      <div className="mt-14 md:mt-20">
        <ol
          role="list"
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-8 sm:px-8 md:grid md:snap-none md:grid-cols-4 md:gap-6 md:overflow-visible md:px-12 md:pb-0 lg:gap-10"
        >
          {steps.map((step, i) => (
            <FadeUp key={step.n} delay={i * 0.06} as="li">
              <article className="bg-paper border-mauve/30 h-full w-[80vw] max-w-[340px] shrink-0 snap-start border-l-2 px-7 py-9 sm:w-[60vw] md:w-auto md:max-w-none">
                <span className="font-display text-mauve block text-[56px] leading-none tracking-[-0.02em] md:text-[64px]">
                  {step.n}
                </span>
                <h3 className="font-display text-ink mt-6 text-[22px] leading-tight md:text-[24px]">
                  {step.title}
                </h3>
                <p className="text-ink-soft mt-3 text-[15px] leading-[1.65]">{step.body}</p>
              </article>
            </FadeUp>
          ))}
        </ol>
      </div>
    </section>
  );
}
