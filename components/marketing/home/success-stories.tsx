import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import { TRANSFORMATIONS, type Transformation } from "@/lib/transformations-data";

const FEATURED_SLUGS = ["postpartum-recovery-27", "pcos-trying-to-conceive-29"] as const;

export function SuccessStoriesTeaser() {
  const featured = FEATURED_SLUGS.map((slug) =>
    TRANSFORMATIONS.find((t) => t.slug === slug),
  ).filter((t): t is Transformation => Boolean(t));

  if (featured.length === 0) return null;

  return (
    <section aria-labelledby="success-stories-teaser-heading" className="bg-paper py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12 md:gap-8">
          <FadeUp className="md:col-span-7">
            <Eyebrow>Success Stories</Eyebrow>
            <Heading
              as="h2"
              id="success-stories-teaser-heading"
              variant="h1"
              className="mt-4 max-w-[18ch]"
            >
              Real numbers. Restored cycles. Natural conceptions.
            </Heading>
          </FadeUp>

          <FadeUp delay={0.1} className="md:col-span-5 md:pb-2">
            <p className="text-ink-soft max-w-[44ch] text-[17px] leading-[1.65]">
              A handful of anonymized stories from the practice — small windows into what 2 to 6
              months of considered work can do.
            </p>
          </FadeUp>
        </div>

        <ul
          role="list"
          className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:gap-16"
        >
          {featured.map((story, i) => (
            <FadeUp key={story.slug} delay={0.12 + i * 0.08}>
              <li>
                <Link
                  href={`/transformations#${story.slug}`}
                  className="group block focus-visible:outline-none"
                >
                  <figure className="relative">
                    <div
                      aria-hidden="true"
                      className="bg-shell absolute -bottom-2 -left-2 hidden h-full w-full md:block"
                    />
                    <div className="bg-cream-deep border-ink/10 relative aspect-[4/5] w-full overflow-hidden border">
                      <Image
                        src={story.image}
                        alt={story.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 40vw, (min-width: 768px) 45vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
                      />
                    </div>
                  </figure>

                  <div className="mt-7 flex flex-col">
                    <span
                      aria-hidden="true"
                      className="text-mauve font-display text-[14px] tracking-[0.18em] uppercase"
                    >
                      {story.index}
                      <span className="mx-2 opacity-60">·</span>
                      {story.category}
                    </span>

                    <p
                      className="font-display text-ink group-hover:text-mauve-deep mt-3 text-[clamp(28px,3vw,40px)] leading-[1.08] font-medium tracking-[-0.02em] transition-colors"
                      style={{ fontFeatureSettings: '"tnum"' }}
                    >
                      <span className="sr-only">
                        {story.metric.label} from {story.metric.from} to {story.metric.to}
                      </span>
                      <span aria-hidden="true">
                        {story.metric.from} <span className="text-mauve">→</span> {story.metric.to}
                      </span>
                    </p>

                    <p className="text-ink-soft mt-4 max-w-[40ch] text-[16px] leading-[1.6]">
                      {story.story[0]}
                    </p>

                    <span className="text-mauve mt-5 inline-flex items-center gap-1.5 text-[14px] tracking-[0.04em]">
                      Read the story
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 ease-out group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            </FadeUp>
          ))}
        </ul>

        <FadeUp delay={0.3}>
          <div className="mt-14 flex justify-end md:mt-16">
            <Link
              href="/transformations"
              className="text-ink hover:text-mauve-deep group inline-flex items-center gap-2 text-[15px] tracking-[0.02em] transition-colors"
            >
              See all success stories
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
