import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";
import { BOOKING } from "@/lib/programs-data";

export function Booking() {
  return (
    <section id="book" aria-labelledby="booking-heading" className="bg-cream-deep py-24 md:py-32">
      <Container className="max-w-[1080px]">
        <FadeUp>
          <Eyebrow>Schedule your call</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" id="booking-heading" variant="h1" className="mt-4 max-w-[18ch]">
            {BOOKING.headline}
          </Heading>
        </FadeUp>
        <FadeUp delay={0.14}>
          <p className="text-ink-soft mt-6 max-w-[58ch] text-[17px] leading-[1.65]">
            A thirty-five minute introductory call by video. We&rsquo;ll cover what you&rsquo;re
            working on, whether the practice is a fit, and the practical next step if it is.
          </p>
        </FadeUp>

        <FadeUp delay={0.18}>
          <div
            role="region"
            aria-label="Book a call"
            className="bg-paper border-ink/10 mt-12 flex min-h-[320px] flex-col items-center justify-center border px-8 py-16 text-center"
          >
            <p className="font-display text-ink max-w-[28ch] text-[clamp(22px,2.4vw,28px)] leading-[1.25]">
              {BOOKING.note}
            </p>

            <div className="mt-10">
              <Button asChild variant="default" size="lg">
                <a href={BOOKING.calendlyUrl} target="_blank" rel="noopener noreferrer">
                  {BOOKING.ctaLabel} →
                </a>
              </Button>
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
