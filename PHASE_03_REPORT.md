# Phase 03 — Content & Media Migration · Report

Bulk migration of dietitianruhma.com WordPress content into the
`healthy-you-by-ruhma` Next.js repo as MDX, plus an optimised
AVIF/WEBP media tree.

## MDX files created (13)

All under `content/` with type-specific frontmatter validated by
`scripts/check-content.ts`.

| Path                                       | Type    | Description                                                              |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------ |
| `content/about.mdx`                        | about   | Long-form bio paragraphs imported by `app/about/page.tsx` (Phase 04).    |
| `content/programs/diet-planning.mdx`       | program | Diet Planning Program page — what's included, 4 steps, sample week, FAQ. |
| `content/programs/coaching.mdx`            | program | 90-day Coaching Program — 4-step flow, what's included, pricing, FAQ.    |
| `content/programs/consultation.mdx`        | program | 35-min consultation call — 3-step flow, promises, free-ebooks, pricing.  |
| `content/focus/hormonal-health.mdx`        | focus   | Editorial long-form on hormones, where they show up, how to balance.     |
| `content/focus/weight-management.mdx`      | focus   | Loss/gain/maintain framing, the 5 misunderstandings, programs to take.   |
| `content/library/diabetes-essentials.mdx`  | library | Ebook detail · PKR 2,000 · 8-item TOC · 3 sample spreads.                |
| `content/library/pcos-guidebook.mdx`       | library | Ebook detail · PKR 3,000 (sale 1,500) · 8-item TOC · 3 sample spreads.   |
| `content/library/skin-secrets.mdx`         | library | Ebook detail · PKR 3,000 · 8-item TOC · 3 sample spreads.                |
| `content/journal/welcome.mdx`              | journal | Placeholder welcome post (status: draft) for the empty `/journal` state. |
| `content/legal/privacy.mdx`                | legal   | Privacy policy with editorial polish over the WP source.                 |
| `content/legal/terms.mdx`                  | legal   | Terms of service noting external commerce + non-medical-advice clause.   |
| `content/legal/refunds.mdx`                | legal   | Refund policy (30-day window, program 50% guarantee at 40 days).         |

Home, Services, and Contact pages are intentionally NOT under `content/`
— their copy lives directly in `app/<route>/page.tsx` per master §3
(bespoke pages whose section structure is too tied to the components
to live in MDX).

## Supporting code

- `lib/content/types.ts` — zod schemas for all six frontmatter types
  (program, focus, library, journal, legal, about).
- `lib/content/load.ts` — cached MDX loader helpers (`loadProgram`,
  `loadFocus`, `loadLibrary`, `loadJournal`, `loadLegal`, `loadAbout`,
  `listSlugs`, `loadMediaManifest`).
- `lib/mdx.ts` — convenience re-export so pages import from `@/lib/mdx`.
- `lib/content/README.md` — content-editing guide.
- `scripts/migrate-media.ts` — sharp-based AVIF/WEBP pipeline.
- `scripts/media-manifest.ts` — 32-entry hand-curated source manifest.
- `scripts/optimize-wordmark.ts` — svgo wordmark pipeline.
- `scripts/check-content.ts` — frontmatter + image-existence + typo +
  elementor-leakage validator.
- `package.json` — added `media:migrate`, `content:check`,
  `wordmark:optimize` scripts; added `next-mdx-remote@5` dep and
  `sharp`, `gray-matter`, `tsx`, `zod`, `glob` devDeps.
- `eslint.config.mjs` — added `scripts/**/*.ts` override allowing
  `console.log` (these scripts log progress to stdout by design).
- `.gitignore` — added `raw-content/` (WP HTML dump scratchpad).

## Image counts and total weight

```
public/media/        5.5 MB across 192 files
public/wordmark.svg  4.0 KB (1,222 bytes — preserved from Phase 02)
```

32 source images encoded to AVIF + WEBP at the standard widths
(400 / 800 / 1200 / 1600 / 2400 px), each capped to the source's own
width plus the source-width itself (see migrate-media patch below).

By category:

| Category          | Source images | Output files |
| ----------------- | ------------- | ------------ |
| `home/`           | 9             | 36           |
| `about/`          | 3             | 16           |
| `programs/`       | 5             | 22           |
| `focus/`          | 2             | 18           |
| `library/`        | 12            | 94           |
| `journal/`        | 1             | 6            |
| **Total**         | **32**        | **192**      |

Comfortably under master §6's ≤ 35 MB target — at 5.5 MB the new
`public/media/` is roughly 1.7% of the legacy 320 MB uploads tree.
JPEG/PNG are not emitted; AVIF + WEBP cover everything ≥ 2020 browsers.

## Notable migration findings

- **WP page IDs** in the master plan were placeholders. Canonical IDs
  (verified via `wp post list --post_type=page`) recorded in
  `MIGRATION_NOTES.md`.
- **WP source HTML** is Elementor-heavy — every page is wrapped in
  inline `<style>` blocks, `data-elementor-*` attributes, and shortcode
  comments (`<!-- wp:paragraph -->`). Hand-conversion was the only
  viable path, as the master plan §6 acknowledged.
- **Original copy** was kept in voice but rewritten section-by-section
  into the schema described in master §3 — not photocopied. Diet
  Planning's "sample week" was almost empty in the WP source; replaced
  with a worked example so the page has the concrete promise the master
  plan calls for.
- **Image sources** were small for the practitioner photography — the
  hero portrait is 1080×1080 (`coach-1.png`), the about hero is 750×860.
  Patched `migrate-media.ts` to emit the source width as the largest
  size when the standard widths overshoot it (otherwise a 750-px source
  produces only a 400-px output because 800 > 750). MDX references the
  largest size that actually exists per image.
- **Ebook covers** were derived from the WP product `_thumbnail_id`
  postmeta. PCOS used `smartmockups_lwwe107j.jpg`; Skin Secrets used
  `smartmockups_lx5u5k3d.jpg`; Diabetes Essentials used
  `Copy-of-ebook1.png`.
- **Typos fixed** in body and slugs as required: harmone → hormone,
  plannig → planning, conultation → consultation, manue → menu,
  managment → management. `grep -rni` against `content/` returns zero
  hits.
- **Elementor leakage** check passes — `grep -rEn "elementor-|data-elementor|wp-content/uploads"`
  on `content/` returns zero hits.
- **Library `buyUrl`** values are placeholders (`https://example.com/buy/<slug>`)
  pending Dr. Ruhma's choice of external store. Listed in
  `MIGRATION_NOTES.md` Open Questions.
- **YAML date parsing** — gray-matter parses bare ISO dates as JS Date
  objects. Quoted dates (`"2026-05-08"`) keep them as strings, which
  matches the zod schema.

## Verification outputs

```text
$ pnpm exec tsx scripts/check-content.ts
content:check ✓ 13 files, all valid

$ grep -rni "harmone\|manue\|plannig\|conultation" content/
(zero hits)

$ grep -rEn "elementor-|data-elementor|wp-content/uploads" content/
(zero hits)

$ du -sh public/media public/wordmark.svg
5.5M    public/media
4.0K    public/wordmark.svg

$ find public/media -type f | wc -l
192

$ pnpm typecheck && pnpm lint && pnpm format:check && pnpm build
✓ TypeScript clean
✓ ESLint clean (0 warnings, 0 errors)
✓ Prettier clean
✓ Next.js production build succeeded
```

(All four ran via `./node_modules/.bin/<tool>` to bypass corepack
auto-install error around ignored esbuild build scripts; functionally
identical to `pnpm <script>` once `pnpm approve-builds` is run.)

## Deviations from the plan

1. **`zod` is v4, not v3.** The plan called for `^3.23`; pnpm resolved
   the latest at install time (`zod@4.4.3`). Schema syntax is
   compatible — no behaviour difference for our use.
2. **`scripts/check-content.ts` adds an "Elementor leakage" check.**
   The plan's `MIGRATION_NOTES.md` acceptance criterion calls for it
   as a `grep` invocation; folding it into the verifier means every
   `pnpm content:check` run catches regressions in CI.
3. **Wordmark preservation.** Phase 02 already produced
   `public/wordmark.svg` (1,222 bytes — already svgo-optimised). The
   `optimize-wordmark.ts` script idempotently respects the existing
   file unless invoked with `--force`. Per plan §5.8 the duplication
   note acknowledges this case.
4. **`migrate-media.ts` cap fix.** Added a small modification (3
   lines) so that source images smaller than 800 px still produce one
   output file rather than zero — without it, `coach-1.png` (1080) and
   `AboutPage-Hero-1.jpg` (750) were producing only 400-px output,
   which is unusable as a hero.
5. **Manifest JSON output.** The plan didn't require it explicitly,
   but the task spec did — `migrate-media.ts` writes
   `content/media-manifest.json` mapping each `category/slug` to its
   AVIF + WEBP `srcSet` arrays, ready for `next/image`.
6. **`lib/mdx.ts`** is created as a thin convenience re-export over
   `lib/content/load.ts` per the task spec; the `lib/content/`
   subtree per the plan is the canonical layer.
7. **No `raw-content/` queries against `wp_postmeta._elementor_data`.**
   The plan §5.6's pass-A SQL queries weren't necessary in practice —
   filenames + the live local site rendering at http://localhost:8080
   were enough to identify the practitioner photography. Manifest
   construction was hand-curated from the filesystem and the WP product
   `_thumbnail_id` lookups (3 wp-cli calls).
