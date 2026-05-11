import type { Metadata } from "next";

import { loadProgram } from "@/lib/content/load";
import { site } from "@/content/site";
import { Container } from "@/components/ui/container";
import { ServicesHeader } from "@/components/marketing/services/services-header";
import { ServiceCard } from "@/components/marketing/services/service-card";
import type { ServiceCardProgram } from "@/components/marketing/services/service-card";
import { ServicesFaq } from "@/components/marketing/services/services-faq";
import { ServicesCta } from "@/components/marketing/services/services-cta";

export const metadata: Metadata = {
  title: `Services · ${site.name}`,
  description:
    "Two ways to work with Dr. Ruhma — a ninety-day coaching partnership or a focused consultation call. Faisalabad-based, online worldwide.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: `Services · ${site.name}`,
    description: "Two ways to work together: Coaching and Consultation.",
    url: "/services",
    type: "website",
  },
};

const PROGRAM_SLUGS = ["coaching", "consultation"] as const;

const HERO_ALTS: Record<(typeof PROGRAM_SLUGS)[number], string> = {
  coaching: "Dr. Ruhma in coaching session with a client.",
  consultation: "A consultation setup — notebook, phone, and a glass of water.",
};

export default async function ServicesPage() {
  const programs = await Promise.all(PROGRAM_SLUGS.map((slug) => loadProgram(slug)));

  const cards: ServiceCardProgram[] = programs.map(({ frontmatter }) => ({
    slug: frontmatter.slug,
    eyebrow: frontmatter.eyebrow,
    title: frontmatter.title,
    description: frontmatter.description,
    priceFrom: frontmatter.priceFrom,
    priceLabel: frontmatter.priceLabel,
    currency: frontmatter.currency,
    heroImage: frontmatter.heroImage,
    heroAlt: HERO_ALTS[frontmatter.slug as (typeof PROGRAM_SLUGS)[number]] ?? frontmatter.title,
    href: `/programs/${frontmatter.slug}`,
  }));

  const serviceSchemas = cards.map((card) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: card.title,
    description: card.description,
    url: `${site.url}${card.href}`,
    provider: {
      "@type": "Person",
      name: site.practitioner,
      url: `${site.url}/about`,
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    ...(card.priceFrom !== undefined && {
      offers: {
        "@type": "Offer",
        priceCurrency: card.currency,
        price: card.priceFrom,
        availability: "https://schema.org/InStock",
        url: `${site.url}${card.href}`,
      },
    }),
  }));

  return (
    <>
      {serviceSchemas.map((schema, i) => (
        <script
          // schemas are derived from cards, so cards[i] is always defined here
          key={cards[i]?.slug ?? `service-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <ServicesHeader />

      <section aria-label="Programs" className="bg-cream pb-12 md:pb-20">
        <Container>
          <div className="border-ink/10 border-t" />
          {cards.map((program, i) => (
            <ServiceCard key={program.slug} program={program} index={i} reveal={i === 0} />
          ))}
        </Container>
      </section>

      <ServicesFaq />

      <ServicesCta />
    </>
  );
}
