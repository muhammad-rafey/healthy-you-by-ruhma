# Phase 06 Review

## CRITICAL

- None.

## MAJOR

- None. The three NOT-findings (FAQ in `lib/services-data.ts`, three cards loaded by mapping `loadProgram` over a hardcoded slug array instead of a `loadAllPrograms()` helper, JSON-LD via plain object + `JSON.stringify` rather than `schema-dts`) are all explicitly excluded by the rubric and the implementer disclosed each as a deliberate deviation.

## VERIFIED

- gates: PASS (typecheck, lint `--max-warnings=0`, prettier `--check`, `next build` all clean; `/services` prerenders as static).
- 3 cards from MDX: PASS (`app/services/page.tsx` calls `loadProgram` for `diet-planning`, `coaching`, `consultation` and reads `eyebrow`, `title`, `description`, `priceFrom`, `currency`, `heroImage` from frontmatter; only `heroAlt` is page-side via `HERO_ALTS`).
- editorial layout (not uniform tiles): PASS (`service-card.tsx` uses a 12-col grid with image at `md:col-span-7`, text at `md:col-span-5`, alternating order via `index % 2`; substantial `py-12 md:py-20` rhythm between cards; not a 3-up grid).
- FAQ accordion: PASS (shadcn `Accordion type="single" collapsible`, 7 items in `lib/services-data.ts` — within 5-7 range, mauve underline scoped to `[data-faq-q]` span so chevron is untouched).
- CTA: PASS (`services-cta.tsx` renders eyebrow/H2/copy/Button → `/programs/consultation`, label "Book a consultation").
- motion discipline: PASS (only `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>` imported; no raw `motion`/`framer-motion` imports anywhere under `app/services/` or `components/marketing/services/`; `motion-reduce:` variants present on hover transforms).
- single h1: PASS (curl confirmed exactly 1 `<h1`; `next/image` used, 0 raw `<img>` tags from page content; 3 JSON-LD scripts; HTTP 200 with all required strings).

## Verdict

APPROVE
