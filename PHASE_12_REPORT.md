# Phase 12 — Legal Pages

Implements `/legal/privacy`, `/legal/terms`, `/legal/refunds` per master §3.13 as a single dynamic route backed by the existing MDX corpus.

## Files

Created:

- `app/legal/[slug]/page.tsx` — single dynamic route. `generateStaticParams` returns the 3 slugs; `dynamicParams = false` so unknown slugs 404 at build. `generateMetadata` reads `title` + `description` from frontmatter, sets canonical, `og:type=article`, twitter `summary`. Pages are indexable (no `noindex`) per plan §1. No JSON-LD.
- `components/marketing/legal/legal-page.tsx` — typographic shell. Eyebrow ("Legal"), H1 (Epilogue, `clamp(32px,5vw,56px)`), last-updated caption with semantic `<time datetime="…">` formatted en-GB ("8 May 2026"), `<Prose>` body (max-width 720px), and a "contact us" link to `/contact`. Header lines + body fade up via `<FadeUp>`; nothing else animates.

Reused, not modified:

- `components/ui/prose.tsx` — `.prose-editorial` already provides Inter 17/1.65, h2/h3 in Epilogue, mauve underlined links, list markers in mauve, max-width 68ch (~720px). The plan asked for a `<Prose>` reuse with no duplicate body styling — done.
- `lib/content/load.ts::loadLegal` — already validates `LegalFrontmatter` (`title`, `slug ∈ {privacy,terms,refunds}`, `lastUpdated` ISO, `description`) via zod.
- `app/sitemap.ts` — already lists the 3 routes (priority 0.2, yearly).

## MDX consumption

Body rendered with `MDXRemote` (RSC). Components map only overrides `<a>` to swap to `next/link` for internal hrefs and harden external ones (`target=_blank rel=noopener`); all body typography (h2/h3/p/ul/ol/strong/blockquote) flows through `.prose-editorial`. No legal-specific MDX components introduced.

## Verification

- `pnpm typecheck` — clean.
- `pnpm lint` — clean.
- `pnpm format:check` — clean (one Prettier pass on the route file).
- `pnpm build` — green; build output marks `/legal/[slug]` as `●  (SSG)` with all 3 children prerendered.
- `pnpm start` + curl: `/legal/privacy`, `/legal/terms`, `/legal/refunds` → 200 with frontmatter title in `<title>`, single h1, "contact us" link, and a `<time datetime>` element. `/legal/foo` → 404. Server killed.

## Deviations

- Step 5.4 (lawyer-review TODO in `MIGRATION_NOTES.md`) skipped — out-of-band per plan ("non-blocking for build").
- The shared layout title template (`%s · ${site.name}`) plus our local `${title} · ${site.name}` produces a doubled suffix; this matches the established pattern in focus/journal/library routes from earlier phases and was not changed in scope here.
