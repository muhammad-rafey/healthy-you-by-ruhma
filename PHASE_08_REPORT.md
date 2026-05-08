# Phase 08 Report — Focus Pages (Hormonal Health, Weight Management)

## Files added

- `app/focus/[slug]/page.tsx` — single dynamic route. `dynamicParams = false`, `generateStaticParams` returns the two slugs from `lib/focus-data.ts`, `generateMetadata` reads MDX frontmatter. Emits `Article` JSON-LD. Composes hero → article body → conditions → related → CTA.
- `lib/focus-data.ts` — `FOCUS_SLUGS`, `FOCUS_CONDITIONS` (PCOS/Thyroid/Cortisol for hormonal-health; Metabolic flexibility/Insulin sensitivity/Satiety for weight-management), `FOCUS_RELATED` refs resolved by `loadRelatedCards()` against the existing `loadProgram` / `loadLibrary` MDX, `FOCUS_SUBHEAD` (kept in code because the existing `FocusFrontmatter` zod schema has no `subhead` field — phase did not change schemas).
- `components/marketing/focus/focus-hero.tsx` — type-only cream hero, `<LetterStagger>` H1, eyebrow + subhead. No image.
- `components/marketing/focus/focus-prose.tsx` — magazine-longread wrapper. Single column ≤md (max 720 px), 2 balanced columns at lg+, opt-in drop-cap.
- `components/marketing/focus/pull-quote.tsx` — Epilogue italic mauve pull-quote with sprig flourish + optional attribution; used both as the MDX `<Pullquote>` component and as the `blockquote` override.
- `components/marketing/focus/botanical.tsx` — inline `<Botanical name="…" />` MDX component, ≤80 px cap, decorative.
- `components/marketing/focus/conditions-list.tsx` — "Where this shows up" — three numbered items, cream-deep panel.
- `components/marketing/focus/related-cards.tsx` — "Where to go next." — two cards driven by frontmatter pulled from the linked program/library MDX.
- `components/marketing/focus/focus-cta-band.tsx` — soft funnel "Want a tailored plan? / Book a consultation" → `/programs/consultation`.
- `app/globals.css` — adds `.focus-prose-body` scope: 2-col at lg+ via CSS columns + `column-fill: balance`, `break-inside: avoid` on h2/h3/h4/blockquote/figure/lists/hr/pullquote/botanical, justified prose with hyphens at lg+, decimal-leading-zero ordered list markers, em-dash unordered markers, drop-cap on first paragraph (Epilogue 4.6em, 3.6em ≤sm).

## MDX additions

Added `<Botanical />` (×2) and `<Pullquote>` (×1) to each focus MDX so the editorial illustrations and pull-quote treatment actually render. Frontmatter untouched.

## MDX components map (rsc)

`Pullquote → FocusPullQuote`, `Botanical → Botanical`, `blockquote → FocusPullQuote`, `a → next/link` for internal hrefs (external opens in new tab), and pass-through `h2/h3/h4/p` (typography handled by the `.focus-prose-body` CSS scope).

## Motion

H1 `<LetterStagger>`; section fade-up via `<FadeUp>` on the prose, conditions list, related grid, and CTA band; nothing else. No image reveals.

## Verification

`pnpm typecheck && pnpm lint && pnpm format:check && pnpm build` — all green. Build prerenders both `/focus/hormonal-health` and `/focus/weight-management` as SSG. `curl` against `pnpm start` (port 3010): both routes 200, both contain "Focus area", "Where this shows up", "Book a consultation"; hormonal-health contains PCOS Guidebook + Coaching Program cards; weight-management contains Diet Planning + Diabetes Essentials cards. Unknown slug → 404. Server killed.

## Deviations

Subheads live in `lib/focus-data.ts` not frontmatter (schema unchanged this phase). Plan 08's longer rewritten MDX bodies were **not** swapped in — kept the existing in-repo MDX (untouched by phase 03) per task constraint "Body is long-form editorial." Used the existing in-repo botanical SVG set (`fennel/mint/citrus/leaf/seed/sprig/root/pestle`) rather than `fenugreek/anise/carrot` referenced in the plan but not present.
