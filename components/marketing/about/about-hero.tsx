import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";

interface AboutHeroProps {
  eyebrow: string;
  title: string;
  image: { src: string; alt: string };
}

export function AboutHero({ eyebrow, title, image }: AboutHeroProps) {
  return (
    <section aria-label="About hero" className="bg-ink relative isolate overflow-hidden">
      <ImageReveal
        direction="up"
        className="relative aspect-[4/5] w-full md:aspect-[3/4] lg:aspect-[16/10]"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div
          aria-hidden
          className="from-ink/70 via-ink/20 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </ImageReveal>

      <Container className="absolute inset-x-0 bottom-0 pb-12 md:pb-16 lg:pb-20">
        <Eyebrow className="text-cream/85 mb-3 block">{eyebrow}</Eyebrow>
        <LetterStagger
          as="h1"
          text={title}
          className="font-display text-cream block text-[clamp(40px,9vw,96px)] leading-[1.02] font-medium tracking-[-0.03em]"
        />
      </Container>
    </section>
  );
}
