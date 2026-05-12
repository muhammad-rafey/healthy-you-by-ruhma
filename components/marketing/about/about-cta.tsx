import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function AboutCta() {
  return (
    <section aria-labelledby="about-cta-heading" className="bg-cream py-24 md:py-32">
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <Eyebrow>Ready to start?</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading
            as="h2"
            id="about-cta-heading"
            variant="display"
            align="center"
            className="mt-4 max-w-3xl"
          >
            Let&rsquo;s talk.
          </Heading>
        </FadeUp>
        <FadeUp delay={0.16}>
          <p className="text-ink-soft mx-auto mt-6 max-w-xl text-[17px] leading-relaxed">
            Book a 30-minute consultation and walk away with a plan that fits your body, your week,
            and your life.
          </p>
        </FadeUp>
        <FadeUp delay={0.24}>
          <div className="mt-10">
            <Button asChild variant="default" size="lg">
              <Link
                href="/programs/consultation"
                data-event-name="cta_click"
                data-event-label="about_consultation"
              >
                Book a consultation
              </Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
