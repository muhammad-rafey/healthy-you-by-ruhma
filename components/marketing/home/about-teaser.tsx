import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

export function AboutTeaser() {
  return (
    <section aria-labelledby="about-teaser-heading" className="bg-cream-deep py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
        <FadeUp className="md:col-span-5">
          <div className="bg-shell relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src="/media/home/about-teaser-1001.webp"
              alt="Dr. Ruhma at her practice in Faisalabad."
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </FadeUp>

        <FadeUp delay={0.12} className="md:col-span-7 md:pl-4">
          <Eyebrow>About Dr. Ruhma</Eyebrow>
          <Heading as="h2" id="about-teaser-heading" variant="h1" className="mt-4">
            My mission is to make you shine from inside.
          </Heading>
          <div className="text-ink-soft mt-8 space-y-5 text-[17px] leading-relaxed">
            <p>
              I&rsquo;m a clinical dietitian based in Faisalabad. For the last several years I have
              worked with women navigating PCOS, thyroid imbalance, sustainable weight loss, and the
              slow daily work of eating in a way that fits a real life.
            </p>
            <p>
              My approach is unhurried. We start with what is actually happening in your body and
              your week, and we build from there — small, evidence-based, repeatable.
            </p>
          </div>
          <div className="mt-10">
            <Button asChild variant="ghost" size="lg">
              <Link href="/about">More about Dr. Ruhma →</Link>
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
