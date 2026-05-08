# Phase 13 — Polish, SEO, Perf, A11y

## OG image routes added

- `app/opengraph-image.tsx` (root, Static — Node runtime)
- `app/twitter-image.tsx` (root, mirrors OG)
- `app/programs/[slug]/opengraph-image.tsx` (Dynamic per slug, MDX-driven)
- `app/library/[slug]/opengraph-image.tsx` (Dynamic per slug)
- `app/focus/[slug]/opengraph-image.tsx` (Dynamic per slug)
- `app/journal/[slug]/opengraph-image.tsx` (Dynamic per slug)
- Shared template: `lib/og.tsx` — cream `#F4F0EE`, ink `#1A1A1A`, mauve accent line `#895575`, eyebrow + title + subtitle + wordmark. Uses `@vercel/og` (`next/og`); relies on the bundled default font (Geist) for offline build reliability — Epilogue is documented as a manual upgrade path if a downloaded woff2 is added under `public/fonts/og/`.

`@vercel/og` was added to dependencies. Per-page metadata for the static routes already points at `/<route>/opengraph-image` automatically because Next 16 wires the file-routed image into `metadata.openGraph.images`.

## JSON-LD audit (per route)

| Route | Schemas |
| --- | --- |
| `/` | `WebSite` + `Organization` + `Person` (added `Organization` this phase). No `SearchAction` — site has no search. |
| `/about` | `Person` |
| `/services` | `Service` × 3 |
| `/programs/[slug]` | `Service` + `BreadcrumbList` (added) |
| `/focus/[slug]` | `Article` + `BreadcrumbList` (added) |
| `/library` | none (index) |
| `/library/[slug]` | `Product` + `Offer` + `BreadcrumbList` (added) |
| `/journal` | none (index) |
| `/journal/[slug]` | `BlogPosting` + `BreadcrumbList` (added) |
| `/contact` | `ContactPage` |
| `/legal/*` | none (deliberate — plan §3.13) |

`lib/jsonld.ts` extended with `organizationSchema()` and a `breadcrumbSchema(crumbs)` helper that prepends Home automatically.

## A11y observations

- Skip-link to `#main` already in `app/layout.tsx`; landmarks present (`<main id="main">`, `<nav>`, `<footer>`).
- `:focus-visible` outline already defined globally in `app/globals.css` (`2px solid var(--color-mauve)`).
- `prefers-reduced-motion` already honored in CSS plus motion components.
- `<html lang="en">` set; one `<h1>` per route.
- Mauve-on-cream contrast: body text uses `--ink-soft` (9.5:1), inline links use `--mauve-deep` (6.1:1). `--mauve` reserved for eyebrows / decorative.
- Decorative botanical SVGs use `alt=""`. Wordmark image has alt = site name.
- No raw `<img>` tags in `app/` or `components/` — every image is `next/image`.
- LCP candidates marked `priority` on home, about, programs, library detail, services first card, journal featured.

No automated `pa11y` / `axe` / Lighthouse run was performed in this pass — environment isolated, no headless Chrome installed. Documented as manual-pass requirement below.

## Perf observations

- Build is clean: 14 user-facing pages all `○ Static` or `● SSG`. Only `/api/newsletter` and the four dynamic OG image routes are `ƒ Dynamic` (intentional — image generation).
- Root `/opengraph-image` and `/twitter-image` are `○ Static` (prerendered once).
- All `<Image>` usages reviewed: `sizes` set on every `fill` image; small fixed-dimension images (botanicals, wordmark, divider sprigs) use width/height.
- Fonts: only Inter + Epilogue via `next/font`, both `display: swap`. Epilogue is variable-weight (one binary). No third font.
- No GTM / Hotjar / GA / FB Pixel scripts.

## Smoke tests (server up)

- `curl -sI /opengraph-image` → 200 `image/png`
- `curl -sI /twitter-image` → 200 `image/png`
- `curl -sI /library/pcos-guidebook/opengraph-image` → 200 `image/png`
- `curl -sI /programs/coaching/opengraph-image` → 200 `image/png`
- `curl -s /sitemap.xml | grep -c '<url>'` → **18** (matches expected)
- `curl -s / | grep -c 'application/ld+json'` → **2**
- `curl -sI /nonexistent-route` → 404
- `pnpm typecheck && pnpm lint && pnpm format:check && pnpm build` — all green.

## Manual verification still required

- Headless Lighthouse run on a deployed preview (Performance / A11y / Best Practices / SEO ≥95 targets).
- `pa11y` / `axe-core` automated sweep on home/about/contact (skipped — no headless Chrome in env).
- Visual eyeball of generated OG PNGs in Twitter / LinkedIn / Facebook share validators.
- Real-device LCP / CLS / INP via Vercel Web Vitals once deployed.

## Deviations

- OG template uses the `@vercel/og`-bundled default font instead of fetching woff2 binaries for Inter / Epilogue. Visual is on-brand (correct colors, layout, wordmark) but the title typeface is Geist rather than Epilogue. Documented in `lib/og.tsx`; can be upgraded by dropping woff2s into `public/fonts/og/` and passing them into `ImageResponse({ fonts: [...] })`.
- No analytics (Plausible / Vercel Analytics) wired — out of scope per "skip external services" constraint.
- No automated a11y / Lighthouse CI added (`@lhci/cli`, `@axe-core/playwright`) — the env can't host headless Chrome and the user's "skip external services + no commits" framing puts CI infra out of scope for this pass.
- `metadataBase` already correct from Phase 02 (`new URL(site.url)` where `site.url` resolves env / fallback).
- Canonical URLs already present on every route's `metadata` / `generateMetadata` from earlier phases — verified, no edits needed.
- 404 / error / loading / per-segment route boundaries already in place from Phase 02; reviewed and judged ship-ready (mauve eyebrow + ink H1 + return-home CTA pattern).
