import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";

interface ProgramHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  priceFrom: number;
  currency: "PKR";
  ctaLabel: string;
  ctaHref: string;
  heroImage: string;
  heroAlt: string;
}

export function ProgramHero({
  eyebrow,
  title,
  description,
  priceFrom,
  currency,
  ctaLabel,
  ctaHref,
  heroImage,
  heroAlt,
}: ProgramHeroProps) {
  const formattedPrice = new Intl.NumberFormat("en-PK").format(priceFrom);

  return (
    <section className="bg-cream pt-28 pb-20 md:pt-36 md:pb-28">
      <Container className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-6">
          <FadeUp>
            <Eyebrow>{eyebrow}</Eyebrow>
          </FadeUp>
          <LetterStagger
            as="h1"
            text={title}
            className="font-display text-ink mt-5 block text-[clamp(40px,7vw,96px)] leading-[1.02] font-medium tracking-[-0.03em]"
          />
          <FadeUp delay={0.18}>
            <p className="text-ink-soft mt-7 max-w-[44ch] text-[17px] leading-[1.65]">
              {description}
            </p>
          </FadeUp>
          <FadeUp delay={0.28}>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
              <Button asChild variant="default" size="lg">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              <span className="text-ink-soft text-[14px]">
                <span className="text-mauve tracking-[0.16em] uppercase">From</span>{" "}
                <span className="text-ink ml-1 font-medium">
                  {currency} {formattedPrice}
                </span>
              </span>
            </div>
          </FadeUp>
        </div>

        <div className="md:col-span-6">
          <ImageReveal direction="up" className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>
      </Container>
    </section>
  );
}
