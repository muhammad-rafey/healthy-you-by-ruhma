import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";

interface PricingCardProps {
  priceFrom: number;
  currency: "PKR";
  bullets: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  cadence?: string;
  note?: string;
}

export function PricingCard({
  priceFrom,
  currency,
  bullets,
  ctaLabel,
  ctaHref,
  cadence = "starting from",
  note = "Installments available — monthly or fortnightly, no extra charge.",
}: PricingCardProps) {
  const formatted = new Intl.NumberFormat("en-PK").format(priceFrom);

  return (
    <section id="pricing" aria-label="Pricing" className="bg-cream py-24 md:py-32">
      <Container className="max-w-[840px]">
        <FadeUp>
          <Eyebrow>Pricing</Eyebrow>
        </FadeUp>
        <FadeUp delay={0.08}>
          <Heading as="h2" variant="h1" className="mt-4">
            Book your slot.
          </Heading>
        </FadeUp>

        <FadeUp delay={0.14}>
          <div className="bg-paper border-ink/10 mt-12 border px-7 py-10 md:px-12 md:py-14">
            <span className="text-mauve text-[12px] tracking-[0.18em] uppercase">{cadence}</span>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="font-display text-ink text-[clamp(56px,9vw,88px)] leading-[0.95] tracking-[-0.02em]">
                {formatted}
              </span>
              <span className="text-ink-soft text-[16px] tracking-[0.16em] uppercase">
                {currency}
              </span>
            </div>

            <ul className="text-ink-soft mt-10 space-y-3.5 text-[16px] leading-[1.6]">
              {bullets.map((b) => (
                <li key={b} className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="bg-mauve relative top-[7px] block h-px w-4 shrink-0"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
              <Button asChild variant="default" size="lg">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              {note && (
                <span className="text-ink-soft max-w-[40ch] text-[13px] leading-[1.5]">{note}</span>
              )}
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
