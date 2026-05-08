// app/legal/[slug]/page.tsx
//
// Single dynamic route for the three legal pages — privacy, terms, refunds.
// MDX bodies live in content/legal/{slug}.mdx with frontmatter validated by
// lib/content/load.ts (LegalFrontmatter). Pre-rendered at build via
// generateStaticParams + dynamicParams=false; unknown slugs 404 at build.
//
// Per master §3.13 these pages are plain editorial — no JSON-LD, no images,
// no motion beyond the minimal fade in <LegalPage>. They are indexable
// (legal pages are trust signals; appear in branded results).

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { loadLegal } from "@/lib/mdx";
import { site } from "@/content/site";
import { LegalPage } from "@/components/marketing/legal/legal-page";

export const dynamicParams = false;

const LEGAL_SLUGS = ["privacy", "terms", "refunds"] as const;
type LegalSlug = (typeof LEGAL_SLUGS)[number];

function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return {};
  const { frontmatter } = await loadLegal(slug);
  const url = `/legal/${slug}`;
  return {
    title: `${frontmatter.title} · ${site.name}`,
    description: frontmatter.description,
    alternates: { canonical: url },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  };
}

// MDX components map. The <Prose> wrapper supplies all body typography via
// the `.prose-editorial` CSS scope (h2/h3/p/ul/ol/a). We only override <a>
// to use next/link for internal links and to harden external links.
type MdxNodeProps<T> = React.HTMLAttributes<T> & { children?: React.ReactNode };

const mdxComponents = {
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

export default async function LegalRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();

  const { body, frontmatter } = await loadLegal(slug);

  return (
    <LegalPage title={frontmatter.title} lastUpdated={frontmatter.lastUpdated}>
      <MDXRemote source={body} components={mdxComponents} />
    </LegalPage>
  );
}
