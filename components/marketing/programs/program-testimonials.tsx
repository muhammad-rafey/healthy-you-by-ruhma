import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp } from "@/components/motion/fade-up";
import type { Testimonial } from "@/lib/programs-data";

interface ProgramTestimonialsProps {
  items: readonly Testimonial[];
}

export function ProgramTestimonials({ items }: ProgramTestimonialsProps) {
  return (
    <section
      aria-label="Testimonials from clients"
      className="bg-shell/60 border-ink/5 border-y py-24 md:py-32"
    >
      <Container>
        <FadeUp>
          <Eyebrow>From the practice</Eyebrow>
        </FadeUp>
        <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-2 md:gap-20">
          {items.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <blockquote>
                <p className="font-display text-ink text-[clamp(24px,2.6vw,34px)] leading-[1.25] -tracking-[0.01em]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-7 text-[13px] tracking-[0.16em] uppercase">
                  <span className="text-mauve">&mdash; {t.name}</span>
                  <span className="text-ink-soft tracking-normal normal-case">
                    {" · "}
                    {t.context}
                  </span>
                </footer>
              </blockquote>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
