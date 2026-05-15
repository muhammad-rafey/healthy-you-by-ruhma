// app/journal/[slug]/page.tsx
//
// Single journal entry. Resolves the slug against BOTH sources via the
// merge layer: MDX entries render their MDX body; Mongo posts (formerly
// /blog) render their plain-text body with line breaks preserved. Layout
// is unchanged (master plan §3.11):
//   1. <PostHero> — eyebrow strip (category · date · read time) + title
//   2. body inside <Prose> — 680px column
//   3. <AuthorFooter> — small portrait + 1-paragraph bio + /about link
//   4. <RelatedPosts> — up to 3 other entries (placeholders fill gaps)
//
// Mongo-backed → dynamic (Node runtime + revalidate 0, CLAUDE.md). No
// generateStaticParams: blog slugs are created at runtime in /admin.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

import { site } from "@/content/site";
import { loadEntryBySlug, loadRelatedEntries } from "@/lib/journal-unified";
import { breadcrumbSchema } from "@/lib/jsonld";

import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { FadeUp } from "@/components/motion/fade-up";

import { PostHero } from "@/components/marketing/journal/post-hero";
import { AuthorFooter } from "@/components/marketing/journal/author-footer";
import { RelatedPosts } from "@/components/marketing/journal/related-posts";
import { JournalPullQuote } from "@/components/marketing/journal/pull-quote";

export const runtime = "nodejs";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await loadEntryBySlug(slug);
  if (!loaded) return {};
  const { entry } = loaded;
  const url = `/journal/${slug}`;
  const image = entry.heroImage;
  const description =
    entry.description.length > 200
      ? `${entry.description.slice(0, 197).trimEnd()}…`
      : entry.description;
  return {
    title: `${entry.title} · ${site.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: entry.title,
      description,
      url,
      type: "article",
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt ?? entry.publishedAt,
      authors: [`${site.url}/about`],
      tags: [entry.category],
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

// MDX components for the journal body. Pull-quotes get the editorial
// treatment; raw <a> elements decide internal vs external on the fly.
type MdxNodeProps<T> = React.HTMLAttributes<T> & { children?: React.ReactNode };

const mdxComponents = {
  Pullquote: JournalPullQuote,
  blockquote: ({ children }: MdxNodeProps<HTMLQuoteElement>) => (
    <JournalPullQuote>{children}</JournalPullQuote>
  ),
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

function absoluteImage(image: string | undefined): string | undefined {
  if (!image) return undefined;
  return /^https?:\/\//u.test(image) ? image : `${site.url}${image}`;
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const loaded = await loadEntryBySlug(slug);
  if (!loaded) notFound();
  const { entry, body, bodyKind } = loaded;

  const related = await loadRelatedEntries(slug, 3);

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.publishedAt,
    dateModified: entry.updatedAt ?? entry.publishedAt,
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
    image: absoluteImage(entry.heroImage),
    articleSection: entry.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/journal/${slug}`,
    },
  };

  const breadcrumbs = breadcrumbSchema([
    ["Journal", "/journal"],
    [entry.title, `/journal/${slug}`],
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([blogPostingSchema, breadcrumbs]),
        }}
      />

      <article>
        <PostHero post={entry} showDescription={bodyKind === "mdx"} />

        <section
          aria-label="Article body"
          className="bg-cream pt-[clamp(40px,5vw,80px)] pb-[clamp(48px,7vw,96px)]"
        >
          <Container>
            <FadeUp>
              {bodyKind === "mdx" ? (
                <Prose dropcap as="div" className="mx-auto max-w-[680px]">
                  <MDXRemote source={body} components={mdxComponents} />
                </Prose>
              ) : (
                <Prose as="div" className="mx-auto max-w-[680px]">
                  <p className="whitespace-pre-line">{body}</p>
                </Prose>
              )}
            </FadeUp>
          </Container>
        </section>

        <AuthorFooter />
      </article>

      <RelatedPosts posts={related} />
    </>
  );
}
