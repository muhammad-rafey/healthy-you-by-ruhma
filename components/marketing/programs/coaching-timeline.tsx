import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { TimelineWeek } from "@/lib/programs-data";
import { cn } from "@/lib/cn";

interface CoachingTimelineProps {
  weeks: readonly TimelineWeek[];
}

export function CoachingTimeline({ weeks }: CoachingTimelineProps) {
  return (
    <section aria-label="What 8 weeks looks like" className="bg-cream py-24 md:py-32">
      <Container className="max-w-[960px]">
        <FadeUp>
          <Eyebrow>What 8 weeks looks like</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" variant="h1" className="mt-4 max-w-[20ch]">
            From first call to lasting change.
          </Heading>
        </FadeUp>
        <FadeUp delay={0.14}>
          <p className="text-ink-soft mt-6 max-w-[58ch] text-[17px] leading-[1.65]">
            The eight-week arc is consistent — the specifics are yours. Milestone weeks (1, 4, 8)
            mark the moments that matter most for the outcomes most clients care about.
          </p>
        </FadeUp>

        <ol role="list" className="relative mt-16 pl-10 md:mt-20 md:pl-16">
          {/* Continuous mauve connector line */}
          <span
            aria-hidden
            className="bg-mauve/40 pointer-events-none absolute top-2 bottom-4 left-[7px] w-px md:left-[11px]"
          />
          {weeks.map((w, i) => (
            <FadeUp key={w.week} delay={i * 0.05} as="li">
              <div className="relative pb-12 last:pb-0 md:pb-14">
                {/* Dot */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-[10px] -left-10 block rounded-full md:-left-16",
                    w.milestone
                      ? "bg-mauve ring-cream h-[18px] w-[18px] ring-4"
                      : "bg-cream border-mauve h-3 w-3 border",
                  )}
                />
                <div className="grid items-baseline gap-2 md:grid-cols-[140px_1fr] md:gap-10">
                  <span className="font-display text-mauve text-[36px] leading-none -tracking-[0.02em] md:text-[52px]">
                    {`Week ${String(w.week).padStart(2, "0")}`}
                  </span>
                  <div>
                    <h3
                      className={cn(
                        "font-display text-ink leading-tight",
                        w.milestone
                          ? "text-[24px] -tracking-[0.01em] italic md:text-[28px]"
                          : "text-[20px] md:text-[22px]",
                      )}
                    >
                      {w.title}
                    </h3>
                    <p className="text-ink-soft mt-3 max-w-[58ch] text-[16px] leading-[1.65]">
                      {w.body}
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </ol>
      </Container>
    </section>
  );
}
