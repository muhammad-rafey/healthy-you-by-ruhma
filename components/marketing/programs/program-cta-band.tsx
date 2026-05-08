import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

interface ProgramCtaBandProps {
  line?: string;
  ctaLabel: string;
  ctaHref: string;
}

export function ProgramCtaBand({
  line = "Ready to start?",
  ctaLabel,
  ctaHref,
}: ProgramCtaBandProps) {
  return (
    <section aria-labelledby="program-cta-heading" className="bg-ink py-24 md:py-32">
      <Container className="flex flex-col items-center text-center">
        <FadeUp>
          <Heading
            as="h2"
            id="program-cta-heading"
            variant="display"
            align="center"
            className="text-cream max-w-3xl"
          >
            {line}
          </Heading>
        </FadeUp>
        <FadeUp delay={0.12}>
          <div className="mt-10">
            <Button asChild variant="mauve" size="lg">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
