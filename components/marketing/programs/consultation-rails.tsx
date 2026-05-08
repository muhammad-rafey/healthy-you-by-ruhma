import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { ConsultationStep } from "@/lib/programs-data";

interface RailProps {
  eyebrow: string;
  heading: string;
  steps: readonly ConsultationStep[];
}

function Rail({ eyebrow, heading, steps }: RailProps) {
  return (
    <div>
      <FadeUp>
        <Eyebrow>{eyebrow}</Eyebrow>
      </FadeUp>
      <FadeUp delay={0.06}>
        <Heading as="h2" variant="h2" className="mt-4 max-w-[18ch]">
          {heading}
        </Heading>
      </FadeUp>
      <ol role="list" className="mt-10 space-y-8">
        {steps.map((s, i) => (
          <FadeUp key={s.n} delay={0.08 + i * 0.05} as="li">
            <article className="border-mauve/30 border-l-2 pl-6">
              <span className="font-display text-mauve block text-[36px] leading-none -tracking-[0.02em]">
                {s.n}
              </span>
              <h3 className="font-display text-ink mt-4 text-[20px] leading-tight md:text-[22px]">
                {s.title}
              </h3>
              <p className="text-ink-soft mt-2 text-[15px] leading-[1.65]">{s.body}</p>
            </article>
          </FadeUp>
        ))}
      </ol>
    </div>
  );
}

interface ConsultationRailsProps {
  expect: readonly ConsultationStep[];
  prepare: readonly ConsultationStep[];
}

export function ConsultationRails({ expect, prepare }: ConsultationRailsProps) {
  return (
    <section aria-label="What to expect and how to prepare" className="bg-cream py-24 md:py-32">
      <Container className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20">
        <Rail
          eyebrow="What to expect"
          heading="A clear, calm thirty-five minutes."
          steps={expect}
        />
        <Rail eyebrow="How to prepare" heading="Three things to bring." steps={prepare} />
      </Container>
    </section>
  );
}
