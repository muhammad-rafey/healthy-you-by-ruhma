import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="bg-cream-deep py-24 md:py-32">
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <Heading as="h2" id="cta-heading" variant="display" align="center" className="max-w-3xl">
            Ready when you are.
          </Heading>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="mt-10">
            <Button asChild variant="default" size="lg">
              <Link
                href="/programs/consultation"
                data-event-name="cta_click"
                data-event-label="home_consultation"
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
