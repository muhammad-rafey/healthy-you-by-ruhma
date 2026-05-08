# Phase 10 — Journal · Report

## Files added

- `lib/journal-data.ts` — `loadAllJournal`, `loadJournalCategories`, `loadRelatedJournal`, `formatCategory`, `formatPostDate`. Drafts hidden in production via `status === "published"` filter; visible in dev. Module-level deduping handled by the cached `loadJournal` from `lib/content/load.ts`.
- `app/journal/page.tsx` — index. Hero · FeaturedPost · CategoryChips · PostGrid · EmptyState. Routes through `loadAllJournal()`; renders the empty-state on zero posts.
- `app/journal/[slug]/page.tsx` — post route. `generateStaticParams` from visible MDX, `generateMetadata` from frontmatter (canonical, OG `type=article`, publishedTime, tags), JSON-LD `BlogPosting` (headline, datePublished, dateModified, author Person, publisher Organization, image, articleSection, mainEntityOfPage). `dynamicParams = false`.
- `components/marketing/journal/`: `journal-hero`, `featured-post`, `post-card` (3 sizes), `post-grid` (placeholder fallback up to 3 cards, capped at 5), `category-chips` (visual links — chips deferred to client filter, see deviation), `empty-state` (newsletter + sneak peek), `post-hero` (LetterStagger title), `author-footer`, `related-posts` (placeholder fallback to 3), `pull-quote`.

## Modifications

- `app/sitemap.ts` — was sync + read `content/journal/` directly via `fs`. Now `async`, calls `loadAllJournal()` so drafts are excluded and `lastModified` reads from frontmatter `updatedAt ?? publishedAt`.
- `content/journal/welcome.mdx` — `status: draft` → `status: published` so the post renders in production builds.

## Schema additions

None. The existing `JournalFrontmatter` already covered the contract: `category`, `publishedAt`, `readingTime`, `description` (used as excerpt), `heroImage` (used as cover). Mapped names in components rather than renaming the schema (would have broken `scripts/check-content.ts`).

## Motion

LetterStagger on both H1s (index hero + post hero); ImageReveal on featured cover; FadeUp on grid cards, related strip, body, secondary blocks. No new motion primitives.

## Verification

- `pnpm typecheck` — clean.
- `pnpm lint` — 0 warnings.
- `pnpm format:check` — clean (post-`format`).
- `pnpm build` — green; prerenders `/journal` and `/journal/welcome` (SSG).
- `curl /journal` → 200 with welcome title, "Read", category chips (Hormones/Nutrition/Recipes/Lifestyle), "Coming soon" placeholders, "sign up for updates".
- `curl /journal/welcome` → 200 with body, "Dr. Ruhma" footer, "More entries" related strip, BlogPosting JSON-LD.
- `curl /journal/does-not-exist` → 404.

## Deviations

- Plan §4.8 client-side chip filtering deferred — chips render as `?category=` anchors only (documented in `category-chips.tsx`). Will revisit when catalogue ≥ 5 posts.
- RSS / autolink-headings / smartypants packages not added — phase scope said "skip if plan doesn't call for it", and master §3.11 doesn't list RSS for journal v1.
- Newsletter form posts to existing `/api/newsletter` placeholder (same as Footer); real provider wiring in Phase 12.
