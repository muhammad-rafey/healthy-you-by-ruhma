import type { Metadata } from "next";
import { Hero } from "@/components/marketing/home/hero";
import { MomentBand } from "@/components/marketing/home/moment-band";
import { Pillars } from "@/components/marketing/home/pillars";
import { FeaturedEbook } from "@/components/marketing/home/featured-ebook";
import { AboutTeaser } from "@/components/marketing/home/about-teaser";
import { Testimonials } from "@/components/marketing/home/testimonials";
import { JournalPreview } from "@/components/marketing/home/journal-preview";
import { CtaBand } from "@/components/marketing/home/cta-band";
import { pillars, testimonials, journalPlaceholders, type JournalCard } from "@/lib/home-data";
import { websiteSchema, personSchema, organizationSchema } from "@/lib/jsonld";
import { loadJournal } from "@/lib/mdx";
import { site } from "@/content/site";

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
  // Compose the journal preview: real welcome post + 2 placeholders.
  const welcome = await loadJournal("welcome").catch(() => null);
  const journalItems: JournalCard[] = welcome
    ? [
        {
          slug: welcome.frontmatter.slug,
          eyebrow: welcome.frontmatter.category,
          title: welcome.frontmatter.title,
          excerpt: welcome.frontmatter.description,
          cover: welcome.frontmatter.heroImage,
        },
        ...journalPlaceholders,
      ]
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
      <Testimonials items={testimonials} />
      <JournalPreview items={journalItems} />
      <CtaBand />
    </>
  );
}
