# Phase 6 — Polish, SEO, and Performance

This is the pre-launch hardening pass. Phases 00–12 produced a feature-complete site; this phase makes it ship-ready: every route has explicit metadata and structured data, branded OG images render, the sitemap and redirects are verified, the bundle hits its perf budget, and a11y is enforced in CI. Nothing here is optional — these are launch gates.

---

## 1. Goal

Ship a site that:

1. **Search engines can fully understand** — every route declares explicit `title`, `description`, OpenGraph, Twitter card, canonical, and (where applicable) JSON-LD structured data. The sitemap enumerates every URL. Every old WP slug 308-redirects to its new home.
2. **Hits the performance budget on real devices** — Lighthouse ≥ 95 on Performance / Accessibility / Best Practices / SEO across all 14 routes; LCP < 2.0 s, CLS < 0.05, INP < 150 ms; no route's First Load JS exceeds 130 KB.
3. **Passes accessibility automation and manual review** — axe-core reports zero violations on every page in CI; full keyboard navigation works; focus rings are visible everywhere; color contrast is ≥ AA; the typographic "moment" word ("nourish") has a screen-reader-readable context.
4. **Has telemetry from day one** — Plausible (custom events for the three conversion moments) plus Vercel Analytics (Web Vitals + page views), wired in the root layout, gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

By the end of this phase, the only remaining work before cutover (Phase 7) is the DNS swap and Search Console submission.

---

## 2. Pre-requisites

All earlier phases must be merged to `main` before this phase begins. Specifically:

- **Phase 00 — Setup**: Next.js 15 scaffold, `pnpm`, ESLint, Prettier, Husky, GitHub repo, Vercel project connected.
- **Phase 01 — Design system**: tokens in `globals.css`, `tailwind.config.ts`, fonts via `next/font` (Inter + Epilogue), motion primitives.
- **Phase 02 — Layout shell**: `app/layout.tsx`, Nav, Footer, redirects in `next.config.js`.
- **Phase 03 — Home**: `/` complete with hero, "moment", pillars, ebook teaser, about teaser, testimonials, journal preview, CTA band.
- **Phase 04 — About**: `/about`.
- **Phase 05 — Services**: `/services`.
- **Phase 06 — Focus pages** (covered before programs intentionally — content drives funnel): `/focus/hormonal-health`, `/focus/weight-management`.
- **Phase 07 — Program pages**: `/programs/diet-planning`, `/programs/coaching`, `/programs/consultation`.
- **Phase 08 — Library index + detail**: `/library`, `/library/[slug]` for the three ebooks, with `buyUrl` external links.
- **Phase 09 — Journal**: `/journal`, `/journal/[slug]`.
- **Phase 10 — Contact**: `/contact` with server-action form + Resend.
- **Phase 11 — Legal**: `/legal/privacy`, `/legal/terms`, `/legal/refunds`.
- **Phase 12 — Media migration + redirects**: every image in `public/media/` is AVIF + WEBP at the five srcset sizes; every redirect from `redesign-plan.md` §6 is in `next.config.js`.

If any of these is incomplete, **stop and finish that phase first** — Phase 6 makes assumptions about route shape, MDX frontmatter, and component naming that earlier phases must establish.

Hard prerequisite checks before starting:

```bash
pnpm typecheck                   # zero errors
pnpm lint                        # zero errors
pnpm build                       # succeeds
test -f next.config.js && grep -c '^\s*source:' next.config.js  # >= 18 redirects present
```

---

## 3. Dependencies

Add in this phase only — do not pull these earlier:

```bash
pnpm add @vercel/og @vercel/analytics schema-dts
pnpm add -D @axe-core/playwright @playwright/test playwright lighthouse @lhci/cli
```

| Package                           | Purpose                                               | Pinning                                  |
| --------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `@vercel/og`                      | Dynamic OG image generation via Edge runtime + Satori | latest stable, no major upgrades pending |
| `@vercel/analytics`               | Web Vitals + pageviews telemetry to Vercel            | latest                                   |
| `schema-dts`                      | TypeScript types for Schema.org JSON-LD               | latest                                   |
| `@axe-core/playwright`            | axe-core integration for Playwright tests             | latest                                   |
| `@playwright/test` + `playwright` | Browser test runner for axe + redirect QA             | matched versions                         |
| `lighthouse` + `@lhci/cli`        | Lighthouse audit CLI + CI helper                      | latest                                   |

After install, run `pnpm playwright install chromium` once to fetch the browser binary (CI uses the matching Docker image instead).

`@vercel/og` requires the **Edge runtime**; the OG route exports `runtime = 'edge'`. The rest of the app stays on Node.

---

## 4. Files to create / modify

```
app/
├── layout.tsx                            (modify — add Plausible + Vercel Analytics scripts)
├── opengraph-image.tsx                   (CREATE — root branded OG image)
├── twitter-image.tsx                     (CREATE — re-exports the OG image)
├── sitemap.ts                            (modify — enumerate every static + MDX-driven route)
├── robots.ts                             (modify — sitemap URL)
├── (each route)/page.tsx                 (modify — explicit `metadata` export)
├── about/opengraph-image.tsx             (CREATE — per-route OG override)
├── services/opengraph-image.tsx          (CREATE)
├── programs/[slug]/opengraph-image.tsx   (CREATE — dynamic, reads MDX frontmatter)
├── focus/[slug]/opengraph-image.tsx      (CREATE — dynamic)
├── library/opengraph-image.tsx           (CREATE)
├── library/[slug]/opengraph-image.tsx    (CREATE — dynamic, ebook cover overlay)
├── journal/opengraph-image.tsx           (CREATE)
├── journal/[slug]/opengraph-image.tsx    (CREATE — dynamic)
├── contact/opengraph-image.tsx           (CREATE)

components/
├── seo/JsonLd.tsx                        (CREATE — <script type="application/ld+json"> wrapper)
├── analytics/Plausible.tsx               (CREATE — Plausible <Script> wrapper)
├── analytics/track.ts                    (CREATE — typed `plausible(event, props)` helper)

lib/
├── seo/jsonLd.ts                         (CREATE — schema builders, see §10)
├── seo/metadata.ts                       (CREATE — per-route metadata builder)
├── seo/og-template.tsx                   (CREATE — shared OG image JSX template)

scripts/
├── check-redirects.ts                    (CREATE — fetches each old slug, asserts 308)
├── perf-budget.ts                        (CREATE — wraps `next build` and parses route bundle sizes)

tests/
├── a11y.spec.ts                          (CREATE — axe-core smoke test on every route)
├── redirects.spec.ts                     (CREATE — Playwright version of redirect QA, runs in CI)
├── og-images.spec.ts                     (CREATE — fetches each opengraph-image.tsx output, asserts 200 + correct content-type + dimensions)

playwright.config.ts                      (CREATE — single config for axe + redirect tests)
lighthouserc.json                         (CREATE — Lighthouse CI config with 95+ thresholds)
.github/workflows/quality.yml             (CREATE — typecheck + lint + axe + lighthouse + redirect QA)
```

Modifications to existing files are kept narrow: per-page `page.tsx` only gains a `metadata` export and a `<JsonLd>` invocation in the body; layout gains two `<Script>` tags.

---

## 5. Step-by-step tasks

Work this phase in the exact order below — each task assumes its predecessors are complete. Skipping ahead leaks stale data into later steps.

### 5.1 Metadata pass (~3–4 hours)

Goal: every route exports an explicit, hand-written `metadata` object. No defaults. No "lorem". No copy-paste of titles.

1. **Create `lib/seo/metadata.ts`** — exports a `buildMetadata(input)` helper that returns a `Metadata` object with sensible defaults for OG / Twitter / canonical and merges per-route overrides. The helper centralizes:
   - `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dietitianruhma.com')`
   - `openGraph.siteName: 'Healthy You By Ruhma'`
   - `openGraph.locale: 'en_US'` with `alternateLocale: ['en_PK']`
   - `twitter.card: 'summary_large_image'`
   - `twitter.creator: '@dietitianruhma'` (placeholder — confirm handle with Dr. Ruhma; if no Twitter, drop it)
   - `robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } }`
   - `formatDetection: { telephone: false, email: false, address: false }`
2. **Walk every route** and add an `export const metadata: Metadata = buildMetadata({...})` block. For dynamic routes (`/programs/[slug]`, `/focus/[slug]`, `/library/[slug]`, `/journal/[slug]`, `/legal/[slug]`), implement `generateMetadata({ params })` that pulls `title` / `description` / `ogImage` from the MDX frontmatter via the same MDX loader used by the page body — do not duplicate the read.
3. **Use the table in §9 below as the source of truth** for static-route copy. Paste the table into `metadata.ts` as a `STATIC_META` const if you want one place to edit; the helper looks it up by route key.
4. **Canonical URLs** — every route sets `alternates.canonical` to its absolute URL. For paginated journal indexes (future), the helper accepts a `?page=` and either drops the page param or sets `rel="prev/next"` — for v1 we have a single index page so this is a no-op.
5. **Verification** — write a one-off Node script (or extend `scripts/perf-budget.ts`) that hits each route locally via `pnpm dev`, reads `<head>`, and asserts `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, `<meta property="og:type">`, `<meta property="og:locale">`, `<meta property="twitter:card">`, `<link rel="canonical">` are all present and non-empty. Check this in as `tests/metadata.spec.ts` (Playwright).

Acceptance for 5.1: every entry in the §9 table renders all required tags; the metadata test passes.

### 5.2 JSON-LD structured data (~2–3 hours)

Goal: emit valid Schema.org JSON-LD for every page type that benefits from it. Validate with Google's Rich Results Test before merging.

1. **Create `lib/seo/jsonLd.ts`** — see the full source in §10. It exports one builder per page type and a single `<JsonLd graph={...}>` React component that serializes to a `<script type="application/ld+json">` (escape `<` → `<` to avoid XSS and HTML-parser confusion).
2. **Wire into each route's `page.tsx`**: import the builder, call it with the right inputs, render `<JsonLd graph={result} />` near the top of the JSX (rendering inside `<head>` is not allowed in App Router server components — top of the page body is fine; Google parses `<body>`-level JSON-LD).
3. **Emission map** (matches the brief):
   - `/` → `WebSite` + `Person` (Dr. Ruhma) + `Organization` (Healthy You By Ruhma) as a `@graph`.
   - `/about` → `Person` with full `jobTitle`, `address` (Lahore, PK), `sameAs` list of social profiles.
   - `/services` → an array of three `Service` items, each with `provider: Person`, `areaServed: 'PK'`, `offers` with the `price` (PKR) from MDX frontmatter.
   - `/programs/[slug]` → single `Service` with the same shape, plus `serviceType` and `description`.
   - `/focus/[slug]` → `Article` with `author: Person`, `datePublished` from frontmatter (or repo file mtime fallback), `headline`, `image`.
   - `/library` → `ItemList` of `Book` references.
   - `/library/[slug]` → `Book` with `author: Person`, `bookFormat: 'EBook'`, `numberOfPages` from frontmatter, `offers: { url: buyUrl, price, priceCurrency: 'PKR', availability: 'https://schema.org/InStock' }`.
   - `/journal` → `Blog` with `blogPost` array.
   - `/journal/[slug]` → `Article` with `author`, `datePublished`, `dateModified`, `image`.
   - `/contact` → `ContactPage`.
   - `/legal/*` → none (no rich-result benefit, omit deliberately).
4. **Validation** — paste each route's rendered JSON into [validator.schema.org](https://validator.schema.org) and fix any "missing required" warnings. Then paste into Google Rich Results Test for the routes that produce rich results (Article, Book, Service). Snapshot the JSON in `tests/__snapshots__/jsonLd.snap` so any future drift is reviewed.

Acceptance for 5.2: all schemas validate; Rich Results Test reports no errors; snapshot test passes.

### 5.3 Dynamic OG image generation (~3–4 hours)

Goal: every shared link gets a branded 1200×630 image. One template, dynamic content per route.

1. **Build `lib/seo/og-template.tsx`** — a JSX component rendered by `@vercel/og`'s `ImageResponse`. The visual spec:
   - **Canvas**: 1200×630, background `#F4F0EE` (cream).
   - **Padding**: 80px on all sides.
   - **Eyebrow** (top-left, 24px Inter 500, color `#895575` mauve, letter-spacing 0.16em, uppercase): the route's eyebrow string (e.g., `GUIDEBOOK 02`, `FOCUS AREA`, `PROGRAM 01`).
   - **Title** (left-aligned, starts ~140px from top, max 880px wide): Epilogue 84px, weight 500, color `#1A1A1A`, line-height 1.05, letter-spacing -0.03em. Wraps to 2–3 lines max — Satori auto-wraps.
   - **Subtitle** (below title, 28px Inter 400, color `#3E3E3E`, line-height 1.4, max 720px wide): the route's `description` truncated to ~140 chars.
   - **Wordmark** (bottom-left, 32px Epilogue 600, color `#1A1A1A`): the literal text "Healthy You By Ruhma".
   - **Botanical accent** (bottom-right, 200×200): a single inline SVG (fennel sprig, the same one used as a section anchor on `/about`). Color `#895575` mauve at 60% opacity.
   - **Optional cover image** (only for `/library/[slug]`): a 320×440 ebook cover mockup pinned to the right side, vertically centered, with a subtle 12px shadow (`box-shadow: 0 12px 40px rgba(0,0,0,0.12)`). When present, the title's max-width drops to 640px to leave room.
2. **Create `app/opengraph-image.tsx`** — the root fallback. Imports the template, fills it with site-wide defaults (eyebrow `HEALTHY YOU BY RUHMA`, title "Nourishing you inside out for healthy you throughout.", subtitle from `lib/site.ts`).
3. **Per-route OG files** — for static routes, hard-code the eyebrow / title / subtitle in the `opengraph-image.tsx` next to the route's `page.tsx`. For dynamic routes, read MDX frontmatter inside the `opengraph-image.tsx` (it's an Edge route handler — load via `fs.promises` is fine in Edge as of Next 15 if MDX is in `content/`, but easier: import the loader you're already using in `page.tsx` and reuse it).
4. **Font loading for Satori** — `@vercel/og` doesn't read `next/font`. You must `fetch()` the font binaries (Inter and Epilogue) and pass them to `ImageResponse`'s `fonts` array. Host the woff2 files at `public/fonts/og/` (one weight each: Inter 500, Epilogue 500, Epilogue 600). Cache the loaded buffers at module scope so cold-start cost is paid once.
5. **`twitter-image.tsx`** at the root just re-exports `opengraph-image.tsx` — Next 15 handles the rest.
6. **Verification** — visit `/opengraph-image` in dev, save the PNG, eyeball it. Then `tests/og-images.spec.ts` fetches each route's OG URL and asserts 200, content-type `image/png`, and minimum byte count (>40 KB) so a "blank canvas regression" fails the build.

Acceptance for 5.3: every route resolves to a unique, branded 1200×630 PNG; share-debug tools (Twitter Card Validator, Facebook Sharing Debugger, LinkedIn Post Inspector) pull the right image.

### 5.4 Sitemap finalization (~30 min)

Goal: `app/sitemap.ts` enumerates every URL the site responds to.

1. **Static URLs** — hard-coded in an array: `/`, `/about`, `/services`, `/library`, `/journal`, `/contact`, `/legal/privacy`, `/legal/terms`, `/legal/refunds`.
2. **Dynamic URLs** — read the `content/programs/`, `content/focus/`, `content/library/`, `content/journal/`, `content/legal/` directories at build time, glob `*.mdx`, and emit one entry per file. Each entry sets `lastModified` to the file's mtime (or to the frontmatter `updatedAt` if present), `changeFrequency` (`'monthly'` for evergreen content, `'weekly'` for journal, `'yearly'` for legal), and `priority` (`1.0` for `/`, `0.8` for top-level marketing pages, `0.7` for program/focus, `0.6` for library, `0.5` for journal, `0.3` for legal).
3. **`app/robots.ts`** — `Allow: /`, `Disallow: /api/`, `Sitemap: ${SITE_URL}/sitemap.xml`. No `crawl-delay`. Keep it terse.
4. **Verification** — `curl localhost:3000/sitemap.xml` after `pnpm build && pnpm start`; count `<url>` elements; assert exactly **18** for v1 (9 static + 3 programs + 2 focus + 3 library + 1 journal placeholder, or whatever the real journal count is at launch). Check this count in CI as part of `tests/og-images.spec.ts` or a new `tests/sitemap.spec.ts`.

Acceptance for 5.4: every page has a sitemap entry; no 404 URL is in the sitemap; Google Search Console accepts it on submission.

### 5.5 Redirect QA (~1 hour)

Goal: every old WP slug 308s to its new home, exactly once, with no redirect chain.

1. **Create `scripts/check-redirects.ts`** — see §11. Reads a hard-coded list of `[oldPath, expectedNewPath]` tuples (the 18 redirects from `redesign-plan.md` §6), fetches each against `BASE_URL` (default `http://localhost:3000`, override via env), follows zero redirects (`redirect: 'manual'`), asserts `status === 308` and `headers.get('location')` matches the expected new path.
2. **Add `pnpm check:redirects`** to `package.json` scripts: `tsx scripts/check-redirects.ts`.
3. **Promote to CI** — `tests/redirects.spec.ts` runs the same logic against the Vercel preview URL on every PR. Failing redirect = failing CI.
4. **Edge cases**:
   - `/about-me/` (with trailing slash) must also redirect — Next 15's `trailingSlash: false` default handles this, but verify.
   - `/shop/diabetes-essentials?ref=foo` (with query string) must preserve the query: Next preserves it by default for `permanent: true` redirects.
   - `/cart`, `/checkout`, `/my-account` redirect to `/library` (cart no longer exists). Confirm.

Acceptance for 5.5: `pnpm check:redirects` exits 0 against local dev and against the Vercel preview.

### 5.6 Performance audit (~3–4 hours)

Goal: meet the budget on every route. This is the longest task in the phase — expect to fix at least one offender.

1. **Image audit** — `rg "<img\s" app/ components/` should return zero results. Every image is `next/image`. Then walk every `<Image>` usage and verify:
   - `sizes` is set explicitly. Hero images use `sizes="100vw"`. Cards use `sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"`. Get this right — wrong `sizes` is the #1 cause of mobile LCP misses.
   - `priority` is set **only** on the LCP image of each page (typically the hero). Verify by checking the per-route LCP map below.
   - `placeholder="blur"` with a generated `blurDataURL` for hero photographs (Phase 12 should have handled this; if any are missing, fix here).
   - `alt` is meaningful, not "image" / "photo" / filename.
2. **LCP element map** (expected per route — used to validate `priority` placement):
   | Route | Expected LCP element |
   |---|---|
   | `/` | Hero portrait (`/media/coach-1.avif`) |
   | `/about` | Hero portrait (`/media/AboutPage-Hero-1.avif`) |
   | `/services` | First service card image |
   | `/programs/diet-planning` | Hero lifestyle shot |
   | `/programs/coaching` | Hero lifestyle shot |
   | `/programs/consultation` | Hero lifestyle shot (or H1 if image is tiny) |
   | `/focus/hormonal-health` | The Display H1 (text-driven hero, no image) |
   | `/focus/weight-management` | The Display H1 |
   | `/library` | First ebook cover |
   | `/library/[slug]` | Ebook cover |
   | `/journal` | Featured post image |
   | `/journal/[slug]` | Hero image (if present) or H1 |
   | `/contact` | H1 ("Let's talk") |
   | `/legal/*` | H1 |
3. **Font audit**:
   - Confirm only Inter and Epilogue load. `rg "next/font" app/ lib/` should show one Inter import and one Epilogue import, no others.
   - Both use `display: 'swap'`. Inter has `preload: true`; Epilogue has `preload: false` (it's used only for headings, lazy-loading is fine, prevents FOIT competition with body).
   - `subsets: ['latin']` only — no Cyrillic / Greek / Vietnamese.
   - Drop **La Belle Aurore** entirely if any earlier phase accidentally pulled it in.
4. **Script audit** — only Plausible and Vercel Analytics in the root layout. No GTM, no Hotjar, no Intercom, no LinkedIn Insight, nothing. Both load with `strategy="afterInteractive"`.
5. **Bundle audit**:
   - Run `pnpm build` and read the per-route First Load JS table.
   - Hard ceiling: **130 KB** for any single route. Soft target: 110 KB.
   - If a route exceeds: open `analyze` (`pnpm dlx @next/bundle-analyzer`), find the offender. Common culprits:
     - A client component pulling in Motion when it could be a server component using CSS animations.
     - A whole icon library imported for one icon — switch to inline SVGs.
     - A markdown-rendering library client-side when it should be server-rendered.
   - Make `'use client'` boundaries as narrow as possible. The pattern: server component renders the page, client components only for the bits that need state (Nav scroll-condense, FAQ accordion, Contact form, motion wrappers).
6. **Lighthouse run** — `pnpm dlx lhci autorun` against the Vercel preview. `lighthouserc.json` config:
   ```json
   {
     "ci": {
       "collect": { "numberOfRuns": 3, "settings": { "preset": "desktop" } },
       "assert": {
         "assertions": {
           "categories:performance": ["error", { "minScore": 0.95 }],
           "categories:accessibility": ["error", { "minScore": 0.95 }],
           "categories:best-practices": ["error", { "minScore": 0.95 }],
           "categories:seo": ["error", { "minScore": 0.95 }],
           "largest-contentful-paint": ["error", { "maxNumericValue": 2000 }],
           "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }],
           "total-blocking-time": ["error", { "maxNumericValue": 150 }]
         }
       }
     }
   }
   ```
   Run on every URL listed in `urls` (all 14 routes + a representative dynamic route from each `[slug]` namespace). Mobile preset run too — same thresholds, with a note that mobile LCP often needs targeted hero compression or `priority` adjustment.

Acceptance for 5.6: Lighthouse CI green on every route, mobile and desktop; no route's First Load JS > 130 KB; `bundle-analyzer` shows no surprise dependencies.

### 5.7 Accessibility audit (~2–3 hours)

Goal: zero axe violations in CI; manual keyboard nav passes; `prefers-reduced-motion` respected.

1. **axe-core in CI** — `tests/a11y.spec.ts` (Playwright):

   ```ts
   import { test, expect } from "@playwright/test";
   import AxeBuilder from "@axe-core/playwright";

   const ROUTES = [
     "/",
     "/about",
     "/services",
     "/programs/diet-planning",
     "/programs/coaching",
     "/programs/consultation",
     "/focus/hormonal-health",
     "/focus/weight-management",
     "/library",
     "/library/pcos-guidebook",
     "/library/diabetes-essentials",
     "/library/skin-secrets",
     "/journal",
     "/contact",
     "/legal/privacy",
     "/legal/terms",
     "/legal/refunds",
   ];

   for (const route of ROUTES) {
     test(`a11y: ${route}`, async ({ page }) => {
       await page.goto(route);
       const results = await new AxeBuilder({ page })
         .withTags(["wcag2a", "wcag2aa", "wcag21aa", "best-practice"])
         .analyze();
       expect(results.violations).toEqual([]);
     });
   }
   ```

   Failing = failing CI.

2. **Manual keyboard pass** — for each route, tab from page top, verify:
   - Tab order matches visual order.
   - Focus ring is visible on every interactive element. Default `outline: 2px solid var(--mauve); outline-offset: 2px;` set in `globals.css` `:focus-visible`. No `outline: none` anywhere except where replaced by an equivalent.
   - Skip-link in the layout shell jumps to `#main` and is the first tab stop.
   - The Nav's CTA pill ("Book a consultation") is reachable.
   - The Contact form submits via Enter from any field.
   - The FAQ accordion opens via Enter and Space.
   - The library detail's external "Buy on [Platform]" link opens in a new tab; `rel="noopener noreferrer"` is set.
3. **Color contrast** — verify mauve-on-cream. `#895575` on `#F4F0EE` measures **4.43:1** in our spot-check, which is **below 4.5:1 AA for normal body text** (it passes for large text and UI components). Resolution:
   - **Body text**: do not use `--mauve` (`#895575`). Use `--ink-soft` (`#3E3E3E`) on cream — that's 9.5:1, way clear of AA.
   - **Links inline in body**: use `--mauve-deep` (`#6E3F5C`) which measures **6.1:1** on cream — passes AA easily.
   - **Eyebrows, small accent labels, decorative chips**: `--mauve` is fine (it's UI / graphical, not body text), but underline links in body must use `--mauve-deep`.
   - Document this rule in `app/globals.css` as a comment block above the token definitions, and in the design system kit page (`/_kit`).
4. **Screen reader** — VoiceOver (Mac) or Orca (Linux):
   - Every link / button has a discernible name. The "Read more →" links in the pillars grid include the pillar name in their accessible name (`<a aria-label="Read more about Hormonal Health">Read more →</a>` or use `<span class="sr-only">about Hormonal Health</span>`).
   - The "moment" word ("nourish") on `/`: the `<h2>` is `<h2><span aria-hidden="true">nourish</span><span class="sr-only">We nourish you inside out — read more about our approach</span></h2>`. Same pattern for any other oversized typographic moment introduced later.
   - Decorative botanical SVGs have `aria-hidden="true"` and no alt text.
   - Form fields have visible labels (not placeholders-as-labels). Error messages are `aria-live="polite"`.
5. **Reduced motion** — `globals.css` has a global guard:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
   Plus the three motion components (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`) read `useReducedMotion()` from Motion and short-circuit to a non-animated render. Verify by toggling the OS preference and reloading every page.
6. **Heading hierarchy** — `axe-core` catches most of this, but eyeball each route's outline. Exactly one `<h1>` per page. No skipped levels.
7. **Language tag** — `<html lang="en">` in `app/layout.tsx`.

Acceptance for 5.7: axe CI green; manual keyboard pass on every route; mauve body-text contrast issue resolved as above; screen reader reads "nourish" with context.

### 5.8 Analytics setup (~1 hour)

Goal: Plausible + Vercel Analytics live with the three custom events wired.

1. **Plausible** — env var `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (e.g., `dietitianruhma.com`). In `app/layout.tsx`:
   ```tsx
   {
     process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
       <Script
         src="https://plausible.io/js/script.outbound-links.js"
         data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
         strategy="afterInteractive"
       />
     );
   }
   ```
   The `script.outbound-links.js` variant auto-tracks outbound link clicks — that gets us Library buy-clicks for free. We also fire explicit named events for the three conversion moments (more reliable than relying on link text):
   - `Library / Buy / <slug>` — fired on `<a href={buyUrl}>` click in `app/library/[slug]/page.tsx`.
   - `Programs / Book / <slug>` — fired on the "Book your slot" CTA in each program page.
   - `Contact / Submit` — fired on successful contact form submission (server action returns `{ ok: true }`, client fires the event).
2. **`components/analytics/track.ts`** — typed wrapper:
   ```ts
   type EventName =
     | `Library / Buy / ${string}`
     | `Programs / Book / ${string}`
     | "Contact / Submit";
   export function track(name: EventName, props?: Record<string, string | number>) {
     if (typeof window === "undefined") return;
     (window as unknown as { plausible?: (e: string, o?: { props?: object }) => void }).plausible?.(
       name,
       props ? { props } : undefined,
     );
   }
   ```
3. **Vercel Analytics** — in `app/layout.tsx`:
   ```tsx
   import { Analytics } from "@vercel/analytics/next";
   // ...
   <Analytics />;
   ```
   Vercel Web Vitals reports LCP / CLS / INP automatically — no extra config. Confirms in production whether the Lighthouse-lab numbers translate to field data.
4. **Verification** — open the deployed preview, click an external Buy link, submit the contact form (with a test address), check Plausible's "Goals" view for the events. Vercel dashboard's Analytics tab shows the pageview within ~1 minute.

Acceptance for 5.8: Plausible receives the three named events plus pageviews; Vercel Web Vitals dashboard shows real data.

### 5.9 Error tracking (deferred — note only)

Sentry is **not** wired in this phase. Vercel Logs + the Plausible/Vercel Analytics combination cover v1 needs. Add Sentry post-launch if:

- Real users hit JS errors that aren't caught by `error.tsx` boundaries.
- The contact form's server action starts failing intermittently.
- We add any meaningful client-side state (we mostly haven't).

When that day comes: `pnpm add @sentry/nextjs`, run the wizard, add `NEXT_PUBLIC_SENTRY_DSN` to Vercel, scope source maps to release. ~1 hour of work. Not now.

---

## 6. Acceptance criteria

This phase is done when **every one** of these is true. Do not declare "done" with any of them yellow.

- [ ] **Lighthouse ≥ 95** on Performance / Accessibility / Best Practices / SEO across all 14 routes (mobile + desktop) via `lhci autorun`. Three runs each, median taken. CI gate enforces.
- [ ] **LCP < 2.0 s, CLS < 0.05, INP < 150 ms** on mobile preset for every route per Lighthouse.
- [ ] **First Load JS ≤ 130 KB** for every route in `pnpm build` output.
- [ ] **axe-core: zero violations** on every route in `tests/a11y.spec.ts`.
- [ ] **18/18 redirects** return `308` with the correct `location` header (`pnpm check:redirects` exits 0).
- [ ] **Every route** has a `metadata` export covering `title`, `description`, `openGraph` (with `title`, `description`, `image`, `url`, `type`, `locale: en_US`, `alternateLocale: en_PK`), `twitter`, and `alternates.canonical`.
- [ ] **Every route** has a unique 1200×630 OG image at `/<route>/opengraph-image` returning HTTP 200 with `content-type: image/png`.
- [ ] **JSON-LD validates** on each route per the §5.2 emission map (Schema.org validator + Google Rich Results Test).
- [ ] **Sitemap** has exactly the expected count of URLs and is reachable at `/sitemap.xml`.
- [ ] **`robots.txt`** is reachable, allows all, lists the sitemap URL.
- [ ] **Plausible** is loaded only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set; the three custom events fire correctly in a manual smoke test.
- [ ] **Vercel Analytics** is live; the dashboard shows real pageviews after a manual visit.
- [ ] **Manual keyboard pass** complete on every route (focus rings visible, tab order correct, skip-link works).
- [ ] **Reduced motion** verified by toggling OS preference and reloading every animated page.
- [ ] **Mauve-on-cream contrast** rule documented in `globals.css` and applied: body links use `--mauve-deep`, accents use `--mauve`.
- [ ] **The "moment" word** ("nourish") on `/` has a screen-reader-only context string.
- [ ] **No `<img>` tags** outside `next/image` (`rg "<img\s" app/ components/` returns nothing).
- [ ] **Fonts**: only Inter + Epilogue load, both via `next/font`, Inter preloaded.
- [ ] **Scripts**: only Plausible + Vercel Analytics in production HTML.

---

## 7. Out of scope

These are **not** in Phase 6. Do not pull them in.

- **Sentry / Datadog / any deep monitoring stack** — covered by Vercel Logs for v1; revisit post-launch if real bugs surface.
- **A/B testing infrastructure** — no Vercel Edge Config experiments, no Optimizely, no Statsig. The site has one variant.
- **Multi-language i18n** — `en_PK` is declared as an OG alternate for cultural accuracy, but there is no second language route tree. Urdu translation would be Phase 9+ if ever.
- **Service worker / offline support** — not a value-add for a marketing site; cuts Lighthouse PWA category we're not chasing.
- **Schema.org `Review` / `AggregateRating`** — we have no verifiable review system in v1; faking it triggers Google policy warnings. Add when there's a real review pipeline (Trustpilot embed or similar).
- **Newsletter analytics events** — newsletter is itself deferred (per redesign-plan §7); no events to wire.
- **Cookie consent banner** — Plausible is cookieless; Vercel Analytics is cookieless; we have no GA / Meta Pixel / etc. Therefore no banner is required under GDPR / Pakistan's PDPB. If a future addition needs cookies, that's the time to add a banner, not now.
- **Search Console submission, GA4 setup, Bing Webmaster Tools** — operational, not implementation. Done in Phase 7 cutover.
- **Performance experiments beyond the budget** — we hit the budget and stop. Optimizing past 95 → 100 yields diminishing returns and risks bundle-fragility. Future iterations only if the budget is missed in production.

---

## 8. Risks and mitigations

| Risk                                                                                              | Likelihood | Mitigation                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@vercel/og` Edge runtime can't read MDX from `content/`                                          | Medium     | If `fs` is constrained at edge, pre-generate a JSON manifest of frontmatter at build time (`scripts/build-og-manifest.ts`) and import that JSON in the OG route handler. Adds 10 min, fully sidesteps the issue.                                                                           |
| Lighthouse mobile LCP misses on a slow real-3G profile                                            | High       | The hero image budget is the lever. If LCP > 2.0 s, drop hero AVIF quality from 80 → 72 (visually imperceptible at retina sizes) and re-test. If still missing, switch hero from `next/image` to a `<picture>` with hand-tuned `srcSet` and pre-rendered `Link rel="preload"` in `<head>`. |
| One of the 18 redirects has a typo and goes to a 404                                              | Medium     | `tests/redirects.spec.ts` runs in CI on the preview URL; a typo fails the build. Manually run `pnpm check:redirects` against the preview before approving the merge to main.                                                                                                               |
| axe-core flags a violation we can't fix without redesign (e.g., a Radix primitive's default ARIA) | Low        | Radix is well-tested; rare. If it happens, narrow the rule scope (`new AxeBuilder({ page }).disableRules(['<rule-id>'])`) **with a code comment explaining why** — never blanket-disable.                                                                                                  |
| Mauve-on-cream contrast fails on a panel we missed                                                | Medium     | The §5.7.3 rule is "body text uses ink-soft, links use mauve-deep, mauve is for accents only." A grep at audit time (`rg "text-mauve\b" app/ components/` to find pure mauve uses) catches stragglers.                                                                                     |
| Bundle bloat from a transitively-imported library (e.g., date-fns full bundle)                    | Medium     | `bundle-analyzer` makes this visible in 30 seconds. Common fix: switch to `date-fns/format` named import or `dayjs` (2 KB).                                                                                                                                                                |

---

## 9. Per-route metadata table (source of truth)

This is the canonical copy for `lib/seo/metadata.ts`. Every static route's `title` and `description` is hand-written for that route — no template-filling.

Route key uses absolute path. `Title` is the **document title** (what shows in the browser tab and search results); the OG title is identical unless noted. `Description` is 145–160 chars (Google's mobile snippet ceiling).

| #   | Route                          | Title                                                        | Description                                                                                                                                        | Eyebrow (OG)                      | OG image                    |
| --- | ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------- |
| 1   | `/`                            | Healthy You By Ruhma — Clinical Dietitian in Lahore          | Evidence-based diet planning, hormonal health and weight management programs from Dr. Ruhma. Nourishing you inside out for healthy you throughout. | HEALTHY YOU BY RUHMA              | `/opengraph-image`          |
| 2   | `/about`                       | About Dr. Ruhma — Clinical Dietitian, Lahore                 | Dr. Ruhma is a clinical dietitian in Lahore specializing in PCOS, hormonal health, and sustainable weight management. Read her story and approach. | DR. RUHMA                         | `/about/opengraph-image`    |
| 3   | `/services`                    | Services — Programs and Consultations with Dr. Ruhma         | Three ways to work together: a 1:1 consultation call, a structured diet planning program, and an 8-week coaching program.                          | SERVICES                          | `/services/opengraph-image` |
| 4   | `/programs/diet-planning`      | Diet Planning Program — Personalized Meal Plans by Dr. Ruhma | A custom 4-week diet plan built around your goals, lifestyle, and health markers. Sample week included. Pakistan-wide, fully remote.               | PROGRAM 01                        | dynamic                     |
| 5   | `/programs/coaching`           | 8-Week Coaching Program — Sustainable Change with Dr. Ruhma  | Eight weeks of structured support: weekly check-ins, plan adjustments, and the accountability needed to make changes that actually stick.          | PROGRAM 02                        | dynamic                     |
| 6   | `/programs/consultation`       | 1:1 Consultation Call — Book a Session with Dr. Ruhma        | A focused 45-minute video call to assess your situation and map out next steps. Honest, evidence-based, no upsell.                                 | PROGRAM 03                        | dynamic                     |
| 7   | `/focus/hormonal-health`       | Hormonal Health — PCOS, Thyroid, and Cortisol, Explained     | Where hormones meet daily life: a longread on PCOS, thyroid, and cortisol — what's actually happening, and what helps.                             | FOCUS AREA                        | dynamic                     |
| 8   | `/focus/weight-management`     | Weight Management — A Calm, Evidence-Based Approach          | Sustainable weight management without crash diets or shame. The mechanisms, the missteps, and the markers that matter.                             | FOCUS AREA                        | dynamic                     |
| 9   | `/library`                     | The Library — Three Guidebooks by Dr. Ruhma                  | Practical, evidence-based guidebooks for women managing PCOS, diabetes, and skin health. Digital PDF, instant delivery.                            | THE LIBRARY                       | `/library/opengraph-image`  |
| 10  | `/library/diabetes-essentials` | Diabetes Essentials — Guidebook by Dr. Ruhma                 | A practical guidebook for living well with diabetes: meals, monitoring, and the markers that matter. PKR pricing, instant PDF.                     | GUIDEBOOK 01                      | dynamic (cover)             |
| 11  | `/library/pcos-guidebook`      | PCOS Guidebook — Hormonal Health Reference by Dr. Ruhma      | The hormonal cascade in plain language, plus the diet and lifestyle changes that make a real difference for PCOS.                                  | GUIDEBOOK 02                      | dynamic (cover)             |
| 12  | `/library/skin-secrets`        | Skin Secrets — A Nutrition Guide for Healthy Skin            | What you eat shows up on your skin. A nutrition-first guide to clear, calm skin from a clinical dietitian.                                         | GUIDEBOOK 03                      | dynamic (cover)             |
| 13  | `/journal`                     | Journal — Notes on Nutrition, Hormones, and Honest Wellness  | Long-form notes on nutrition, hormonal health, and the everyday science of feeling well. New entries arriving regularly.                           | JOURNAL                           | `/journal/opengraph-image`  |
| 14  | `/journal/[slug]`              | (frontmatter title) — Healthy You By Ruhma                   | (frontmatter description)                                                                                                                          | (frontmatter category, uppercase) | dynamic                     |
| 15  | `/contact`                     | Contact — Reach Dr. Ruhma's Practice                         | Email, WhatsApp, and a direct contact form. Most messages are answered within one working day.                                                     | CONTACT                           | `/contact/opengraph-image`  |
| 16  | `/legal/privacy`               | Privacy Policy — Healthy You By Ruhma                        | How we collect, use, and protect personal information for visitors and clients of Healthy You By Ruhma.                                            | LEGAL                             | `/opengraph-image` (root)   |
| 17  | `/legal/terms`                 | Terms — Healthy You By Ruhma                                 | Terms governing the use of healthyyoubyruhma.com and the programs and guidebooks offered through it.                                               | LEGAL                             | `/opengraph-image` (root)   |
| 18  | `/legal/refunds`               | Refund Policy — Healthy You By Ruhma                         | Refund and cancellation terms for programs, consultations, and guidebooks purchased through Healthy You By Ruhma.                                  | LEGAL                             | `/opengraph-image` (root)   |

Counts: **18 entries**, of which **14 are top-level routes** and 4 are dynamic-namespace examples (the three programs already counted, three library, two focus, three legal — yielding the actual sitemap count separately). The legal pages all use the root OG by design — they're not share-targets.

Frontmatter contract for dynamic routes (programs / focus / library / journal):

```yaml
title: PCOS Guidebook
description: The hormonal cascade in plain language, plus the diet and lifestyle changes that make a real difference for PCOS.
eyebrow: Guidebook 02 # uppercased on OG
ogTitle: # optional, defaults to title
ogDescription: # optional, defaults to description
publishedAt: 2025-08-12 # journal + focus only
updatedAt: 2025-09-01 # all
```

The `metadata.ts` builder reads these fields when present and falls back gracefully when absent.

---

## 10. The `lib/seo/jsonLd.ts` helper (full source)

This is the canonical implementation. Drop it in verbatim; tweak the constants block (`SITE`, `PERSON`, `ORG`) to match what `lib/site.ts` exposes.

```ts
import type {
  Article,
  Blog,
  Book,
  ContactPage,
  ItemList,
  Organization,
  Person,
  Service,
  WebSite,
  WithContext,
  Graph,
} from "schema-dts";

// --- Site-wide constants (kept in this file so the schema is auditable in one place) ---

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dietitianruhma.com";

const PERSON_ID = `${SITE_URL}/#person`;
const ORG_ID = `${SITE_URL}/#org`;
const SITE_ID = `${SITE_URL}/#website`;

const PERSON: Person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Dr. Ruhma",
  jobTitle: "Clinical Dietitian",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/media/coach-1.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  worksFor: { "@id": ORG_ID },
  sameAs: [
    "https://instagram.com/dietitianruhma",
    "https://wa.me/923000000000", // confirm with Dr. Ruhma
    // Add Twitter/LinkedIn/Facebook only if real, verified profiles exist.
  ],
};

const ORG: Organization = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Healthy You By Ruhma",
  url: SITE_URL,
  logo: `${SITE_URL}/media/wordmark.png`,
  founder: { "@id": PERSON_ID },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lahore",
    addressCountry: "PK",
  },
  sameAs: PERSON.sameAs,
};

const WEBSITE: WebSite = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: "Healthy You By Ruhma",
  publisher: { "@id": ORG_ID },
  inLanguage: ["en-US", "en-PK"],
};

// --- Builders ---

export function homeGraph(): WithContext<Graph> {
  return {
    "@context": "https://schema.org",
    "@graph": [WEBSITE, PERSON, ORG],
  };
}

export function aboutGraph(): WithContext<Person> {
  return {
    "@context": "https://schema.org",
    ...PERSON,
    description:
      "Clinical dietitian based in Lahore, Pakistan, specializing in PCOS, hormonal health, and evidence-based weight management.",
    url: `${SITE_URL}/about`,
    mainEntityOfPage: `${SITE_URL}/about`,
  };
}

export function servicesGraph(
  services: { name: string; slug: string; description: string; price?: number }[],
): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((s, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: serviceSchema(s),
    })),
  };
}

export function programGraph(input: {
  name: string;
  slug: string;
  description: string;
  price: number;
  serviceType?: string;
}): WithContext<Service> {
  return { "@context": "https://schema.org", ...serviceSchema(input) };
}

function serviceSchema(input: {
  name: string;
  slug: string;
  description: string;
  price?: number;
  serviceType?: string;
}): Service {
  return {
    "@type": "Service",
    name: input.name,
    description: input.description,
    serviceType: input.serviceType ?? "Dietitian Service",
    url: `${SITE_URL}/programs/${input.slug}`,
    provider: { "@id": PERSON_ID },
    areaServed: { "@type": "Country", name: "PK" },
    ...(input.price && {
      offers: {
        "@type": "Offer",
        price: String(input.price),
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/programs/${input.slug}`,
      },
    }),
  };
}

export function focusArticleGraph(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    mainEntityOfPage: `${SITE_URL}/focus/${input.slug}`,
    image: input.image ?? `${SITE_URL}/focus/${input.slug}/opengraph-image`,
  };
}

export function bookGraph(input: {
  title: string;
  description: string;
  slug: string;
  cover: string;
  buyUrl: string;
  price: number;
  salePrice?: number;
  numberOfPages?: number;
}): WithContext<Book> {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: input.title,
    description: input.description,
    bookFormat: "https://schema.org/EBook",
    author: { "@id": PERSON_ID },
    image: input.cover.startsWith("http") ? input.cover : `${SITE_URL}${input.cover}`,
    url: `${SITE_URL}/library/${input.slug}`,
    ...(input.numberOfPages && { numberOfPages: input.numberOfPages }),
    offers: {
      "@type": "Offer",
      price: String(input.salePrice ?? input.price),
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: input.buyUrl,
    },
  };
}

export function libraryListGraph(books: { title: string; slug: string }[]): WithContext<ItemList> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: books.map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/library/${b.slug}`,
      name: b.title,
    })),
  };
}

export function journalGraph(
  posts: { title: string; slug: string; publishedAt: string }[],
): WithContext<Blog> {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Journal — Healthy You By Ruhma",
    url: `${SITE_URL}/journal`,
    publisher: { "@id": ORG_ID },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/journal/${p.slug}`,
      datePublished: p.publishedAt,
      author: { "@id": PERSON_ID },
    })),
  };
}

export function journalPostGraph(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt ?? input.publishedAt,
    mainEntityOfPage: `${SITE_URL}/journal/${input.slug}`,
    image: input.image ?? `${SITE_URL}/journal/${input.slug}/opengraph-image`,
  };
}

export function contactGraph(): WithContext<ContactPage> {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: `${SITE_URL}/contact`,
    name: "Contact — Healthy You By Ruhma",
    about: { "@id": ORG_ID },
  };
}
```

And the React component (`components/seo/JsonLd.tsx`):

```tsx
import "server-only";

interface Props {
  graph: object;
}

export function JsonLd({ graph }: Props) {
  // Escape `<` to prevent any chance of breaking out of the script tag.
  const json = JSON.stringify(graph).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- intentional: serializing schema graph
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
```

Usage in a route:

```tsx
// app/library/[slug]/page.tsx
import { JsonLd } from "@/components/seo/JsonLd";
import { bookGraph } from "@/lib/seo/jsonLd";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await loadBook(slug);
  return (
    <>
      <JsonLd graph={bookGraph({ ...book })} />
      {/* ...rest of page */}
    </>
  );
}
```

---

## 11. The `scripts/check-redirects.ts` source

Self-contained, no dependencies beyond `node:` builtins — runs under `tsx`.

```ts
#!/usr/bin/env tsx
/**
 * Verifies every legacy WP slug returns 308 to the expected new path.
 * Run: pnpm check:redirects
 * Override base: BASE_URL=https://preview.vercel.app pnpm check:redirects
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const REDIRECTS: ReadonlyArray<readonly [string, string]> = [
  ["/about-me", "/about"],
  ["/contact-me", "/contact"],
  ["/diet-plannig-program", "/programs/diet-planning"],
  ["/coaching-program", "/programs/coaching"],
  ["/conultation-call", "/programs/consultation"],
  ["/hormonal-health", "/focus/hormonal-health"],
  ["/weight-management", "/focus/weight-management"],
  ["/shop", "/library"],
  ["/shop/diabetes-essentials", "/library/diabetes-essentials"],
  ["/shop/pcos-guidebook", "/library/pcos-guidebook"],
  ["/shop/skin-secrets", "/library/skin-secrets"],
  ["/cart", "/library"],
  ["/checkout", "/library"],
  ["/my-account", "/library"],
  ["/refund_returns", "/legal/refunds"],
  ["/privacy-policy", "/legal/privacy"],
  ["/terms-and-conditions", "/legal/terms"],
  // Trailing-slash sanity check — Next 15 with trailingSlash:false strips it
  ["/about-me/", "/about"],
];

interface Result {
  oldPath: string;
  expected: string;
  status: number;
  actualLocation: string | null;
  ok: boolean;
}

async function check(oldPath: string, expected: string): Promise<Result> {
  const res = await fetch(`${BASE}${oldPath}`, { redirect: "manual" });
  const actualLocation = res.headers.get("location");
  // Normalize: redirect target may be absolute or relative.
  const normalized =
    actualLocation && actualLocation.startsWith("http")
      ? new URL(actualLocation).pathname
      : actualLocation;
  const ok = res.status === 308 && normalized === expected;
  return { oldPath, expected, status: res.status, actualLocation: normalized, ok };
}

async function main() {
  const results = await Promise.all(REDIRECTS.map(([from, to]) => check(from, to)));
  const failed = results.filter((r) => !r.ok);

  for (const r of results) {
    const mark = r.ok ? "OK " : "FAIL";
    console.log(
      `${mark}  ${r.oldPath.padEnd(28)} -> ${r.actualLocation ?? "(none)"}   [${r.status}]`,
    );
  }
  console.log("");
  console.log(`Passed ${results.length - failed.length} / ${results.length}`);

  if (failed.length > 0) {
    console.error("\nFailures:");
    for (const f of failed) {
      console.error(
        `  ${f.oldPath} -> expected 308 ${f.expected}, got ${f.status} ${f.actualLocation ?? "(none)"}`,
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## 12. Phase exit checklist

When the box-tick list in §6 is fully green, do the following before declaring done:

1. **Tag a release** — `git tag -a v0.6.0 -m "Phase 6 — polish, SEO, perf complete"` and push tags. Vercel preserves the deployment so we can roll back.
2. **Update `MIGRATION_NOTES.md`** with any deliberate omissions surfaced this phase (e.g., Twitter handle deferred, philately).
3. **Open a PR titled "Phase 6 — Polish, SEO, Performance"** with a body that includes:
   - Lighthouse score table per route (mobile + desktop).
   - Per-route First Load JS table.
   - axe results summary (should read "0 violations across 17 routes").
   - Redirect QA output (should read "Passed 18/18").
   - One screenshot per OG image (drag-drop into the PR body).
4. **Self-review** the PR using `superpowers:requesting-code-review` (the skill expects you to provide the diff and a focused review prompt; let it find what you missed).
5. **Merge to `main`** when CI is green and the self-review surfaces no blockers.

After merge, Phase 7 (cutover) is the only remaining work: DNS swap, Search Console submission, retire the local WP stack. That's a separate, smaller plan.
