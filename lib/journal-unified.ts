// lib/journal-unified.ts
//
// The public /journal index and /journal/[slug] surface BOTH the static
// MDX entries (content/journal/*.mdx) and the MongoDB-backed posts authored
// in /admin (formerly the standalone /blog). This module is the single merge
// point: it maps each source into one `UnifiedEntry` shape the journal
// components consume, so those components never branch on origin — except
// image rendering, which keys off `source` (MDX = local /media path via
// next/image; blog = arbitrary remote URL via plain <img>, per CLAUDE.md).

import { loadJournal } from "@/lib/mdx";
import type { JournalFrontmatter } from "@/lib/mdx";
import { loadAllJournal, formatCategory } from "@/lib/journal-data";
import { getAllPosts, getCoverImage, getPostBySlug } from "@/lib/blog-data";
import type { BlogPost } from "@/lib/blog-data";

export type UnifiedEntry = {
  source: "mdx" | "blog";
  slug: string;
  title: string;
  description: string;
  category: JournalFrontmatter["category"];
  publishedAt: string; // YYYY-MM-DD — so lib/journal-data formatPostDate works
  updatedAt?: string; // YYYY-MM-DD
  readingTime: number;
  heroImage?: string; // /media/... (mdx) or remote URL (blog)
};

export type LoadedEntry = {
  entry: UnifiedEntry;
  body: string;
  bodyKind: "mdx" | "text";
};

// Mirror of the JournalFrontmatter.category enum in lib/content/types.ts
// (kept as a list here so route code can validate a `?category=` query).
export const JOURNAL_CATEGORIES = [
  "nutrition",
  "hormones",
  "lifestyle",
  "recipes",
  "case-notes",
] as const;

export function isJournalCategory(value: string): value is UnifiedEntry["category"] {
  return (JOURNAL_CATEGORIES as readonly string[]).includes(value);
}

const WORDS_PER_MIN = 200;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function readingTimeFor(text: string): number {
  const words = text.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MIN));
}

function fromFrontmatter(fm: JournalFrontmatter): UnifiedEntry {
  return {
    source: "mdx",
    slug: fm.slug,
    title: fm.title,
    description: fm.description,
    category: fm.category,
    publishedAt: fm.publishedAt,
    updatedAt: fm.updatedAt,
    readingTime: fm.readingTime,
    heroImage: fm.heroImage,
  };
}

function fromBlogPost(post: BlogPost): UnifiedEntry {
  return {
    source: "blog",
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    publishedAt: isoDay(new Date(post.createdAt)),
    updatedAt: isoDay(new Date(post.updatedAt)),
    readingTime: readingTimeFor(post.description),
    heroImage: getCoverImage(post),
  };
}

function byPublishedDesc(a: UnifiedEntry, b: UnifiedEntry): number {
  return new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf();
}

/** Every visible journal entry — MDX + Mongo — newest first. */
export async function loadAllEntries(): Promise<UnifiedEntry[]> {
  const [docs, posts] = await Promise.all([loadAllJournal(), getAllPosts()]);
  const merged = [...docs.map((d) => fromFrontmatter(d.frontmatter)), ...posts.map(fromBlogPost)];
  merged.sort(byPublishedDesc);
  return merged;
}

/**
 * Resolve one entry by slug. MDX wins a collision — its slugs are
 * hand-authored and stable; Mongo slugs carry a random suffix.
 */
export async function loadEntryBySlug(slug: string): Promise<LoadedEntry | null> {
  try {
    const doc = await loadJournal(slug);
    return { entry: fromFrontmatter(doc.frontmatter), body: doc.body, bodyKind: "mdx" };
  } catch {
    // Not an MDX entry — fall through to the Mongo catalogue.
  }
  const post = await getPostBySlug(slug);
  if (post) {
    return { entry: fromBlogPost(post), body: post.description, bodyKind: "text" };
  }
  return null;
}

/** Up to `limit` other entries, same-category first. */
export async function loadRelatedEntries(slug: string, limit = 3): Promise<UnifiedEntry[]> {
  const all = await loadAllEntries();
  const current = all.find((e) => e.slug === slug);
  if (!current) return [];
  const sameCat = all.filter((e) => e.slug !== slug && e.category === current.category);
  const others = all.filter((e) => e.slug !== slug && e.category !== current.category);
  return [...sameCat, ...others].slice(0, limit);
}

/** Distinct categories across the merged catalogue, title-cased. */
export async function loadEntryCategories(): Promise<
  { value: JournalFrontmatter["category"]; label: string }[]
> {
  const all = await loadAllEntries();
  const seen = new Set<JournalFrontmatter["category"]>();
  for (const e of all) seen.add(e.category);
  return [...seen]
    .map((value) => ({ value, label: formatCategory(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
