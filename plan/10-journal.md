# 10 — Journal (`/journal` index + `/journal/[slug]` posts)

> Implementation plan for the Journal section. Per master plan §3.11. Build the
> structure ready to scale even though the current site has only one
> placeholder post.

---

## 1. Goal

Ship a Journal that already feels like a _publication_, not a starter blog
template — even with zero or one real post in it. The two states the section
must handle gracefully:

1. **Empty / under-populated** (`< 2` MDX posts in `content/journal/`): a
   considered editorial empty-state with a newsletter capture form and one or
   two sample teaser cards. Never an Elementor-style "no posts yet" stub.
2. **Populated** (`>= 2` posts): a featured-post hero (most recent) + a
   magazine-style mixed-size grid of the rest, plus a categories chip row that
   filters by category (client-side, no router round-trips for chips).

A post page reads as a longread: Epilogue title, eyebrow strip
(category · date · read time), Inter 17/1.6 article body capped at 680px,
drop-cap on the first paragraph, MDX components for `<Pullquote>`,
`<FigureCaption>`, `<Aside>`, `<Illustration>`, `<DropCap>`. Post pages end
with an author footer (Dr. Ruhma, small portrait, one paragraph, link to
`/about`) and a "More entries" related strip.

Out-of-the-box deliverables:

- 2 placeholder MDX posts with realistic dietitian topics and ~600-word bodies
  so the grid layout has visible content during build review.
- JSON-LD `Article` schema per post.
- RSS 2.0 feed at `/journal/feed.xml` exposing the 20 most recent posts.
- Auto read-time (220 wpm, rounded) when frontmatter omits `readTime`.

This plan does NOT cover pagination, search, or comments — see §7.

---

## 2. Pre-requisites

The journal cannot start until these earlier plans have shipped (or at minimum
their public surface):

| Plan                             | What we depend on                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01 — Design system**           | `--cream`, `--cream-deep`, `--shell`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper` tokens; Inter + Epilogue via `next/font`; `<Eyebrow>`, `<Heading>`, `<Container>`, `<Button>` primitives; `<FadeUp>` and `<LetterStagger>` motion utilities.                                                                                                                            |
| **02 — Layout shell**            | `app/layout.tsx`, sticky `<Nav>`, `<Footer>` (we reuse footer's newsletter form markup for the empty-state form), redirects, `sitemap.ts` (we'll add journal entries from this plan).                                                                                                                                                                                                               |
| **03 — Content/media migration** | `public/media/` populated with optimized AVIF/WEBP renditions (post cover images live there); `content/` directory convention; the `gray-matter` + `next-mdx-remote` setup decided upstream.                                                                                                                                                                                                        |
| **08 — Focus pages** (partial)   | The `<Prose>` component (article-body wrapper that applies type scale, drop-cap support, max-width 680px column, link styling, blockquote treatment, `prose-img` rules) is shared with focus longreads. Journal extends it with article-only MDX components but does NOT redefine it. If 08 is in flight when we start, build a minimum `<Prose>` here and let 08 absorb it; don't fork two copies. |

If a teammate is mid-flight on 08, **do not duplicate `<Prose>`**. Coordinate
to land the shared base first, then add journal-specific MDX components on top
of it from this plan.

---

## 3. Dependencies

Journal-specific NPM additions (most of the heavy lifting comes from packages
already added in 03):

```jsonc
// package.json  — new entries only
{
  "dependencies": {
    "reading-time": "^1.5.0", // word-count → read-time, optional but cheap
    "rehype-slug": "^6.0.0", // ids on h2/h3 inside posts (used for anchors and related-strip linking later)
    "rehype-autolink-headings": "^7.1.0",
    "remark-smartypants": "^3.0.2", // curly quotes, em-dashes — editorial polish
  },
}
```

Already assumed installed by plan 03 (do **not** re-add them):

- `next-mdx-remote@^5`
- `gray-matter@^4`
- `remark-gfm`
- `schema-dts` (for JSON-LD types)
- `date-fns` (post date formatting)

### Why `reading-time` (not roll-our-own)

Rolling read-time is ~5 lines (`text.trim().split(/\s+/).length / 220`), but
`reading-time` handles edge cases that bite later: CJK fallback, ignoring code
fences, returning a normalized object `{ text, minutes, time, words }` with a
stable `Math.ceil` policy. It's 1 KB, zero deps, 12-year-old battle-tested
code. The 5-line version is fine until someone writes a post with a code
block, an embedded image caption with 200 words of alt-text, or a Pakistani
Urdu loanword passage — and then we're rewriting it. Pay the 1 KB.

We override the wpm to **220** in our wrapper (see `lib/journal.ts`) so we
match the brief regardless of the library's default (200).

---

## 4. Files to create / modify

### 4.1 Content — placeholder posts

Two MDX posts under `content/journal/` so the grid renders during build:

```
content/journal/
├── what-i-tell-every-pcos-client-first.mdx
└── the-breakfast-lie.mdx
```

Frontmatter contract (Zod-validated at build, see `lib/journal.ts`):

```yaml
title: "What I tell every PCOS client first"
slug: what-i-tell-every-pcos-client-first
excerpt: "Before macros, before supplements, before the ‘best’ diet —
  there’s a single conversation that changes the next twelve weeks."
date: 2026-04-12 # ISO 8601, used for sort + RSS pubDate
category: "PCOS" # title-case, used for chip + eyebrow + JSON-LD
coverImage: /media/journal/pcos-first-conversation-cover.jpg
ogImage: /media/journal/pcos-first-conversation-og.jpg # optional, falls back to coverImage
readTime: 5 # optional minutes — auto-computed from body if missing
author: "Dr. Ruhma" # single author for now; see §7
draft: false # if true, omitted from index/RSS (still SSG'd in dev)
```

Bodies: ~600 words each. Topics:

1. **"What I tell every PCOS client first"** — category `PCOS`. Drop-cap
   opening, one `<Pullquote>` mid-article, one `<Aside>` callout box, one
   captioned hero image inside the body via `<FigureCaption>`.
2. **"The breakfast lie"** — category `Habits`. Same MDX components used in
   different positions so the QA review covers them all.

The MDX bodies are not specified line-by-line here (writer's job at content
time), but the **components used must include at minimum**:
`<DropCap>` (or `:::dropcap` shortcode) on the opening paragraph,
`<Pullquote>` once, `<Aside>` once, `<FigureCaption>` around one image.

### 4.2 `lib/journal.ts` — content loader, sort, dedupe, read-time

```ts
// lib/journal.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

const JOURNAL_DIR = path.join(process.cwd(), "content", "journal");

const FrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1).max(280),
  date: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  category: z.string().min(1),
  coverImage: z.string().startsWith("/"),
  ogImage: z.string().startsWith("/").optional(),
  readTime: z.number().int().positive().optional(),
  author: z.string().default("Dr. Ruhma"),
  draft: z.boolean().default(false),
});

export type JournalFrontmatter = z.infer<typeof FrontmatterSchema>;

export interface JournalPost {
  frontmatter: JournalFrontmatter & { readTime: number; ogImage: string };
  body: string; // raw MDX, compiled per-route
  filepath: string; // for build error messages
}

const WPM = 220;

let cache: JournalPost[] | null = null;

export async function getAllPosts(): Promise<JournalPost[]> {
  if (cache) return cache;

  const entries = await fs.readdir(JOURNAL_DIR, { withFileTypes: true });
  const mdxFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".mdx"));

  const posts: JournalPost[] = [];
  for (const file of mdxFiles) {
    const filepath = path.join(JOURNAL_DIR, file.name);
    const raw = await fs.readFile(filepath, "utf8");
    const { data, content } = matter(raw);

    const parsed = FrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in ${file.name}:\n${parsed.error.message}`);
    }

    // Cross-check: slug must match filename (without .mdx).
    const fileSlug = file.name.replace(/\.mdx$/, "");
    if (parsed.data.slug !== fileSlug) {
      throw new Error(
        `Slug mismatch in ${file.name}: frontmatter "${parsed.data.slug}" vs filename "${fileSlug}"`,
      );
    }

    const computedMinutes = Math.max(
      1,
      Math.round(readingTime(content, { wordsPerMinute: WPM }).minutes),
    );

    posts.push({
      frontmatter: {
        ...parsed.data,
        readTime: parsed.data.readTime ?? computedMinutes,
        ogImage: parsed.data.ogImage ?? parsed.data.coverImage,
      },
      body: content,
      filepath,
    });
  }

  // Drafts hidden in production, surfaced in dev for preview.
  const visible =
    process.env.NODE_ENV === "production" ? posts.filter((p) => !p.frontmatter.draft) : posts;

  visible.sort(
    (a, b) => new Date(b.frontmatter.date).valueOf() - new Date(a.frontmatter.date).valueOf(),
  );

  cache = visible;
  return visible;
}

export async function getPostBySlug(slug: string): Promise<JournalPost | null> {
  const all = await getAllPosts();
  return all.find((p) => p.frontmatter.slug === slug) ?? null;
}

export async function getCategories(): Promise<string[]> {
  const all = await getAllPosts();
  const set = new Set(all.map((p) => p.frontmatter.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<JournalPost[]> {
  const all = await getAllPosts();
  const current = all.find((p) => p.frontmatter.slug === slug);
  if (!current) return [];

  const sameCat = all.filter(
    (p) => p.frontmatter.slug !== slug && p.frontmatter.category === current.frontmatter.category,
  );
  const others = all.filter(
    (p) => p.frontmatter.slug !== slug && p.frontmatter.category !== current.frontmatter.category,
  );

  return [...sameCat, ...others].slice(0, limit);
}
```

Cache notes: the module-scoped `cache` is fine because Next builds run as a
single process per build and RSC re-renders read fresh from the cache. In dev,
HMR will reload this module on file change so we don't need invalidation.

### 4.3 `app/journal/page.tsx` — index, empty-state aware

```tsx
// app/journal/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FeaturedPost } from "@/components/marketing/journal/FeaturedPost";
import { PostGrid } from "@/components/marketing/journal/PostGrid";
import { CategoryChips } from "@/components/marketing/journal/CategoryChips";
import { EmptyState } from "@/components/marketing/journal/EmptyState";
import { getAllPosts, getCategories } from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal — Healthy You By Ruhma",
  description:
    "Notes from Dr. Ruhma's clinic — on PCOS, hormonal health, weight management, and the small habits that actually move the needle.",
  alternates: {
    canonical: "/journal",
    types: { "application/rss+xml": "/journal/feed.xml" },
  },
};

export default async function JournalIndexPage() {
  const posts = await getAllPosts();
  const categories = await getCategories();

  // Empty-state-aware: under-populated index renders differently.
  if (posts.length < 2) {
    return (
      <Container as="main" className="py-24 md:py-32">
        <header className="mb-16 max-w-2xl">
          <Eyebrow>Journal</Eyebrow>
          <Heading level={1} display>
            Notes from the clinic.
          </Heading>
        </header>
        <EmptyState teaser={posts[0] ?? null} />
      </Container>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <Container as="main" className="py-24 md:py-32">
      <header className="mb-16 max-w-2xl">
        <Eyebrow>Journal</Eyebrow>
        <Heading level={1} display>
          Notes from the clinic.
        </Heading>
      </header>

      <FeaturedPost post={featured} />

      {categories.length > 1 && (
        <div className="mt-24">
          <CategoryChips categories={categories} />
        </div>
      )}

      <div className="mt-12">
        <PostGrid posts={rest} />
      </div>
    </Container>
  );
}
```

**Why we put the empty-state branch at the top of the route component instead
of inside `<PostGrid>`**: the empty layout is materially different — no
featured-card, no chip row, a newsletter form takes over the visual weight.
Branching here keeps the populated path uncluttered and the empty path
intentional.

### 4.4 `app/journal/[slug]/page.tsx` — post route

```tsx
// app/journal/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { PostHero } from "@/components/marketing/journal/PostHero";
import { PostBody } from "@/components/marketing/journal/PostBody";
import { AuthorFooter } from "@/components/marketing/journal/AuthorFooter";
import { RelatedPosts } from "@/components/marketing/journal/RelatedPosts";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/journal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.frontmatter.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const { title, excerpt, ogImage, date, category } = post.frontmatter;
  return {
    title: `${title} — Journal`,
    description: excerpt,
    alternates: { canonical: `/journal/${slug}` },
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      publishedTime: date,
      images: [{ url: ogImage }],
      tags: [category],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      images: [ogImage],
    },
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, 3);

  return (
    <>
      <ArticleJsonLd post={post} />
      <article>
        <PostHero post={post} />
        <PostBody>
          <MDXRemote
            source={post.body}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkSmartypants],
                rehypePlugins: [
                  rehypeSlug,
                  [
                    rehypeAutolinkHeadings,
                    { behavior: "wrap", properties: { className: "anchor" } },
                  ],
                ],
              },
            }}
          />
        </PostBody>
        <AuthorFooter />
      </article>
      {related.length > 0 && <RelatedPosts posts={related} />}
    </>
  );
}
```

### 4.5 `components/marketing/journal/FeaturedPost.tsx`

```tsx
// components/marketing/journal/FeaturedPost.tsx
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { FadeUp } from "@/components/motion/FadeUp";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { JournalPost } from "@/lib/journal";

interface Props {
  post: JournalPost;
}

export function FeaturedPost({ post }: Props) {
  const { slug, title, excerpt, coverImage, category, date, readTime } = post.frontmatter;

  return (
    <FadeUp asChild>
      <Link href={`/journal/${slug}`} className="group block focus-visible:outline-none">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-[--cream-deep]">
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1100px, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-2">
            <Eyebrow>{category}</Eyebrow>
          </div>
          <div className="md:col-span-7">
            <h2 className="font-display text-[clamp(36px,5vw,56px)] leading-[1.05] font-medium tracking-[-0.02em] text-[--ink]">
              {title}
            </h2>
            <p className="mt-6 max-w-prose text-[17px] leading-[1.6] text-[--ink-soft]">
              {excerpt}
            </p>
          </div>
          <div className="flex items-end md:col-span-3">
            <div className="text-[13px] tracking-[0.04em] text-[--ink-soft]">
              <time dateTime={date}>{format(new Date(date), "MMMM d, yyyy")}</time>
              <span aria-hidden> · </span>
              <span>{readTime} min read</span>
              <div className="mt-6 inline-flex items-center gap-2 text-[--mauve] underline-offset-4 group-hover:text-[--mauve-deep] group-hover:underline">
                Read <span aria-hidden>→</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </FadeUp>
  );
}
```

Why this card sits inside one big `<Link>`: the entire featured block is the
primary action; splitting "title" and "Read →" into separate links creates
two competing tab-stops for one item. We compensate by giving the
`Read →` element visual treatment so screen-reader users hear "Read,
[title]" naturally via the `<h2>` order.

### 4.6 `components/marketing/journal/PostGrid.tsx`

Magazine-style, mixed sizes. CSS Grid with explicit named template areas at
the desktop breakpoint. The first card spans 7 columns, the next two span 5
each, then 4-4-4 — a rhythm the eye reads as "feature → pair → triplet."

```tsx
// components/marketing/journal/PostGrid.tsx
import { PostCard } from "./PostCard";
import type { JournalPost } from "@/lib/journal";

interface Props {
  posts: JournalPost[];
}

export function PostGrid({ posts }: Props) {
  return (
    <ul className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-12" role="list">
      {posts.map((post, i) => {
        // Magazine rhythm: 7-5 / 5-7 / 4-4-4 / repeat
        const cycle = i % 5;
        const span =
          cycle === 0
            ? "md:col-span-7"
            : cycle === 1
              ? "md:col-span-5"
              : cycle === 2
                ? "md:col-span-5"
                : "md:col-span-4";
        const size = span === "md:col-span-7" ? "lg" : span === "md:col-span-5" ? "md" : "sm";
        return (
          <li key={post.frontmatter.slug} className={span}>
            <PostCard post={post} size={size} />
          </li>
        );
      })}
    </ul>
  );
}
```

### 4.7 `components/marketing/journal/PostCard.tsx`

Three sizes (`lg` / `md` / `sm`) — same component, different image aspect and
title scale. Reuse cuts component count.

| Size | Image aspect | Title clamp              | Used for             |
| ---- | ------------ | ------------------------ | -------------------- |
| `lg` | 4 / 3        | clamp(28px, 3vw, 36px)   | First card per cycle |
| `md` | 3 / 4        | clamp(24px, 2.4vw, 30px) | Portrait-feel card   |
| `sm` | 4 / 3        | clamp(20px, 2vw, 24px)   | Triplet row          |

Shared anatomy: image · eyebrow (category) · title · 2-line excerpt clamp ·
date + read-time row. The whole card is a `<Link>` wrapping. Hover: image
scales 1.02 over 600ms, title underline appears under the first 1ch via
`text-decoration: underline; text-decoration-color: var(--mauve);` flickering
in over 200ms.

### 4.8 `components/marketing/journal/CategoryChips.tsx`

Derives chips from the actual posts so we never get a category chip with zero
entries. Client component because we do client-side filtering — clicking a
chip filters `<PostGrid>` without a navigation.

```tsx
// components/marketing/journal/CategoryChips.tsx
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  categories: string[];
  // Controlled mode: parent (a wrapper client component on the index)
  // can subscribe to changes by passing `onChange`. For the v1 ship,
  // we keep it self-contained and re-render the grid via a context.
}

export function CategoryChips({ categories }: Props) {
  const all = useMemo(() => ["All", ...categories], [categories]);
  const [active, setActive] = useState("All");

  return (
    <nav aria-label="Filter posts by category">
      <ul className="flex flex-wrap gap-2" role="list">
        {all.map((cat) => {
          const isActive = cat === active;
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full px-4 py-2 text-[13px] tracking-[0.04em] transition-colors",
                  isActive
                    ? "bg-[--ink] text-[--cream]"
                    : "bg-[--shell] text-[--ink] hover:bg-[--mauve] hover:text-[--cream]",
                )}
              >
                {cat}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

Implementation note on filtering: the simplest wiring is a thin
`<JournalIndexClient>` wrapper that receives `posts` as a prop, hosts both
`<CategoryChips>` and `<PostGrid>`, and filters by category in state. The
index server component passes posts down once. We keep the _featured_ card
out of the filterable set — it's always the most recent, regardless of chip.

If the team chooses to skip client-side filtering for v1 (acceptable while
post count is < 12), render the chips as visual eyebrows only and link them
to `/journal?category=…` for future server filtering. **Document the choice
in the commit message** so the reader doesn't trip over half-wired UI.

### 4.9 `components/marketing/journal/EmptyState.tsx` — _full code_

This is one of the most-seen components for the next 6 months. It must not
look like a fallback — it has to feel like the page was designed to be empty.

```tsx
// components/marketing/journal/EmptyState.tsx
import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { NewsletterInlineForm } from "@/components/marketing/NewsletterInlineForm";
import type { JournalPost } from "@/lib/journal";

interface Props {
  // If a single placeholder post exists, surface it as a teaser card so the
  // page isn't pure copy + form.
  teaser: JournalPost | null;
}

export function EmptyState({ teaser }: Props) {
  return (
    <section className="grid gap-16 md:grid-cols-12 md:gap-x-12">
      <div className="md:col-span-7">
        <p className="font-display text-[clamp(32px,4vw,48px)] leading-[1.1] font-medium tracking-[-0.02em] text-[--ink]">
          New entries coming soon —
          <br />
          sign up for updates.
        </p>
        <p className="mt-6 max-w-prose text-[17px] leading-[1.6] text-[--ink-soft]">
          Short, useful notes from the clinic — on PCOS, hormonal health, weight management, and the
          small habits that actually move the needle. One letter, every other Sunday, no spam.
        </p>

        <div className="mt-10 max-w-md">
          <NewsletterInlineForm
            source="journal-empty-state"
            placeholder="Your email address"
            cta="Sign up"
          />
        </div>

        <p className="mt-4 text-[13px] tracking-[0.04em] text-[--ink-soft]">
          Or{" "}
          <Link
            href="/contact"
            className="text-[--mauve] underline underline-offset-4 hover:text-[--mauve-deep]"
          >
            send a question
          </Link>{" "}
          and Dr. Ruhma may answer it in the next entry.
        </p>
      </div>

      {teaser ? (
        <aside className="md:col-span-5">
          <Eyebrow>Sneak peek</Eyebrow>
          <Link href={`/journal/${teaser.frontmatter.slug}`} className="group mt-4 block">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[--cream-deep]">
              <Image
                src={teaser.frontmatter.coverImage}
                alt=""
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
            <h2 className="font-display mt-6 text-[clamp(24px,2.5vw,30px)] leading-[1.15] font-medium tracking-[-0.02em] text-[--ink]">
              {teaser.frontmatter.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-[15px] leading-[1.55] text-[--ink-soft]">
              {teaser.frontmatter.excerpt}
            </p>
          </Link>
        </aside>
      ) : (
        <aside className="md:col-span-5">
          <div className="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-sm bg-[--cream-deep] p-12 text-center">
            <Eyebrow>Coming soon</Eyebrow>
            <p className="font-display mt-6 text-[28px] leading-[1.2] tracking-[-0.02em] text-[--ink-soft]">
              The first entries are being written.
            </p>
          </div>
        </aside>
      )}
    </section>
  );
}
```

`<NewsletterInlineForm>` is the same component used in the global footer
(plan 02). Its `source` prop tags the analytics event so we can tell where
signups came from. Wired to a real provider in launch phase.

### 4.10 `components/marketing/journal/PostHero.tsx`

```tsx
// components/marketing/journal/PostHero.tsx
import { format } from "date-fns";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/LetterStagger";
import type { JournalPost } from "@/lib/journal";

export function PostHero({ post }: { post: JournalPost }) {
  const { title, category, date, readTime } = post.frontmatter;

  return (
    <header className="border-b border-[--cream-deep] bg-[--cream]">
      <Container className="py-24 md:py-32">
        <div className="mx-auto max-w-[820px]">
          <div className="flex items-center gap-3 text-[12px] tracking-[0.16em] text-[--ink-soft] uppercase">
            <Eyebrow as="span">{category}</Eyebrow>
            <span aria-hidden>·</span>
            <time dateTime={date}>{format(new Date(date), "MMMM d, yyyy")}</time>
            <span aria-hidden>·</span>
            <span>{readTime} min read</span>
          </div>
          <h1 className="font-display mt-8 text-[clamp(40px,6vw,72px)] leading-[1.05] font-medium tracking-[-0.03em] text-[--ink]">
            <LetterStagger text={title} />
          </h1>
        </div>
      </Container>
    </header>
  );
}
```

### 4.11 `components/marketing/journal/PostBody.tsx` — _full code_

Wraps the shared `<Prose>` (from plan 08) with article-specific MDX
components.

```tsx
// components/marketing/journal/PostBody.tsx
import type { ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import { Prose } from "@/components/ui/prose";
import { Pullquote } from "@/components/marketing/Pullquote";
import { Illustration } from "@/components/marketing/Illustration";

interface Props {
  children: ReactNode;
}

// Article-specific MDX components.
// `<Prose>` injects type scale + drop-cap on first <p>; we layer journal
// components on top.

export function DropCap({ children }: { children: ReactNode }) {
  // Used when an author wants drop-cap on a paragraph that isn't the first.
  // Standard first-paragraph drop-cap is automatic via `<Prose>` styles.
  return <p className="dropcap">{children}</p>;
}

export function FigureCaption({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="-mx-4 my-12 md:-mx-16 lg:-mx-24">
      <div className="overflow-hidden rounded-sm bg-[--cream-deep]">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 920px, 100vw"
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 px-1 text-[13px] leading-[1.5] tracking-[0.02em] text-[--ink-soft] italic">
        {caption}
      </figcaption>
    </figure>
  );
}

export function Aside({ children }: { children: ReactNode }) {
  // Small sidebar callout in mauve. Use sparingly — once per post max.
  return (
    <aside
      className="my-10 rounded-sm border-l-2 border-[--mauve] bg-[--shell]/40 px-6 py-5 text-[15px] leading-[1.55] text-[--ink-soft]"
      role="note"
    >
      {children}
    </aside>
  );
}

const components = {
  DropCap,
  FigureCaption,
  Aside,
  Pullquote,
  Illustration,
  // Lock down raw <img> inside MDX — force authors through FigureCaption.
  img: (_props: ImageProps) => {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "Use <FigureCaption src=… alt=… caption=… /> instead of raw <img> in journal MDX.",
      );
    }
    return null;
  },
};

export function PostBody({ children }: Props) {
  return (
    <Prose className="mx-auto max-w-[680px] px-6 py-16 md:py-24" mdxComponents={components}>
      {children}
    </Prose>
  );
}
```

The `img` override is intentional — captioned figures look right, raw
inline images look like a forum post. The dev-time error makes the rule
obvious; production silently drops to avoid breaking a site over a missed
review.

### 4.12 `components/marketing/journal/AuthorFooter.tsx`

```tsx
// components/marketing/journal/AuthorFooter.tsx
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export function AuthorFooter() {
  return (
    <Container className="my-24">
      <div className="mx-auto flex max-w-[680px] items-start gap-6 border-t border-[--cream-deep] pt-12">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[--cream-deep]">
          <Image
            src="/media/about/dr-ruhma-portrait-sm.jpg"
            alt="Dr. Ruhma"
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="text-[15px] leading-[1.6] text-[--ink-soft]">
          <p>
            <span className="font-medium text-[--ink]">Dr. Ruhma</span> is a clinical dietitian
            based in Lahore. She runs Healthy You By Ruhma — a practice focused on hormonal health,
            PCOS, and sustainable weight management.{" "}
            <Link
              href="/about"
              className="text-[--mauve] underline underline-offset-4 hover:text-[--mauve-deep]"
            >
              More about her work →
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
```

### 4.13 `components/marketing/journal/RelatedPosts.tsx`

```tsx
// components/marketing/journal/RelatedPosts.tsx
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PostCard } from "./PostCard";
import type { JournalPost } from "@/lib/journal";

export function RelatedPosts({ posts }: { posts: JournalPost[] }) {
  return (
    <section
      aria-labelledby="more-entries"
      className="border-t border-[--cream-deep] bg-[--cream-deep]/50"
    >
      <Container className="py-20 md:py-24">
        <header className="mb-12 flex items-baseline justify-between">
          <Eyebrow id="more-entries">More entries</Eyebrow>
        </header>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3" role="list">
          {posts.map((post) => (
            <li key={post.frontmatter.slug}>
              <PostCard post={post} size="sm" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

### 4.14 `components/seo/ArticleJsonLd.tsx`

```tsx
// components/seo/ArticleJsonLd.tsx
import type { Article, WithContext } from "schema-dts";
import type { JournalPost } from "@/lib/journal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dietitianruhma.com";

export function ArticleJsonLd({ post }: { post: JournalPost }) {
  const { title, slug, excerpt, date, ogImage, category, author, readTime } = post.frontmatter;

  const data: WithContext<Article> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    datePublished: date,
    dateModified: date,
    image: [`${SITE_URL}${ogImage}`],
    articleSection: category,
    author: {
      "@type": "Person",
      name: author,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Healthy You By Ruhma",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/illustrations/wordmark.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/journal/${slug}`,
    },
    timeRequired: `PT${readTime}M`,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### 4.15 `app/journal/feed.xml/route.ts` — _full code_

```ts
// app/journal/feed.xml/route.ts
import { getAllPosts } from "@/lib/journal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dietitianruhma.com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = (await getAllPosts()).slice(0, 20);
  const buildDate = new Date().toUTCString();

  const items = posts
    .map((p) => {
      const { title, slug, excerpt, date, category, ogImage } = p.frontmatter;
      const url = `${SITE_URL}/journal/${slug}`;
      const pubDate = new Date(date).toUTCString();
      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
      <description>${escapeXml(excerpt)}</description>
      <enclosure url="${SITE_URL}${ogImage}" type="image/jpeg" />
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Healthy You By Ruhma — Journal</title>
    <link>${SITE_URL}/journal</link>
    <atom:link href="${SITE_URL}/journal/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes from Dr. Ruhma's clinic on PCOS, hormonal health, and sustainable weight management.</description>
    <language>en</language>
    <lastBuildDate>${buildDate}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// Static generation at build time; revalidate daily for cheap freshness.
export const revalidate = 86_400;
export const dynamic = "force-static";
```

### 4.16 Modifications to existing files

| File                               | Change                                                                                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/sitemap.ts` (from plan 02)    | After mapping pages, append journal entries: `posts.map(p => ({ url: \`${SITE_URL}/journal/${p.frontmatter.slug}\`, lastModified: p.frontmatter.date }))`.                                          |
| `app/layout.tsx` (from plan 02)    | Add `<link rel="alternate" type="application/rss+xml" title="Journal RSS" href="/journal/feed.xml" />` inside `<head>` so feed readers auto-discover.                                               |
| `next-sitemap.config.js` (if used) | Include `/journal` and exclude `/journal/feed.xml` from the HTML sitemap.                                                                                                                           |
| `tailwind.config.ts`               | Ensure `content` glob covers `content/journal/**/*.mdx` so chip-color classes used inside MDX are not purged.                                                                                       |
| `app/globals.css`                  | Add `.dropcap::first-letter { … }` rule inside `@layer components` (or inside `<Prose>` styles, decided in 08): float left, Epilogue, ~5 lines tall, mauve accent on hover of the wrapping article. |

---

## 5. Step-by-step tasks

Suggested commit cadence — each numbered task is one commit unless noted.

1. **Install dependencies.** Add `reading-time`, `rehype-slug`,
   `rehype-autolink-headings`, `remark-smartypants`. Verify
   `next-mdx-remote@^5` is already present from plan 03; if not, escalate
   (don't add it here — it's part of the global content pipeline, not
   journal-only).
2. **Scaffold the directory tree** — empty files for every component listed
   in §4.5–4.13 plus `lib/journal.ts`. Empty React components export `null`.
   Goal: TypeScript compiles, Next builds, routes 404 with clean errors.
3. **Implement `lib/journal.ts`** with full Zod schema, `reading-time`
   integration, draft handling, slug-vs-filename guard. Add a Vitest unit
   test (`lib/journal.test.ts`) covering: read-time computation rounds
   correctly, drafts hidden in production, slug mismatch throws, missing
   `ogImage` falls back to `coverImage`, `getRelatedPosts` prefers same
   category. **Do not skip this test file** — the loader is the load-bearing
   piece of the section.
4. **Author the two placeholder MDX posts** in `content/journal/`. ~600 words
   each. Use every MDX component (`<DropCap>`, `<Pullquote>`,
   `<Aside>`, `<FigureCaption>`) at least once across the two posts. Source
   cover images from the optimized media library produced in plan 03 — if
   the right shots aren't there yet, use a temporary `bg-[--cream-deep]`
   placeholder rectangle SVG and file a TODO referencing this commit.
5. **Build `<PostCard>` and `<PostGrid>`.** Wire to local Storybook /
   `/_kit/journal` route to eyeball the three sizes against the cycle
   pattern. Confirm the rhythm reads as magazine, not as bricks.
6. **Build `<FeaturedPost>` and `<CategoryChips>`.** Wire chips to a thin
   `<JournalIndexClient>` wrapper so chip clicks filter the grid client-side
   (or skip filtering wiring with the documented note from §4.8).
7. **Build `<EmptyState>`.** Render against `posts = []` and `posts = [one]`
   in `/_kit/journal/empty`. Print to a tablet — empty page must look
   intentional, not abandoned.
8. **Wire `app/journal/page.tsx`** with the `posts.length < 2` branch.
   Delete one of the placeholder MDX files temporarily, build, verify the
   empty state renders. Restore the file.
9. **Build `<PostHero>`, `<PostBody>`, `<AuthorFooter>`,
   `<RelatedPosts>`.** Note: `<PostBody>` depends on `<Prose>` — coordinate
   with the focus-pages plan author (08). If the shared `<Prose>` is not
   landed yet, scaffold a minimum version inside `components/ui/prose.tsx`
   and flag for absorption by 08.
10. **Wire `app/journal/[slug]/page.tsx`** including `generateStaticParams`
    and `generateMetadata`. Confirm static export of both placeholder posts
    via `pnpm build`.
11. **Add `<ArticleJsonLd>`.** Validate output with Google's Rich Results
    Test (paste rendered HTML or run on a Vercel preview).
12. **Build the RSS route** `app/journal/feed.xml/route.ts`. Validate output
    against the W3C feed validator. Confirm `Content-Type` returns
    `application/rss+xml`. Confirm `revalidate` works by checking the
    `.next/server/app/journal/feed.xml.body` artifact post-build.
13. **Sitemap + layout link.** Append journal URLs to `app/sitemap.ts`.
    Add the `<link rel="alternate">` RSS auto-discovery tag in
    `app/layout.tsx`.
14. **Newsletter inline form wiring.** If plan 02's `<NewsletterInlineForm>`
    isn't landed yet, ship a no-op variant (input + button + console.log)
    with a `// TODO: wire to provider in launch phase` comment, so the empty
    state is visually complete.
15. **Accessibility pass.** Tab through `/journal` and a post page —
    keyboard order is "skip-link → nav → post links → footer." Confirm
    `<time dateTime>` is correctly machine-readable. Confirm chip buttons
    announce their pressed state. axe-core via `@axe-core/playwright` in
    CI: zero violations on both routes.
16. **Lighthouse target.** Index ≥ 95 on all four metrics; post page ≥ 95
    on Performance/Accessibility/Best-Practices, ≥ 90 SEO (drops slightly
    because of long URL slugs — acceptable).
17. **Final review commit.** Update `MIGRATION_NOTES.md` with the journal
    decisions: external newsletter provider deferred, pagination deferred,
    chip filtering scope.

---

## 6. Acceptance criteria

A reviewer should be able to tick every box below before merging.

### Functional

- [ ] With **0 real posts** (move both MDX files out of `content/journal/`):
      `/journal` renders `<EmptyState>` with the newsletter form, the
      "send a question" link, and the "Coming soon" right-rail tile. No
      console errors, no missing-image warnings, no 404 within the page.
- [ ] With **1 post**: `/journal` renders the empty-state layout with the
      sole post as the right-rail "sneak peek" teaser card.
- [ ] With **2+ posts**: `/journal` renders `<FeaturedPost>` (most recent),
      `<CategoryChips>` (deduped), and `<PostGrid>` with magazine rhythm.
- [ ] Visiting `/journal/<placeholder-slug>` renders `<PostHero>`,
      `<PostBody>` with article body capped at 680px, drop-cap on the
      first paragraph, working `<Pullquote>` / `<Aside>` /
      `<FigureCaption>` components, the author footer, and the related
      strip (3 cards if available, fewer otherwise).
- [ ] Visiting `/journal/does-not-exist` returns the project's 404 page.
- [ ] `generateStaticParams` produces an entry per non-draft MDX file —
      `pnpm build` reports the correct route count under `/journal/[slug]`.

### Content & data

- [ ] `readTime` is auto-computed when omitted from frontmatter and equals
      `Math.round(words / 220)` (with a minimum of 1).
- [ ] Frontmatter validation throws a build-time error (not a runtime
      crash) if a required field is missing or malformed.
- [ ] A frontmatter `slug` that doesn't match the filename throws at
      build time with a clear message.
- [ ] Drafts (`draft: true`) are hidden from index, RSS, sitemap, and
      `generateStaticParams` in production; visible in dev.

### SEO / metadata

- [ ] Each post page outputs valid JSON-LD `Article` (Google Rich Results
      Test passes).
- [ ] `<title>` uses the format `"<Post title> — Journal"`.
- [ ] `og:image` resolves to `ogImage` (falls back to `coverImage`).
- [ ] `app/journal/feed.xml` returns valid RSS 2.0 (W3C validator passes),
      contains the 20 most recent non-draft posts in date-descending order,
      and serves `Content-Type: application/rss+xml; charset=utf-8`.
- [ ] `<link rel="alternate" type="application/rss+xml">` is present in the
      `<head>` of every page in the section.
- [ ] `app/sitemap.ts` includes one entry per non-draft post.

### Visual / motion

- [ ] The featured post card matches the spec: 16:9 image, Epilogue 56px
      title (clamps down responsively), eyebrow above category, excerpt,
      "Read →" affordance, date + read-time row.
- [ ] The grid alternates sizes per the 7-5 / 5-7 / 4-4-4 rhythm at
      `md:` breakpoint and stacks single-column below.
- [ ] Article body is exactly 680px max-width (verify in DevTools), Inter
      17px, line-height 1.6.
- [ ] `<FadeUp>` reveals are applied to the featured card and each grid
      card; `prefers-reduced-motion` disables them.
- [ ] `<LetterStagger>` runs on the post `<h1>` once on mount and never on
      navigation back.

### Performance / accessibility

- [ ] Lighthouse Mobile on `/journal`: Performance ≥ 95, Accessibility ≥ 95,
      Best Practices ≥ 95, SEO ≥ 95.
- [ ] Lighthouse Mobile on a post page: Performance ≥ 95, Accessibility
      ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- [ ] axe-core: zero violations on both routes.
- [ ] All interactive elements have visible `:focus-visible` rings.
- [ ] The category chip buttons expose `aria-pressed`.
- [ ] Mauve text on cream meets WCAG AA (4.5:1) — verify
      `--mauve` `#895575` on `--cream` `#F4F0EE` measures correctly.
      (If it fails on the smaller "Read →" text, swap to `--mauve-deep`
      `#6E3F5C` for that size only — document in design system.)

---

## 7. Out of scope

Explicitly **not shipped** in this plan, deferred to later milestones:

- **Pagination.** Index returns all non-draft posts (sorted, in one
  request). When post count crosses ~12, add cursor or page-based
  pagination — likely server-side via `searchParams.page`. Until then,
  the cost of rendering 12 cards SSG is negligible.
- **Search.** No site search in this redesign at all (per master plan).
  When added, it would be a separate client-side search across all MDX
  content, not journal-specific.
- **Comments.** Wellness audiences + a personal-practitioner brand do not
  benefit from public comments. If demand surfaces, the path is Disqus or
  a Buttondown-replied newsletter, not a self-hosted comment system.
- **Multiple authors.** Frontmatter has an `author` field that defaults to
  "Dr. Ruhma" — when guest posts arrive, extend `<AuthorFooter>` to
  resolve from a small `content/authors/*.mdx` lookup. Not now.
- **Series / collections.** No `series` or `collection` field on
  frontmatter. Add later if multi-part posts emerge.
- **OG image generation per post.** Each post supplies its own static
  `ogImage` for now. The dynamic `@vercel/og` route from plan 06 may
  later auto-generate journal OG cards from the post title + category;
  out of scope here.
- **Newsletter provider integration.** Empty-state form posts to a
  placeholder action. Wired to Buttondown / Resend Audiences in the
  launch-phase commit (plan 12 or similar).
- **Category landing pages** (`/journal/category/<slug>`). Chips filter
  the index client-side; no separate routes. If we cross ~30 posts and
  Search Console shows category-name queries, revisit.
- **Webmentions, syndication, feed pings.** RSS exists; nothing pushes it
  anywhere automated.
- **i18n.** English only for v1, matching the rest of the site.

---

## 8. Notes for the next agent / reviewer

- The biggest risk in this plan is **divergence from `<Prose>`**. If plan
  08 is being authored in parallel, please coordinate before duplicating
  type-scale styles in journal-only CSS. The drop-cap rule belongs in
  `<Prose>`, not in `<PostBody>`.
- The `<NewsletterInlineForm>` referenced by `<EmptyState>` is the same
  component referenced by the global footer in plan 02. Ensure both teams
  are pointing to the same path: `components/marketing/NewsletterInlineForm.tsx`.
- The placeholder MDX bodies are required for grid/empty-state QA but are
  not final copy. Dr. Ruhma reviews voice and replaces wording before
  launch — flag this in `MIGRATION_NOTES.md`.
- The RSS `<enclosure>` assumes JPEG covers. If the optimized media
  pipeline emits AVIF for covers, switch the `type` to `image/avif` (or
  serve a JPEG fallback path specifically for RSS — feed readers don't
  all do AVIF yet). Decide based on what plan 03 outputs.
