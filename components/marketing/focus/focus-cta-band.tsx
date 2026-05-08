// components/marketing/focus/focus-cta-band.tsx
//
// Soft funnel out of a focus longread — "Want a tailored plan? / Book a
// consultation" → /programs/consultation. Cream-deep band, Epilogue line,
// mauve button. Lighter than the program CTA (no full-bleed ink panel).

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function FocusCtaBand() {
  return (
    <section
      aria-labelledby="focus-cta-heading"
      className="bg-cream-deep py-[clamp(72px,10vw,128px)]"
    >
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <p className="type-eyebrow">Next step</p>
          <Heading
            as="h2"
            id="focus-cta-heading"
            variant="h1"
            align="center"
            className="mt-4 max-w-[820px]"
          >
            Want a tailored plan?
          </Heading>
          <p className="text-ink-soft mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.55] text-pretty">
            Generic advice does not know your hormones, your routine, or your kitchen. A
            consultation does.
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
