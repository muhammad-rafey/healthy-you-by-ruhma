// app/journal/page.tsx
//
// /journal — editorial blog index. Layout follows master plan §3.11:
//   1. Type-only header (Eyebrow + LetterStagger title + subhead)
//   2. <FeaturedPost> — most recent published post, large 16:9 card
//   3. <CategoryChips> — anchors to filterable views (deferred, links only)
//   4. <PostGrid> — 3-col grid; placeholder cards when catalogue is small
//   5. <JournalEmptyState> — newsletter capture below the grid
//
// Static generation only. Drafts are surfaced in dev to ease previews and
// hidden in production via loadAllJournal().

import type { Metadata } from "next";

import { site } from "@/content/site";
import { loadAllJournal, loadJournalCategories } from "@/lib/journal-data";

import { JournalHero } from "@/components/marketing/journal/journal-hero";
import { FeaturedPost } from "@/components/marketing/journal/featured-post";
import { CategoryChips } from "@/components/marketing/journal/category-chips";
import { PostGrid } from "@/components/marketing/journal/post-grid";
import { JournalEmptyState } from "@/components/marketing/journal/empty-state";

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

export default async function JournalIndexPage() {
  const docs = await loadAllJournal();
  const categories = await loadJournalCategories();
  const posts = docs.map((d) => d.frontmatter);

  if (posts.length === 0) {
    return (
      <>
        <JournalHero postCount={0} />
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
      <CategoryChips categories={categories} />
      <PostGrid posts={rest} />
      <JournalEmptyState />
    </>
  );
}
