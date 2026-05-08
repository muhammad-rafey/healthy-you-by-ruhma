// app/journal/[slug]/page.tsx
//
// Static-rendered single journal post. Layout follows master plan §3.11:
//   1. <PostHero> — eyebrow strip (category · date · read time) + title
//   2. MDX body inside <Prose dropcap> — Inter 17/1.6, 680px column
//   3. <AuthorFooter> — small portrait + 1-paragraph bio + /about link
//   4. <RelatedPosts> — up to 3 other entries (placeholders fill gaps)
//
// JSON-LD `BlogPosting` per post. generateStaticParams() and
// generateMetadata() pull from the visible MDX catalogue so a post that
// is set draft in production never SSGs and never advertises a URL.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";

import { loadJournal } from "@/lib/mdx";
import type { JournalFrontmatter } from "@/lib/mdx";
import { site } from "@/content/site";
import { loadAllJournal, loadRelatedJournal } from "@/lib/journal-data";
import { breadcrumbSchema } from "@/lib/jsonld";

import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { FadeUp } from "@/components/motion/fade-up";

import { PostHero } from "@/components/marketing/journal/post-hero";
import { AuthorFooter } from "@/components/marketing/journal/author-footer";
import { RelatedPosts } from "@/components/marketing/journal/related-posts";
import { JournalPullQuote } from "@/components/marketing/journal/pull-quote";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const docs = await loadAllJournal();
  return docs.map((d) => ({ slug: d.frontmatter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let fm: JournalFrontmatter;
  try {
    fm = (await loadJournal(slug)).frontmatter;
  } catch {
    return {};
  }
  const url = `/journal/${slug}`;
  const ogImage = fm.ogImage ?? fm.heroImage;
  return {
    title: `${fm.title} · ${site.name}`,
    description: fm.description,
    alternates: { canonical: url },
    openGraph: {
      title: fm.title,
      description: fm.description,
      url,
      type: "article",
      publishedTime: fm.publishedAt,
      modifiedTime: fm.updatedAt ?? fm.publishedAt,
      authors: [`${site.url}/about`],
      tags: [fm.category],
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.description,
      images: ogImage ? [ogImage] : undefined,
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

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let fm: JournalFrontmatter;
  let body: string;
  try {
    const doc = await loadJournal(slug);
    fm = doc.frontmatter;
    body = doc.body;
  } catch {
    notFound();
  }

  const relatedDocs = await loadRelatedJournal(slug, 3);
  const related = relatedDocs.map((d) => d.frontmatter);

  const image = fm.ogImage ?? fm.heroImage;
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.publishedAt,
    dateModified: fm.updatedAt ?? fm.publishedAt,
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
    image: image ? `${site.url}${image}` : undefined,
    articleSection: fm.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/journal/${slug}`,
    },
  };

  const breadcrumbs = breadcrumbSchema([
    ["Journal", "/journal"],
    [fm.title, `/journal/${slug}`],
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
        <PostHero post={fm} />

        <section
          aria-label="Article body"
          className="bg-cream pt-[clamp(40px,5vw,80px)] pb-[clamp(48px,7vw,96px)]"
        >
          <Container>
            <FadeUp>
              <Prose dropcap as="div" className="mx-auto max-w-[680px]">
                <MDXRemote source={body} components={mdxComponents} />
              </Prose>
            </FadeUp>
          </Container>
        </section>

        <AuthorFooter />
      </article>

      <RelatedPosts posts={related} />
    </>
  );
}
