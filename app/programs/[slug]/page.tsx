import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadProgram } from "@/lib/content/load";
import { site } from "@/content/site";
import { breadcrumbSchema } from "@/lib/jsonld";
import {
  PROGRAMS_FAQ,
  PROGRAMS_TESTIMONIALS,
  COACHING_TIMELINE,
  CONSULTATION_EXPECT,
  CONSULTATION_PREPARE,
  type ProgramSlug,
} from "@/lib/programs-data";

import { ProgramHero } from "@/components/marketing/programs/program-hero";
import { WhatsIncluded } from "@/components/marketing/programs/whats-included";
import { HowItWorks } from "@/components/marketing/programs/how-it-works";
import { CoachingTimeline } from "@/components/marketing/programs/coaching-timeline";
import { Booking } from "@/components/marketing/programs/booking";
import { ConsultationRails } from "@/components/marketing/programs/consultation-rails";
import { ProgramTestimonials } from "@/components/marketing/programs/program-testimonials";
import { PricingCard } from "@/components/marketing/programs/pricing-card";
import { ProgramFaq } from "@/components/marketing/programs/program-faq";
import { ProgramCtaBand } from "@/components/marketing/programs/program-cta-band";

const PROGRAM_SLUGS = ["coaching", "consultation"] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return PROGRAM_SLUGS.map((slug) => ({ slug }));
}

const HERO_ALTS: Record<ProgramSlug, string> = {
  coaching: "Dr. Ruhma in a coaching session with a client, notes spread between them.",
  consultation: "A consultation setup — notebook, phone, and a glass of water on a quiet desk.",
};

const PRICING_BULLETS: Record<ProgramSlug, readonly string[]> = {
  coaching: [
    "Ninety days of partnership — weekly twenty-minute calls",
    "Diet plans that update as your body responds",
    "Home workout plans, no gym required",
    "Unlimited WhatsApp access during business hours",
    "Free access to the full ebook library",
    "Sustainability strategies to keep changes long after the program ends",
  ],
  consultation: [
    "A thirty-five minute video call with Dr. Ruhma",
    "Pre-call review of any reports you send in advance",
    "A written summary of agreed next steps within twenty-four hours",
    "Free access to the full ebook library after the call",
  ],
};

const PRICING_CADENCE: Record<ProgramSlug, string> = {
  coaching: "shared on the discovery call",
  consultation: "single call",
};

const PRICING_NOTE: Record<ProgramSlug, string | undefined> = {
  coaching:
    "Every program is shaped to your situation — pricing comes after we talk through the fit.",
  consultation: undefined,
};

const CTA_BAND_LINE: Record<ProgramSlug, string> = {
  coaching: "Ready to do the work that lasts?",
  consultation: "Still have questions? Start with a call.",
};

const HOW_IT_WORKS_HEADINGS: Record<ProgramSlug, string> = {
  coaching: "Four phases across ninety days.",
  consultation: "Three steps to the call.",
};

function isProgramSlug(s: string): s is ProgramSlug {
  return (PROGRAM_SLUGS as readonly string[]).includes(s);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isProgramSlug(slug)) return {};

  const { frontmatter } = await loadProgram(slug);
  const url = `/programs/${slug}`;
  const ogImage = frontmatter.ogImage ?? frontmatter.heroImage;

  return {
    title: `${frontmatter.title} · ${site.name}`,
    description: frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
  };
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isProgramSlug(slug)) notFound();

  const { frontmatter } = await loadProgram(slug);
  const fm = frontmatter;

  const testimonials = PROGRAMS_TESTIMONIALS[slug];
  const faq = PROGRAMS_FAQ[slug];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: fm.title,
    description: fm.description,
    serviceType: fm.eyebrow,
    url: `${site.url}/programs/${slug}`,
    provider: {
      "@type": "Person",
      name: site.practitioner,
      url: `${site.url}/about`,
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    // Only emit Offer.price when an actual numeric price exists; coaching is
    // priced on consultation so there's nothing to publish here.
    ...(fm.priceFrom !== undefined && {
      offers: {
        "@type": "Offer",
        priceCurrency: fm.currency,
        price: fm.priceFrom,
        availability: "https://schema.org/InStock",
        url: `${site.url}/programs/${slug}`,
      },
    }),
  };

  const breadcrumbs = breadcrumbSchema([
    ["Services", "/services"],
    [fm.title, `/programs/${slug}`],
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([serviceSchema, breadcrumbs]),
        }}
      />

      <ProgramHero
        eyebrow={fm.eyebrow}
        title={fm.title}
        description={fm.description}
        priceFrom={fm.priceFrom}
        priceLabel={fm.priceLabel}
        currency={fm.currency}
        ctaLabel={fm.ctaLabel}
        ctaHref={slug === "consultation" ? "#book" : "#pricing"}
        heroImage={fm.heroImage}
        heroAlt={HERO_ALTS[slug]}
      />

      {/* Coaching gets the "What's included" 6-tile grid. Consultation gets
          the slimmer "What to expect / How to prepare" rails. */}
      {slug === "consultation" ? (
        <ConsultationRails expect={CONSULTATION_EXPECT} prepare={CONSULTATION_PREPARE} />
      ) : (
        fm.whatsIncluded && <WhatsIncluded items={fm.whatsIncluded} />
      )}

      {fm.steps && (
        <HowItWorks
          steps={fm.steps}
          heading={HOW_IT_WORKS_HEADINGS[slug]}
          eyebrow={slug === "consultation" ? "What to expect" : "How it works"}
        />
      )}

      {/* Per-program signature section. */}
      {slug === "coaching" && <CoachingTimeline weeks={COACHING_TIMELINE} />}
      {slug === "consultation" && <Booking />}

      {/* Testimonials — skipped on the shorter consultation page. */}
      {slug !== "consultation" && <ProgramTestimonials items={testimonials} />}

      <PricingCard
        priceFrom={fm.priceFrom}
        priceLabel={fm.priceLabel}
        currency={fm.currency}
        bullets={PRICING_BULLETS[slug]}
        ctaLabel={fm.ctaLabel}
        ctaHref={slug === "consultation" ? "#book" : "/contact?topic=" + slug}
        cadence={PRICING_CADENCE[slug]}
        note={PRICING_NOTE[slug]}
      />

      <ProgramFaq items={faq} programSlug={slug} />

      <ProgramCtaBand
        line={CTA_BAND_LINE[slug]}
        ctaLabel={fm.ctaLabel}
        ctaHref={slug === "consultation" ? "#book" : "/contact?topic=" + slug}
      />
    </>
  );
}
