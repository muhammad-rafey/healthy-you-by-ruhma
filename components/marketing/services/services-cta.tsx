import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function ServicesCta() {
  return (
    <section aria-labelledby="services-cta-heading" className="bg-cream py-24 md:py-32">
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <Eyebrow>Not sure where to start?</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading
            as="h2"
            id="services-cta-heading"
            variant="display"
            align="center"
            className="mt-4 max-w-3xl"
          >
            Let&rsquo;s start with a conversation.
          </Heading>
        </FadeUp>
        <FadeUp delay={0.16}>
          <p className="text-ink-soft mx-auto mt-6 max-w-xl text-[17px] leading-relaxed">
            A focused thirty-five minute call to understand where you are and map a clear next step.
            Often the right place to begin.
          </p>
        </FadeUp>
        <FadeUp delay={0.24}>
          <div className="mt-10">
            <Button asChild variant="default" size="lg">
              <Link
                href="/programs/consultation"
                data-event-name="cta_click"
                data-event-label="services_consultation"
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
