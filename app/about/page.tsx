import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

import { loadAbout } from "@/lib/mdx";
import { site } from "@/content/site";
import { personSchema } from "@/lib/jsonld";

import { AboutHero } from "@/components/marketing/about/about-hero";
import { MissionStatement } from "@/components/marketing/about/mission-statement";
import { Bio } from "@/components/marketing/about/bio";
import { Philosophy } from "@/components/marketing/about/philosophy";
import { AboutCta } from "@/components/marketing/about/about-cta";
import { BotanicalDivider } from "@/components/marketing/about/botanical-divider";
import { PullQuote } from "@/components/marketing/about/pull-quote";

export const metadata: Metadata = {
  title: "About Dr. Ruhma",
  description:
    "Clinical dietitian based in Faisalabad. Dr. Ruhma helps women navigate hormonal health, PCOS, and weight management through evidence-based, deeply personal nutrition.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About Dr. Ruhma · ${site.name}`,
    description:
      "Clinical dietitian based in Faisalabad. Hormonal health, PCOS, weight management.",
    url: "/about",
    type: "profile",
    images: [{ url: "/media/about/hero-750.webp", width: 750, height: 938 }],
  },
};

const PHILOSOPHY_PRINCIPLES = [
  "Food is information your body listens to — every meal is a signal, not a punishment.",
  "Hormones rule the room — fix the upstream rhythm and weight, energy, and skin follow.",
  "Sustainability beats intensity — a plan you can keep for years outperforms one you survive for weeks.",
  "Care travels with the science — evidence-based, but never delivered cold.",
] as const;

const CREDENTIALS = [
  "Registered Dietitian",
  "Clinical Nutrition",
  "PCOS & hormonal health",
  "500+ clients",
  "Faisalabad, Pakistan",
] as const;

const MISSION_EXCERPT =
  "I see nutrition as the quiet, daily practice of caring for the body you're going to live in for the rest of your life. Not a sprint. Not a punishment.";

const PULL_QUOTE = "Health is a relationship, not a transaction.";

export default async function AboutPage() {
  const { body, frontmatter } = await loadAbout();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
      />

      <AboutHero
        eyebrow={frontmatter.eyebrow}
        title="Dr. Ruhma"
        image={{
          src: "/media/about/hero-750.webp",
          alt: "Dr. Ruhma in her clinic, consulting at her desk.",
        }}
      />

      <MissionStatement
        statement="My mission is to make you shine from inside."
        excerpt={MISSION_EXCERPT}
      />

      <BotanicalDivider variant="sprig" />

      <Bio
        portrait={{
          src: "/media/about/portrait-secondary-800.webp",
          alt: "Dr. Ruhma on a consultation call.",
        }}
        pullQuote={PULL_QUOTE}
        credentials={[...CREDENTIALS]}
      >
        <MDXRemote
          source={body}
          components={{
            PullQuote,
            p: (props) => <p className="text-ink-soft text-[17px] leading-[1.7]" {...props} />,
            h2: (props) => (
              <h2
                className="font-display text-ink mt-12 mb-4 text-[clamp(24px,2.4vw,32px)] font-medium tracking-[-0.015em]"
                {...props}
              />
            ),
            strong: (props) => <strong className="text-ink font-semibold" {...props} />,
            em: (props) => <em className="italic" {...props} />,
          }}
        />
      </Bio>

      <BotanicalDivider variant="leaf" />

      <Philosophy principles={[...PHILOSOPHY_PRINCIPLES]} />

      <AboutCta />
    </>
  );
}
