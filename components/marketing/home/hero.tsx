import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { HeroPortrait } from "./hero-portrait";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-cream relative pt-16 pb-16 md:pt-24 md:pb-24 lg:pt-32 lg:pb-32"
    >
      <Container
        width="wide"
        className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 lg:gap-16"
      >
        {/* Left — copy */}
        <div className="flex flex-col justify-center md:col-span-6 md:pr-4 lg:pr-8">
          <Eyebrow className="mb-6">Healthy You By Ruhma · Faisalabad, Pakistan</Eyebrow>

          <LetterStagger
            as="h1"
            text="A healthy you, one quiet meal at a time."
            className="type-display block"
          />

          <p className="text-ink-soft mt-6 max-w-xl text-[17px] leading-relaxed">
            Evidence-based, deeply personal dietetics from Dr. Ruhma — focused on hormonal health,
            sustainable weight management, and a way of eating you can keep for life.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="default" size="lg">
              <Link href="/programs/consultation">Book a consultation</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/about">Meet Dr. Ruhma</Link>
            </Button>
          </div>
        </div>

        {/* Right — portrait */}
        <div className="md:col-span-6">
          <HeroPortrait />
        </div>
      </Container>
    </section>
  );
}
