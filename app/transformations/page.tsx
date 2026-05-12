import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { ImageReveal } from "@/components/motion/image-reveal";
import { breadcrumbSchema } from "@/lib/jsonld";
import { site } from "@/content/site";
import { TRANSFORMATIONS, type Transformation } from "@/lib/transformations-data";

export const metadata: Metadata = {
  title: `Success Stories · ${site.name}`,
  description:
    "Anonymized client success stories from Dr. Ruhma's practice — PCOS, postpartum recovery, fertility, and weight management transformations over 2–6 month programs.",
  alternates: { canonical: "/transformations" },
  openGraph: {
    title: `Success Stories · ${site.name}`,
    description:
      "Anonymized client success stories — real numbers, restored cycles, natural conceptions.",
    url: "/transformations",
    type: "website",
  },
};

const HEADER_STATS: { value: string; label: string }[] = [
  { value: "5", label: "Client stories" },
  { value: "2–6 mo", label: "Program length" },
  { value: "PCOS · postpartum · fertility", label: "Focus areas" },
  { value: "No quick fixes", label: "Approach" },
];

export default function TransformationsPage() {
  const breadcrumbs = breadcrumbSchema([["Success Stories", "/transformations"]]);
  const isEmpty = TRANSFORMATIONS.length === 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <Container as="main" className="py-20 sm:py-28">
        <header className="mb-16 max-w-3xl md:mb-24">
          <Eyebrow as="p" className="mb-4 block">
            Success Stories
          </Eyebrow>
          <LetterStagger
            as="h1"
            text="Quiet wins, in numbers and in life."
            className="font-display text-ink block text-[clamp(40px,7vw,88px)] leading-[1.02] font-medium tracking-[-0.03em]"
          />
          <FadeUp delay={0.2}>
            <p className="text-ink-soft mt-6 max-w-[52ch] text-[17px] leading-[1.65]">
              Anonymized stories from the practice — postpartum recovery, PCOS, fertility, and the
              kind of weight changes that stay because the habits underneath them stay.
            </p>
          </FadeUp>
        </header>

        {!isEmpty && (
          <FadeUp delay={0.25}>
            <div className="border-ink/10 mb-20 grid grid-cols-2 gap-y-6 border-t border-b py-7 md:mb-28 md:grid-cols-4 md:gap-x-10 md:py-8">
              {HEADER_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1.5">
                  <span className="font-display text-ink text-[clamp(20px,2vw,26px)] leading-[1.1] tracking-[-0.015em]">
                    {stat.value}
                  </span>
                  <span className="text-ink-soft type-caption not-italic">{stat.label}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {isEmpty ? (
          <FadeUp delay={0.1}>
            <div
              role="region"
              aria-label="Success Stories coming soon"
              className="bg-paper border-ink/10 mx-auto flex max-w-2xl flex-col items-center gap-7 border px-8 py-14 text-center md:px-12 md:py-16"
            >
              <p className="font-display text-ink max-w-[28ch] text-[clamp(22px,2.4vw,28px)] leading-[1.25]">
                Real stories are being prepared with the clients featured. They&rsquo;ll land here
                soon.
              </p>
              <p className="text-ink-soft max-w-[44ch] text-[16px] leading-[1.6]">
                In the meantime, the best way to see whether the practice is a fit for what
                you&rsquo;re working on is a discovery call.
              </p>
              <Button asChild variant="default" size="lg">
                <Link href="/programs/consultation">Book a discovery call →</Link>
              </Button>
            </div>
          </FadeUp>
        ) : (
          <ol role="list" className="flex flex-col">
            {TRANSFORMATIONS.map((story, i) => (
              <StoryRow key={story.slug} story={story} index={i} />
            ))}
          </ol>
        )}

        {!isEmpty && (
          <FadeUp delay={0.05}>
            <aside
              aria-label="Start your own"
              className="bg-paper border-ink/10 mx-auto mt-24 flex max-w-3xl flex-col items-center gap-6 border px-8 py-14 text-center md:mt-32 md:px-14 md:py-16"
            >
              <p className="type-eyebrow">Your story, next</p>
              <p className="font-display text-ink max-w-[32ch] text-[clamp(24px,2.6vw,32px)] leading-[1.2] tracking-[-0.015em]">
                These changes don&rsquo;t come from a meal plan. They come from a fit — between your
                body, your life, and the work.
              </p>
              <p className="text-ink-soft max-w-[48ch] text-[16px] leading-[1.6]">
                Start with a discovery call to see whether the practice is the right fit for what
                you&rsquo;re working on.
              </p>
              <Button asChild variant="default" size="lg" className="mt-2">
                <Link href="/programs/consultation">Book a discovery call →</Link>
              </Button>
            </aside>
          </FadeUp>
        )}
      </Container>
    </>
  );
}

function StoryRow({ story, index }: { story: Transformation; index: number }) {
  const imageRight = index % 2 === 1;

  return (
    <li
      id={story.slug}
      className={[
        "scroll-mt-24",
        index > 0 ? "border-ink/10 border-t pt-16 md:pt-24" : "",
        index < TRANSFORMATIONS.length - 1 ? "pb-16 md:pb-24" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <FadeUp delay={Math.min(index * 0.05, 0.2)}>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16">
          <div
            className={
              imageRight
                ? "lg:col-span-5 lg:col-start-8 lg:row-start-1"
                : "lg:col-span-5 lg:col-start-1 lg:row-start-1"
            }
          >
            <StoryImage story={story} />
          </div>

          <div
            className={
              imageRight
                ? "lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:pr-6"
                : "lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:pl-6"
            }
          >
            <StoryBody story={story} />
          </div>
        </div>
      </FadeUp>
    </li>
  );
}

function StoryImage({ story }: { story: Transformation }) {
  return (
    <figure className="relative">
      {/* Offset shell wash — visible md+, hidden on mobile for tighter stack */}
      <div
        aria-hidden="true"
        className="bg-shell absolute -bottom-3 -left-3 hidden h-full w-full md:block"
      />
      <ImageReveal
        direction="up"
        className="bg-cream-deep border-ink/10 relative aspect-[4/5] w-full border"
      >
        <Image
          src={story.image}
          alt={story.imageAlt}
          fill
          sizes="(min-width: 1024px) 40vw, (min-width: 768px) 80vw, 100vw"
          className="object-cover"
        />
      </ImageReveal>
    </figure>
  );
}

function StoryBody({ story }: { story: Transformation }) {
  return (
    <div className="flex flex-col">
      <span
        aria-hidden="true"
        className="text-mauve font-display block leading-[0.85] font-medium tracking-[-0.04em]"
        style={{ fontSize: "clamp(72px, 9vw, 140px)" }}
      >
        {story.index}
      </span>

      <p className="type-eyebrow mt-4">
        {story.category}
        <span className="mx-2 opacity-60" aria-hidden="true">
          ·
        </span>
        {story.ageNote}
        <span className="mx-2 opacity-60" aria-hidden="true">
          ·
        </span>
        {story.duration}
      </p>

      <p
        className="font-display text-ink mt-5 leading-[1.05] font-medium tracking-[-0.025em]"
        style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontFeatureSettings: '"tnum"' }}
      >
        <span className="sr-only">
          {story.metric.label} from {story.metric.from} to {story.metric.to}
        </span>
        <span aria-hidden="true">
          {story.metric.from}{" "}
          <span className="text-mauve" aria-hidden="true">
            →
          </span>{" "}
          {story.metric.to}
        </span>
      </p>

      <div className="text-ink-soft mt-7 max-w-[58ch] text-[17px] leading-[1.65]">
        {story.story.map((para, i) => (
          <p key={para.slice(0, 24)} className={i > 0 ? "mt-4" : ""}>
            {para}
          </p>
        ))}
      </div>

      <ul role="list" className="mt-8 flex flex-col gap-2.5">
        {story.highlights.map((highlight) => (
          <li
            key={highlight}
            className="text-ink before:text-mauve relative pl-6 text-[16px] leading-[1.5] before:absolute before:top-0 before:left-0 before:content-['—']"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
