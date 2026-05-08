import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { Pillar } from "@/lib/home-data";

export function Pillars({ items }: { items: Pillar[] }) {
  return (
    <section aria-labelledby="pillars-heading" className="bg-cream-deep py-24 md:py-32">
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-2xl">
            <Eyebrow>Three quiet focuses</Eyebrow>
            <Heading as="h2" id="pillars-heading" variant="h1" className="mt-4">
              Where most of the work happens.
            </Heading>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:gap-16">
          {items.map((pillar, i) => (
            <FadeUp key={pillar.slug} delay={i * 0.08}>
              <article className="flex flex-col">
                <div className="mb-6 h-20 w-20">
                  <Image
                    src={pillar.illustration}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full"
                  />
                </div>
                <Eyebrow className="text-ink-soft">{pillar.eyebrow}</Eyebrow>
                <h3 className="font-display text-ink mt-3 text-[28px] leading-[1.1] font-medium tracking-[-0.015em]">
                  {pillar.title}
                </h3>
                <p className="text-ink-soft mt-4 text-[17px] leading-relaxed">
                  {pillar.description}
                </p>
                <Link
                  href={pillar.href}
                  className="text-mauve hover:text-mauve-deep mt-6 inline-flex items-baseline gap-2 text-[14px] font-medium underline-offset-4 hover:underline"
                >
                  Read more
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
