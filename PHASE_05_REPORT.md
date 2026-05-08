# Phase 05 — About Page (`/about`) — Report

## Files created

- `app/about/page.tsx` — server component; consumes `loadAbout()` MDX, emits `Person` JSON-LD, composes the six sections.
- `components/marketing/about/about-hero.tsx` — full-bleed portrait with `<ImageReveal>` and `<LetterStagger>` title.
- `components/marketing/about/mission-statement.tsx` — centered narrow container, Epilogue 56px clamp + italic excerpt.
- `components/marketing/about/bio.tsx` — 12-col editorial layout (body cols 1–7, sticky sidebar cols 9–12).
- `components/marketing/about/philosophy.tsx` — the signature: 4 mauve numerals `01–04`, `clamp(56px, 9vw, 144px)`, `tabular-nums`, `aria-hidden` on numerals, semantic `<ol>/<li>`.
- `components/marketing/about/credentials.tsx` — chip list, exposed for the bio sidebar.
- `components/marketing/about/pull-quote.tsx` — italic Epilogue blockquote with mauve left border; also exposed to MDX.
- `components/marketing/about/about-cta.tsx` — "Ready to start? / Let's talk." CTA band linking to `/programs/consultation`.
- `components/marketing/about/botanical-divider.tsx` — small SVG divider using `public/illustrations/`.

## Files modified

- `app/globals.css` — added `.bio-prose` block with `::first-letter` drop-cap (mauve, Epilogue, ~5.25em) and paragraph rhythm.

## MDX consumption pattern

`loadAbout()` (already in `lib/content/load.ts`, re-exported from `lib/mdx.ts`) returns `{ frontmatter, body, filePath }` with zod-validated frontmatter. The page passes `body` (raw string) to `<MDXRemote source={body} components={…}/>` from `next-mdx-remote/rsc`. The MDX `components` map exposes the editorial primitives (`PullQuote`) plus minimal Tailwind-flavored overrides for `p`, `h2`, `strong`, `em` so prose flows in the bio left column. The drop-cap is delivered via the `.bio-prose` CSS rule (`::first-letter`) on the FadeUp wrapper that hosts the rendered MDX, not via a `<DropCap>` component, since the existing `content/about.mdx` opens with a normal paragraph. The MDX's `## My mission…` H2 lives inside the bio body (the dedicated MissionStatement section above is the page-level signature copy).

## Components built

8 new components under `components/marketing/about/`, plus a small inline `BotanicalDivider`. No new motion primitives; reused `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`. Reused `<Container>`, `<Eyebrow>`, `<Heading>`, `<Button>` primitives.

## Verifications

- `pnpm typecheck` — pass (no output).
- `pnpm lint` — pass (0 errors, 0 warnings).
- `pnpm format:check` — pass (all files match Prettier).
- `pnpm build` — pass; `/about` prerendered as static content; 9/9 pages generated.
- `pnpm start` + `curl http://localhost:3000/about` — HTTP 200; HTML contains "Dr. Ruhma" (3 occurrences), "shine from inside" (3 occurrences), and `>01<`, `>02<`, `>03<`, `>04<` numerals.

## Signature move

Philosophy section: four oversized Epilogue numerals in `text-mauve` (#895575) on `bg-cream-deep` (#E8E1D8), `tabular-nums`, `tracking-[-0.04em]`, `leading-[0.9]`, `aria-hidden` on the numerals so screen readers consume the `<ol>` semantics rather than re-reading "zero one". Each principle is a single declarative sentence in `text-ink` (AAA contrast).

## Deviations from plan

- **Media manifest paths**: the plan referenced `AboutPage-Hero-1.{avif,webp,jpg}` and `portrait-bio.*`. The actual Phase-03 manifest exposes `about/hero` (sizes 400, 750) and `about/portrait-secondary` (400, 800, 1080). The page consumes `/media/about/hero-750.webp` and `/media/about/portrait-secondary-800.webp` directly (matching the manifest's logical entries). No JPG variant exists; OG image references the `.webp`.
- **Person JSON-LD**: reused `personSchema()` from `lib/jsonld.ts` (already wired) instead of inlining a plan-specific `WithContext<Person>` builder. Output is equivalent; no `schema-dts` typing import added since the helper is already typed.
- **Drop-cap**: implemented as CSS-only via `.bio-prose > p:first-of-type::first-letter` on the FadeUp wrapper. No `<DropCap>` MDX component shipped because the bio MDX already opens with "It all began…" and the CSS solution renders cleanly. Easy to upgrade later if MDX authoring needs the explicit component.
- **CTA band**: built a small dedicated `AboutCta` rather than reusing `components/marketing/home/cta-band.tsx` (which hard-codes "Ready when you are."). The plan calls for "Ready to start?" + button to `/programs/consultation`.
- **Press strip**: omitted entirely (no logos in the WP backup) — matches the plan's "likely omit gracefully" note.
- **Botanical dividers**: shipped as a tiny inline component in the about folder (the master `BotanicalDivider` UI primitive isn't yet in `components/ui/`). Two dividers placed: `sprig` between Mission and Bio, `leaf` between Bio and Philosophy.
- **Hero title clamp**: tightened to `clamp(40px, 9vw, 96px)` directly on the `LetterStagger` className so the title is white (`text-cream`) without being overridden by `.type-display`'s `color: var(--color-ink)` rule.
- **`as` prop on `FadeUp`**: used `as="li"` inside the philosophy `<ol>` so the motion wrapper itself is the list item — keeps semantics intact while preserving the FadeUp.
