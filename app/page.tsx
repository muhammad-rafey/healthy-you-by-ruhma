import type { Metadata } from "next";
import { Hero } from "@/components/marketing/home/hero";
import { MomentBand } from "@/components/marketing/home/moment-band";
import { Pillars } from "@/components/marketing/home/pillars";
import { FeaturedEbook } from "@/components/marketing/home/featured-ebook";
import { AboutTeaser } from "@/components/marketing/home/about-teaser";
import { SuccessStoriesTeaser } from "@/components/marketing/home/success-stories";
import { Testimonials } from "@/components/marketing/home/testimonials";
import { JournalPreview } from "@/components/marketing/home/journal-preview";
import { CtaBand } from "@/components/marketing/home/cta-band";
import { pillars, testimonials, journalPlaceholders, type JournalCard } from "@/lib/home-data";
import { websiteSchema, personSchema, organizationSchema } from "@/lib/jsonld";
import { loadAllEntries } from "@/lib/journal-unified";
import { formatCategory } from "@/lib/journal-data";
import { site } from "@/content/site";
export const runtime = "nodejs";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Healthy You By Ruhma — Clinical dietitian in Faisalabad",
  description:
    "Dr. Ruhma is a clinical dietitian in Faisalabad helping women take quiet, lasting control of hormonal health, weight, and daily nourishment.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: site.name,
    description: "Quietly authoritative, evidence-based dietetics from Dr. Ruhma — Faisalabad.",
    url: "/",
    siteName: site.name,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: "Clinical dietitian Dr. Ruhma — hormonal health, weight management, coaching.",
  },
};

export default async function HomePage() {
  const entries = await loadAllEntries();
  const journalItems: JournalCard[] = entries.length
    ? entries.map((entry) => ({
        slug: entry.slug,
        eyebrow: formatCategory(entry.category),
        title: entry.title,
        excerpt: entry.description,
        cover: entry.heroImage,
        source: entry.source,
      }))
    : journalPlaceholders;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema(), organizationSchema(), personSchema()]),
        }}
      />
      <Hero />
      <MomentBand />
      <Pillars items={pillars} />
      <FeaturedEbook />
      <AboutTeaser />
      <SuccessStoriesTeaser />
      <Testimonials items={testimonials} />
      <JournalPreview items={journalItems} />
      <CtaBand />
    </>
  );
}
