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
        <FadeUp className="md:col-span-7 md:pr-4">
          <Eyebrow>About Dt. Ruhma</Eyebrow>
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
          <div className="mt-10 flex justify-center md:justify-start">
            <Button asChild variant="ghost" size="lg">
              <Link href="/about">More about Dt. Ruhma →</Link>
            </Button>
          </div>
        </FadeUp>

        <FadeUp delay={0.12} className="md:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <div
              aria-hidden
              className="bg-shell absolute inset-x-2 top-6 bottom-0 rounded-[2.5rem]"
            />
            <Image
              src="/media/home/ruhma.png"
              alt="Portrait of Dt. Ruhma."
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-contain object-bottom"
            />
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
