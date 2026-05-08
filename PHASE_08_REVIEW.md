# Phase 08 Review — Focus Pages

## CRITICAL

None.

## MAJOR

None.

## VERIFIED

- Gates green: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm build` all pass. Build prerenders both routes as SSG: `/focus/hormonal-health` and `/focus/weight-management`.
- `pnpm start` (port 3010): both routes return HTTP 200. Each contains "Focus area", "Where this shows up", and "Book a consultation". Hormonal page exposes "PCOS Guidebook" + "Coaching"; weight page exposes "Diet Planning" + "Diabetes Essentials".
- `app/focus/[slug]/page.tsx` composes hero → article body (FocusProse + MDXRemote) → ConditionsList → RelatedCards → FocusCtaBand. Article JSON-LD emitted.
- `components/marketing/focus/pull-quote.tsx` exists and is wired in the MDX components map both as `Pullquote` and as the `blockquote` override.
- `.focus-prose-body` scope in `app/globals.css`: `max-width: 720px` ≤md; `column-count: 2` + `column-fill: balance` at lg+; `break-inside: avoid` on block elements; drop-cap via `.has-dropcap > p:first-of-type::first-letter` (4.6em, 3.6em ≤sm).
- Botanical SVGs embedded in MDX: `<Botanical name="fennel" />` and `mint` in hormonal-health; `seed` and `leaf` in weight-management.
- Related cards link real `/programs/*` and `/library/*` slugs resolved via existing program/library MDX frontmatter.
- Motion only via design-system `<FadeUp>` and `<LetterStagger>`; no raw `framer-motion`/`motion` imports in focus components or route. No raw hex colors; tokens used throughout.
- One `<h1>` per rendered page (FocusHero only).

## Verdict

PASS.
