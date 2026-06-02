import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";

interface AboutHeroProps {
  eyebrow: string;
  title: string;
  intro: string;
  image: { src: string; alt: string };
  cta?: { href: string; label: string };
}

export function AboutHero({
  eyebrow,
  title,
  intro,
  image,
  cta = { href: "/programs/consultation", label: "Book a consultation" },
}: AboutHeroProps) {
  return (
    <section aria-label="About hero" className="bg-cream relative isolate overflow-hidden">
      <Container
        width="wide"
        className="grid grid-cols-1 items-center gap-12 pt-[clamp(96px,12vw,180px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-2 lg:gap-16"
      >
        {/* Text — first (left on desktop, on top when stacked on mobile). */}
        <div className="flex flex-col">
          <FadeUp>
            <Eyebrow className="text-mauve">{eyebrow}</Eyebrow>
          </FadeUp>

          <LetterStagger
            as="h1"
            text={title}
            className="font-display text-ink mt-5 block text-[clamp(40px,6vw,72px)] leading-[1.02] font-medium tracking-[-0.03em]"
          />

          <FadeUp delay={0.15}>
            <p className="text-ink-soft mt-6 max-w-xl text-[clamp(17px,1.4vw,20px)] leading-[1.7] italic">
              {intro}
            </p>
          </FadeUp>

          <FadeUp delay={0.25}>
            <div className="mt-9">
              <Button asChild variant="default" size="lg">
                <Link href={cta.href} data-event-name="cta_click" data-event-label="about_hero">
                  {cta.label}
                </Link>
              </Button>
            </div>
          </FadeUp>
        </div>

        {/* Clean framed portrait — tall rounded frame, soft shadow. */}
        <div className="relative mx-auto w-full max-w-[440px]">
          <ImageReveal
            direction="left"
            className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-[0_18px_40px_-12px_rgba(26,26,26,0.35),0_50px_90px_-30px_rgba(137,85,117,0.35)]"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="scale-105 object-cover object-[center_20%]"
            />
          </ImageReveal>
        </div>
      </Container>
    </section>
  );
}
