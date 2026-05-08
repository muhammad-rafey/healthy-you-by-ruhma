// app/library/[slug]/page.tsx
//
// Three statically-prerendered ebook detail pages backed by content/library/
// MDX files. Layout (master §3.10):
//   1. Split hero — cover + title + price + Buy CTA
//   2. "Inside" — numbered editorial TOC preview
//   3. Sample spreads — three interior previews
//   4. About the author — small portrait + 2-paragraph bio
//   5. FAQ — five shared ebook-specific questions
//   6. Related — the other two ebooks
//
// The Buy CTA is the entire commerce surface — a plain external <a> when
// buyUrl is real, a "Coming soon" disabled-style chip when buyUrl is the
// example.com placeholder shipped from Phase 03. Page emits Product
// JSON-LD with availability=InStock and the publisher's URL.

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listSlugs, loadLibrary } from "@/lib/mdx";
import type { LibraryFrontmatter } from "@/lib/mdx";
import { site } from "@/content/site";
import { isPlaceholderBuyUrl } from "@/lib/library-data";
import { breadcrumbSchema } from "@/lib/jsonld";

import { FadeUp } from "@/components/motion/fade-up";

import { EbookHero } from "@/components/marketing/library/ebook-hero";
import { EbookTOC } from "@/components/marketing/library/ebook-toc";
import { SampleSpreads } from "@/components/marketing/library/sample-spreads";
import { AuthorCard } from "@/components/marketing/library/author-card";
import { EbookFaq } from "@/components/marketing/library/ebook-faq";
import { RelatedEbooks } from "@/components/marketing/library/related-ebooks";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await listSlugs("library");
  return slugs.map((slug) => ({ slug }));
}

async function loadAllLibrary(): Promise<LibraryFrontmatter[]> {
  const slugs = await listSlugs("library");
  const docs = await Promise.all(slugs.map((s) => loadLibrary(s)));
  return docs.map((d) => d.frontmatter).sort((a, b) => a.eyebrow.localeCompare(b.eyebrow));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let fm: LibraryFrontmatter;
  try {
    fm = (await loadLibrary(slug)).frontmatter;
  } catch {
    return {};
  }
  const url = `/library/${slug}`;
  const ogImage = fm.ogImage ?? fm.cover;
  return {
    title: `${fm.title} · ${site.name}`,
    description: fm.description,
    alternates: { canonical: url },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.description,
      images: [ogImage],
    },
  };
}

export default async function EbookDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let fm: LibraryFrontmatter;
  try {
    fm = (await loadLibrary(slug)).frontmatter;
  } catch {
    notFound();
  }

  const all = await loadAllLibrary();
  const placeholder = isPlaceholderBuyUrl(fm.buyUrl);
  const offerPrice = fm.salePrice ?? fm.price;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fm.title,
    description: fm.description,
    image: fm.ogImage ?? fm.cover,
    brand: {
      "@type": "Brand",
      name: site.name,
    },
    author: {
      "@type": "Person",
      name: site.practitioner,
      url: `${site.url}/about`,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: fm.currency,
      price: offerPrice.toString(),
      availability: placeholder ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      ...(placeholder ? {} : { url: fm.buyUrl }),
    },
  };

  const breadcrumbs = breadcrumbSchema([
    ["The Library", "/library"],
    [fm.title, `/library/${fm.slug}`],
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productSchema, breadcrumbs]),
        }}
      />

      <EbookHero ebook={fm} />

      <FadeUp>
        <EbookTOC toc={fm.toc} />
      </FadeUp>

      <FadeUp>
        <SampleSpreads images={fm.sampleSpreads} title={fm.title} />
      </FadeUp>

      <FadeUp>
        <AuthorCard />
      </FadeUp>

      <EbookFaq slug={fm.slug} />

      <RelatedEbooks current={fm.slug} all={all} />
    </>
  );
}
