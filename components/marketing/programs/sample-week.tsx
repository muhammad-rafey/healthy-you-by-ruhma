import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { SampleDay } from "@/lib/programs-data";

interface SampleWeekProps {
  week: readonly SampleDay[];
}

const ROWS = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["dinner", "Dinner"],
] as const;

export function SampleWeek({ week }: SampleWeekProps) {
  return (
    <section aria-label="Sample week" className="bg-cream-deep py-24 md:py-32">
      <Container>
        <FadeUp>
          <Eyebrow>Sample week</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" variant="h1" className="mt-4 max-w-[20ch]">
            Real food. Seven days. Built around you.
          </Heading>
        </FadeUp>
        <FadeUp delay={0.16}>
          <p className="text-ink-soft mt-6 max-w-[58ch] text-[17px] leading-[1.65]">
            What follows is a representative week — not a prescription. Your plan is built around
            your routine, your kitchen, your preferences and your clinical picture.
          </p>
        </FadeUp>
      </Container>

      <FadeUp delay={0.18}>
        <div className="mt-12 md:mt-16">
          <ol
            role="list"
            aria-label="Seven-day sample meal plan"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-10 sm:px-8 md:gap-6 md:px-12"
          >
            {week.map((d) => (
              <li
                key={d.day}
                className="bg-paper border-ink/10 flex w-[88vw] max-w-[380px] shrink-0 snap-start flex-col border sm:w-[60vw] md:w-[340px]"
              >
                <header className="border-mauve/30 flex items-baseline justify-between border-b px-7 py-5">
                  <span className="font-display text-ink text-[26px] leading-none -tracking-[0.02em]">
                    {d.day}
                  </span>
                  <span className="text-mauve text-[11px] tracking-[0.18em] uppercase">
                    {d.short}
                  </span>
                </header>

                <dl className="divide-ink/10 flex-1 divide-y px-7">
                  {ROWS.map(([key, label]) => (
                    <div key={key} className="grid grid-cols-[78px_1fr] items-baseline gap-4 py-5">
                      <dt className="text-ink-soft text-[11px] tracking-[0.16em] uppercase">
                        {label}
                      </dt>
                      <dd className="text-ink font-sans text-[15px] leading-[1.55]">{d[key]}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </FadeUp>

      <Container>
        <p className="text-ink-soft mt-2 text-[13px] leading-[1.55] italic">
          &mdash; Sample only. Final plans are calibrated to your blood work, schedule and pantry.
        </p>
      </Container>
    </section>
  );
}
