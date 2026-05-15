// app/journal/page.tsx
//
// /journal — editorial blog index. Now merges the static MDX entries
// (content/journal/*.mdx) with the MongoDB-backed posts authored in /admin
// (the former standalone /blog). Layout is unchanged (master plan §3.11):
//   1. <JournalHero> — type-only header
//   2. <FeaturedPost> — most recent entry, large card
//   3. <CategoryChips> — now a live `?category=` filter, active chip lit
//   4. <PostGrid> — 3-col grid; placeholder cards when catalogue is small
//   5. <JournalEmptyState> — newsletter capture below the grid
//
// Mongo-backed → Node runtime + revalidate 0 (CLAUDE.md). MDX drafts stay
// hidden in production via loadAllJournal() inside the merge layer.

import type { Metadata } from "next";

import { site } from "@/content/site";
import { loadAllEntries, loadEntryCategories, isJournalCategory } from "@/lib/journal-unified";

import { JournalHero } from "@/components/marketing/journal/journal-hero";
import { FeaturedPost } from "@/components/marketing/journal/featured-post";
import { CategoryChips } from "@/components/marketing/journal/category-chips";
import { PostGrid } from "@/components/marketing/journal/post-grid";
import { JournalEmptyState } from "@/components/marketing/journal/empty-state";

export const runtime = "nodejs";
export const revalidate = 0;

const PAGE_DESCRIPTION =
  "Notes from Dr. Ruhma's clinic — on hormones, nutrition, and the small habits that actually move the needle.";

export const metadata: Metadata = {
  title: `Journal · ${site.name}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/journal" },
  openGraph: {
    title: `Journal · ${site.name}`,
    description: PAGE_DESCRIPTION,
    url: "/journal",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Journal · ${site.name}`,
    description: PAGE_DESCRIPTION,
  },
};

export default async function JournalIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category && isJournalCategory(category) ? category : undefined;

  const [all, categories] = await Promise.all([loadAllEntries(), loadEntryCategories()]);
  const posts = active ? all.filter((e) => e.category === active) : all;

  if (posts.length === 0) {
    // Keep the chips visible when a filter emptied the view so the reader
    // can switch categories without back-buttoning.
    return (
      <>
        <JournalHero postCount={0} />
        {active ? <CategoryChips categories={categories} activeCategory={active} /> : null}
        <JournalEmptyState />
      </>
    );
  }

  const [featured, ...rest] = posts;
  if (!featured) {
    return (
      <>
        <JournalHero postCount={0} />
        <JournalEmptyState />
      </>
    );
  }

  return (
    <>
      <JournalHero postCount={posts.length} />
      <FeaturedPost post={featured} />
      <CategoryChips categories={categories} activeCategory={active} />
      <PostGrid posts={rest} />
      <JournalEmptyState />
    </>
  );
}
