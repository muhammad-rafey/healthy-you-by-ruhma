// lib/journal-data.ts
//
// Helpers for the /journal index and /journal/[slug] post template.
// Loads every MDX file under content/journal, filters drafts in prod,
// sorts by publishedAt desc, and exposes a few small utilities (related
// posts, category list) used by the page components.
//
// Per phase 10 plan §3.11. The frontmatter contract lives in
// lib/content/types.ts → JournalFrontmatter; this file does NOT
// redefine it.

import { listSlugs, loadJournal } from "@/lib/mdx";
import type { JournalFrontmatter, LoadedDocument } from "@/lib/mdx";

export type JournalSummary = JournalFrontmatter;

export type JournalDocument = LoadedDocument<JournalFrontmatter>;

/**
 * Title-case a category slug for chip / eyebrow display.
 */
export function formatCategory(category: JournalFrontmatter["category"]): string {
  switch (category) {
    case "case-notes":
      return "Case notes";
    case "nutrition":
      return "Nutrition";
    case "hormones":
      return "Hormones";
    case "lifestyle":
      return "Lifestyle";
    case "recipes":
      return "Recipes";
    default:
      return category;
  }
}

/**
 * Human-readable date (e.g. "8 May 2026"). Server-only so we don't ship
 * Intl helpers to the client.
 */
export function formatPostDate(iso: string): string {
  // Parse as UTC midnight to avoid TZ-bumping a YYYY-MM-DD into the
  // previous day in negative-UTC environments.
  const parts = iso.split("-").map((n) => Number.parseInt(n, 10));
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Read every journal MDX, sorted by publishedAt desc. Drafts are hidden
 * in production and surfaced in dev so authors can preview.
 */
export async function loadAllJournal(): Promise<JournalDocument[]> {
  const slugs = await listSlugs("journal");
  const docs = await Promise.all(slugs.map((s) => loadJournal(s)));
  const visible =
    process.env.NODE_ENV === "production"
      ? docs.filter((d) => d.frontmatter.status === "published")
      : docs;
  visible.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).valueOf() - new Date(a.frontmatter.publishedAt).valueOf(),
  );
  return visible;
}

/**
 * Categories actually represented by the visible posts. Title-cased,
 * de-duped, sorted alphabetically. Empty when there are no posts.
 */
export async function loadJournalCategories(): Promise<
  { value: JournalFrontmatter["category"]; label: string }[]
> {
  const docs = await loadAllJournal();
  const seen = new Set<JournalFrontmatter["category"]>();
  for (const d of docs) seen.add(d.frontmatter.category);
  return [...seen]
    .map((value) => ({ value, label: formatCategory(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Up to `limit` posts other than `slug`, preferring same-category first.
 */
export async function loadRelatedJournal(slug: string, limit = 3): Promise<JournalDocument[]> {
  const all = await loadAllJournal();
  const current = all.find((d) => d.frontmatter.slug === slug);
  if (!current) return [];
  const sameCat = all.filter(
    (d) => d.frontmatter.slug !== slug && d.frontmatter.category === current.frontmatter.category,
  );
  const others = all.filter(
    (d) => d.frontmatter.slug !== slug && d.frontmatter.category !== current.frontmatter.category,
  );
  return [...sameCat, ...others].slice(0, limit);
}
