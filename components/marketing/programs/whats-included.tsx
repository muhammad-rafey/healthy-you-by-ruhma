import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";

type IconName = "fennel" | "mint" | "citrus" | "leaf" | "seed" | "sprig" | "root" | "pestle";

interface IncludedItem {
  icon: IconName;
  label: string;
}

interface WhatsIncludedProps {
  items: readonly IncludedItem[];
  heading?: string;
  eyebrow?: string;
}

export function WhatsIncluded({
  items,
  heading = "Everything you need, nothing you don't.",
  eyebrow = "What's included",
}: WhatsIncludedProps) {
  return (
    <section aria-label="What's included" className="bg-cream py-24 md:py-32">
      <Container>
        <FadeUp>
          <Eyebrow>{eyebrow}</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" variant="h1" className="mt-4 max-w-[18ch]">
            {heading}
          </Heading>
        </FadeUp>

        <ul className="mt-16 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <FadeUp key={item.label} delay={i * 0.05} as="li">
              <div className="flex flex-col">
                <Image
                  src={`/illustrations/${item.icon}.svg`}
                  alt=""
                  width={48}
                  height={48}
                  aria-hidden
                  className="text-ink h-12 w-12"
                />
                <p className="text-ink mt-6 max-w-[28ch] text-[17px] leading-[1.55] font-medium">
                  {item.label}
                </p>
              </div>
            </FadeUp>
          ))}
        </ul>
      </Container>
    </section>
  );
}
