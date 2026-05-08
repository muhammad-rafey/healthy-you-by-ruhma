// components/marketing/library/library-cta-band.tsx
//
// Closing band for /library — soft funnel into a consultation for readers
// who can't pick a guidebook on their own.

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function LibraryCtaBand() {
  return (
    <section
      aria-labelledby="library-cta-heading"
      className="bg-cream-deep py-[clamp(72px,10vw,128px)]"
    >
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <Eyebrow>Not sure where to start?</Eyebrow>
          <Heading
            as="h2"
            id="library-cta-heading"
            variant="h1"
            align="center"
            className="mt-4 max-w-[16ch]"
          >
            Book a consultation.
          </Heading>
          <p className="text-ink-soft mx-auto mt-6 max-w-[520px] text-[17px] leading-[1.55] text-pretty">
            Twenty-five minutes with Dr. Ruhma is the fastest way to know which guidebook fits your
            body — or whether a tailored plan is the better next step.
          </p>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="mt-10">
            <Button asChild variant="mauve" size="lg">
              <Link href="/programs/consultation">Book a consultation</Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
