import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { Testimonial } from "@/lib/home-data";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section aria-labelledby="testimonials-heading" className="bg-cream py-24 md:py-32">
      <Container>
        <FadeUp>
          <div className="mb-16 max-w-xl">
            <Eyebrow>In their own words</Eyebrow>
            <Heading as="h2" id="testimonials-heading" variant="h1" className="mt-4">
              What a few months can do.
            </Heading>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {items.map((t, i) => (
            <FadeUp key={t.id} delay={i * 0.1}>
              <figure className="flex h-full flex-col">
                <blockquote
                  cite={t.context}
                  className="font-display text-ink text-[clamp(22px,2vw,28px)] leading-[1.35] tracking-[-0.015em]"
                >
                  <span aria-hidden="true" className="text-mauve">
                    &ldquo;
                  </span>
                  {t.quote}
                  <span aria-hidden="true" className="text-mauve">
                    &rdquo;
                  </span>
                </blockquote>
                <figcaption className="text-ink-soft mt-6 text-[13px] tracking-[0.04em]">
                  <span className="text-ink font-medium">{t.name}</span>
                  {t.detail && (
                    <>
                      <span className="mx-2" aria-hidden="true">
                        ·
                      </span>
                      <span>{t.detail}</span>
                    </>
                  )}
                </figcaption>
              </figure>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
