# Phase 07 — Programs (Report)

Three program detail pages shipped under one dynamic route, sharing a template
with a per-slug signature section.

## Files

**Created**

- `app/programs/[slug]/page.tsx` — single dynamic route, prerenders the three
  known slugs (`dynamicParams = false`), unknown slugs 404. Per-page metadata,
  per-page `Service` JSON-LD with PKR `offers`.
- `lib/programs-data.ts` — per-slug FAQs (5–6 each), testimonials (2 each),
  the 7-day sample week, the 8-week coaching timeline, the consultation
  "What to expect" + "How to prepare" steps, and the booking placeholder copy.
- `components/marketing/programs/program-hero.tsx` — split hero, `LetterStagger`
  H1 (96px Epilogue), `ImageReveal` portrait, price + primary CTA.
- `components/marketing/programs/whats-included.tsx` — 6-tile grid (Diet
  Planning + Coaching only), botanical SVG per tile from `public/illustrations`.
- `components/marketing/programs/how-it-works.tsx` — desktop 4-col / mobile
  scroll-snap rail; `n` numerals in mauve Epilogue.
- `components/marketing/programs/sample-week.tsx` — Diet Planning signature.
  7 day-cards in horizontal `snap-x snap-mandatory` rail; `<dl>` per card
  for breakfast/lunch/dinner; mauve hairline rule under the day header.
- `components/marketing/programs/coaching-timeline.tsx` — Coaching signature.
  Vertical 8-week timeline with one continuous mauve connector line; milestone
  weeks (1, 4, 8) get a heavier ring-`cream` dot and italic title.
- `components/marketing/programs/booking-placeholder.tsx` — Consultation
  signature. Cream paper card, "Soon" pill, headline _"Booking widget — wired
  to Calendly when configured."_, fallback `Send a message instead → /contact`.
- `components/marketing/programs/consultation-rails.tsx` — 3-step "What to
  expect" + 3-step "How to prepare" two-column rails (replaces the 6-tile
  grid on the consultation page).
- `components/marketing/programs/program-testimonials.tsx` — 2 long-form
  pull-quotes (skipped on consultation page).
- `components/marketing/programs/pricing-card.tsx` — anchored `#pricing`
  card; large numeral, hairline-mauve bullet list, primary CTA.
- `components/marketing/programs/program-faq.tsx` — shadcn `Accordion`,
  4–6 questions per program, mauve underline-grow on hover.
- `components/marketing/programs/program-cta-band.tsx` — ink band, mauve CTA.

**Modified** — none. `app/sitemap.ts` already lists all three URLs, redirects
already in `next.config.ts`.

## Signature content

- **Sample week** (Diet Planning) — Mon–Sun, three meals each (oats with
  chia almonds; chicken karahi; daal chawal; whole-fish curry; Saturday is
  a flex day with a single line; Sunday a reset bowl).
- **Coaching timeline** — Week 01 Intake (milestone) → Week 04 Mid-program
  review (milestone) → Week 08 Transition plan (milestone). Six interim
  weeks with single-line outcomes ("first signs", "real-life testing", etc.).
- **Booking placeholder** — Cream-paper card with "Soon" pill, headline copy
  per the brief, and a fallback CTA to `/contact?topic=consultation`.

## Verification

- `pnpm typecheck` — pass.
- `pnpm lint` — pass (max-warnings=0).
- `pnpm format:check` — pass.
- `pnpm build` — pass; output shows `● /programs/[slug]` with three
  prerendered children: `/programs/diet-planning`, `/programs/coaching`,
  `/programs/consultation`.
- `curl http://localhost:3737/programs/{slug}` — all 200, content checks
  pass: diet-planning carries "Diet Planning", "Sample week", "What's
  included", "How it works"; coaching carries "Coaching", "8 weeks",
  "eight-week", "Week 01"…"Week 08"; consultation carries "Consultation",
  "Booking", "Calendly", "Schedule".

## Deviations

- The existing `loadProgram` schema (`lib/content/types.ts`) was kept as-is.
  Per-signature data (sampleWeek / timeline / booking config) lives in
  `lib/programs-data.ts` instead of MDX frontmatter — the in-tree schema only
  models `whatsIncluded` and `steps`, so extending frontmatter would have
  required schema churn outside this phase's scope.
- No `@calcom/embed-react` dependency added; per the brief, the Consultation
  page renders a clean placeholder with a fallback CTA instead of a real
  Cal.com / Calendly embed.
