// app/focus/[slug]/page.tsx
//
// One dynamic route, two long-read focus pages. Each page reads its MDX
// from content/focus/{slug}.mdx, renders the body inside a magazine-style
// <FocusProse> wrapper (2-col on lg+, drop-cap, justified prose), then
// hangs structured sections off lib/focus-data.ts: a numbered "Where this
// shows up" trio and a 2-card "Where to go next." soft funnel into
// programs/library, ending in a quiet "Book a consultation" CTA band.
//
// Master plan §3.7 (Hormonal Health) and §3.8 (Weight Management).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { loadFocus } from "@/lib/mdx";
import { site } from "@/content/site";
import { breadcrumbSchema } from "@/lib/jsonld";
import {
  FOCUS_CONDITIONS,
  FOCUS_SLUGS,
  FOCUS_SUBHEAD,
  isFocusSlug,
  loadRelatedCards,
  type FocusSlug,
} from "@/lib/focus-data";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";

import { FocusHero } from "@/components/marketing/focus/focus-hero";
import { FocusProse } from "@/components/marketing/focus/focus-prose";
import { FocusPullQuote } from "@/components/marketing/focus/pull-quote";
import { Botanical } from "@/components/marketing/focus/botanical";
import { ConditionsList } from "@/components/marketing/focus/conditions-list";
import { RelatedCards } from "@/components/marketing/focus/related-cards";
import { FocusCtaBand } from "@/components/marketing/focus/focus-cta-band";

export const dynamicParams = false;

export function generateStaticParams() {
  return FOCUS_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isFocusSlug(slug)) return {};
  const { frontmatter } = await loadFocus(slug);
  const url = `/focus/${slug}`;
  const ogImage = frontmatter.ogImage ?? frontmatter.heroImage;
  return {
    title: `${frontmatter.title} · ${site.name}`,
    description: frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

// MDX components map. Editorial typography is handled by the .focus-prose-body
// CSS scope, so the overrides here mostly forward props with sensible
// container classes — except <blockquote>, which is replaced by the
// pull-quote treatment, and the inline custom components (Pullquote,
// Botanical) the MDX body can use directly.
type MdxNodeProps<T> = React.HTMLAttributes<T> & { children?: React.ReactNode };

const mdxComponents = {
  Pullquote: FocusPullQuote,
  Botanical,
  blockquote: ({ children }: MdxNodeProps<HTMLQuoteElement>) => (
    <FocusPullQuote>{children}</FocusPullQuote>
  ),
  h2: (props: MdxNodeProps<HTMLHeadingElement>) => <h2 {...props} />,
  h3: (props: MdxNodeProps<HTMLHeadingElement>) => <h3 {...props} />,
  h4: (props: MdxNodeProps<HTMLHeadingElement>) => <h4 {...props} />,
  p: (props: MdxNodeProps<HTMLParagraphElement>) => <p {...props} />,
  a: ({ href = "#", children, ...rest }: MdxNodeProps<HTMLAnchorElement> & { href?: string }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...rest}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
};

export default async function FocusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isFocusSlug(slug)) notFound();

  const focusSlug: FocusSlug = slug;
  const { body, frontmatter } = await loadFocus(focusSlug);
  const conditions = FOCUS_CONDITIONS[focusSlug];
  const related = await loadRelatedCards(focusSlug);
  const subhead = FOCUS_SUBHEAD[focusSlug];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: frontmatter.title,
    description: frontmatter.description,
    url: `${site.url}/focus/${focusSlug}`,
    inLanguage: "en-PK",
    author: {
      "@type": "Person",
      name: site.practitioner,
      url: `${site.url}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    image: frontmatter.ogImage ?? frontmatter.heroImage,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/focus/${focusSlug}` },
  };

  const breadcrumbs = breadcrumbSchema([[frontmatter.title, `/focus/${focusSlug}`]]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleSchema, breadcrumbs]),
        }}
      />

      <FocusHero eyebrow={frontmatter.eyebrow} title={frontmatter.title} subhead={subhead} />

      <section
        aria-label="Article body"
        className="bg-cream pt-[clamp(40px,5vw,80px)] pb-[clamp(72px,10vw,128px)]"
      >
        <Container>
          <FadeUp>
            <FocusProse dropcap>
              <MDXRemote source={body} components={mdxComponents} />
            </FocusProse>
          </FadeUp>

          {/* Quiet handoff into the structured sections — small heading that
              promises the reader the editorial section is over. */}
          <FadeUp delay={0.05}>
            <div className="mx-auto mt-16 max-w-[720px] text-center">
              <Heading as="h2" variant="h2" className="text-ink-soft sr-only">
                Where this leads
              </Heading>
            </div>
          </FadeUp>
        </Container>
      </section>

      <ConditionsList conditions={conditions} />

      <RelatedCards items={related} />

      <FocusCtaBand />
    </>
  );
}
