import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/motion/fade-up";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { breadcrumbSchema } from "@/lib/jsonld";
import { site } from "@/content/site";
import { TRANSFORMATIONS } from "@/lib/transformations-data";

export const metadata: Metadata = {
  title: `Transformations · ${site.name}`,
  description:
    "Real client transformations from Dr. Ruhma's practice — before-and-after stories of women who turned hormonal balance, weight, and confidence around through the Coaching Program.",
  alternates: { canonical: "/transformations" },
  openGraph: {
    title: `Transformations · ${site.name}`,
    description:
      "Real client transformations from Dr. Ruhma's practice — before-and-after stories.",
    url: "/transformations",
    type: "website",
  },
};

export default function TransformationsPage() {
  const breadcrumbs = breadcrumbSchema([["Transformations", "/transformations"]]);
  const isEmpty = TRANSFORMATIONS.length === 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <Container as="main" className="py-20 sm:py-28">
        <header className="mb-16 max-w-2xl md:mb-20">
          <Eyebrow as="p" className="mb-4 block">
            Transformations
          </Eyebrow>
          <LetterStagger
            as="h1"
            text="The work, in their own words."
            className="font-display text-ink block text-[clamp(40px,7vw,88px)] leading-[1.02] font-medium tracking-[-0.03em]"
          />
          <FadeUp delay={0.2}>
            <p className="text-ink-soft mt-6 max-w-[44ch] text-[17px] leading-[1.65]">
              Before-and-after stories from the practice — women who turned PCOS, weight, and the
              quiet exhaustion of trying-and-failing into something steadier.
            </p>
          </FadeUp>
        </header>

        {isEmpty ? (
          <FadeUp delay={0.1}>
            <div
              role="region"
              aria-label="Transformations coming soon"
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
          <ul role="list" className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {TRANSFORMATIONS.map((t) => (
              <li
                key={t.slug}
                className="bg-paper border-ink/10 flex flex-col overflow-hidden border"
              >
                {(t.beforeImage || t.afterImage) && (
                  <div className="bg-ink/10 grid grid-cols-2 gap-px">
                    {t.beforeImage && (
                      <div className="bg-cream-deep relative aspect-[3/4]">
                        <Image
                          src={t.beforeImage}
                          alt={`${t.name} — before the program`}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                    {t.afterImage && (
                      <div className="bg-cream-deep relative aspect-[3/4]">
                        <Image
                          src={t.afterImage}
                          alt={`${t.name} — after ${t.durationWeeks} weeks`}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-4 px-7 py-8">
                  <p className="text-mauve text-[12px] tracking-[0.18em] uppercase">
                    {t.condition} · {t.durationWeeks} weeks
                  </p>
                  <Heading as="h2" variant="h2">
                    {t.name}
                  </Heading>
                  <p className="text-ink-soft text-[16px] leading-[1.6]">{t.summary}</p>
                  {t.quote && (
                    <blockquote className="text-ink border-mauve mt-2 border-l-2 pl-5 text-[16px] leading-[1.6] italic">
                      “{t.quote}”
                    </blockquote>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
