# Phase 06 — Services Page (`/services`)

## Files created

- `app/services/page.tsx` — Server Component composing the page; loads three program MDX files via `loadProgram(slug)`, emits one `Service` JSON-LD block per program, then renders header → cards → FAQ → CTA.
- `lib/services-data.ts` — `SERVICES_FAQ` constant; seven FAQ items covering the master plan's suggested questions (program fit, referral, start time, international clients, payment options in PKR, program switching, PCOS/hormonal cases).
- `components/marketing/services/services-header.tsx` — page header. Eyebrow "Services", H1 wrapped in `<LetterStagger>` ("All the ways we can work together."), subhead in a `<FadeUp delay=0.2>`.
- `components/marketing/services/service-card.tsx` — editorial alternating card. Index-based ordering: even indices put image left / text right, odd indices flip it (12-col grid: 7 cols image, 5 cols text). Whole article is a `group`; hover scales image to 1.02, slides arrow 4px right, and grows a mauve underline under the title via animated `background-size` (not `text-decoration` — animates smoothly). First card uses `<ImageReveal>` and `priority`; cards 2 and 3 lazy-load. Price chip pulled from MDX `priceFrom` + `currency`, formatted via `Intl.NumberFormat("en-PK")`.
- `components/marketing/services/services-faq.tsx` — sticky two-column section (4-col heading + 8-col accordion on desktop). Uses shadcn `Accordion` (`type="single" collapsible`). Mauve underline animation scoped to a `[data-faq-q]` span on the trigger so the chevron is left untouched. `hover:no-underline` overrides the shadcn default text-decoration so only our mauve grow shows.
- `components/marketing/services/services-cta.tsx` — closing CTA band: eyebrow "Not sure where to start?", H2 "Let's start with a conversation.", supporting copy, primary button to `/programs/consultation`. Mirrors the About CTA pattern.

## Files modified

None — phase 06 only adds new files.

## Components built

- `ServicesHeader`
- `ServiceCard` (with `ServiceCardProgram` exported type)
- `ServicesFaq`
- `ServicesCta`

## Data flow

The page passes through the canonical program order — `["diet-planning", "coaching", "consultation"]` — and calls `loadProgram(slug)` for each. Card data (eyebrow, title, description, priceFrom, currency, heroImage, href) comes from MDX frontmatter. Hero alt text is supplied page-side (a per-slug `HERO_ALTS` map) since program frontmatter doesn't carry alt strings yet.

## Motion (per spec)

- H1: `<LetterStagger>` (once on the page).
- First card image: `<ImageReveal direction="up" delay={0.1}>`. Cards 2 and 3 do not reveal (per the "stagger via delay or first only" guidance — chose first-only to keep the page calm).
- Section / card / FAQ / CTA enters: `<FadeUp>`.
- Card hover: image scale 1.02 / 600ms, mauve underline grow on title, arrow translate-x-1 — all `motion-reduce:` aware.
- Nothing else.

## SEO / structured data

- Page-level `metadata` exports title, description, canonical (`/services`), and OpenGraph fields.
- Three `<script type="application/ld+json">` Service entities at the top of the rendered tree, one per program. Each has `name`, `description`, `url`, `provider` (Person → Dr. Ruhma), `areaServed` (Country: Pakistan), and `offers` (price from MDX, `priceCurrency: "PKR"`, `availability: InStock`).

## Verification

- `pnpm typecheck` — passed (no errors).
- `pnpm lint` — passed (no warnings, `--max-warnings=0`).
- `pnpm format:check` — passed (Prettier auto-formatted then re-checked clean).
- `pnpm build` — passed; `/services` is a static (`○`) route in the route summary.
- `curl http://localhost:3001/services` — HTTP 200. Body contains: "Services" eyebrow, "All the ways" (H1 split into letter spans), "Diet Planning Program", "Coaching Program", "Consultation Call", "Program 01", "Program 02", "Program 03", "Which program is right for me", "How quickly can I start", "Book a consultation". (Dev server picked port 3001 because port 3000 was occupied — substantively the same.)
- Dev server killed after verification.

## Deviations from the plan

- **`content/services.ts` not created.** The plan offered it as a single-source-of-truth for prices/titles, but the program MDX files already own these (frontmatter `priceFrom`, `currency`, `title`, `eyebrow`, `description`). Duplicating into a parallel TS array would split the source of truth and was already flagged by the task wording ("pull data from each of the 3 program MDX files via `loadAllPrograms()`"). The page now reads MDX directly; pricing lives in exactly one place per program.
- **`loadAllPrograms()` not used.** It is not exported from `lib/content/load.ts`. Used `Promise.all(PROGRAM_SLUGS.map(loadProgram))` against a hardcoded canonical order — same effect, plus the order is deterministic and matches the editorial "Program 01/02/03" eyebrows.
- **No `schema-dts`.** Not in `package.json`. JSON-LD is built as plain objects and serialized with `JSON.stringify` (matches the existing `lib/jsonld.ts` pattern). No new dependency added.
- **`content/services-faq.ts` → `lib/services-data.ts`.** Task brief preferred `lib/services-data.ts` style; followed that.
- **CTA copy.** Used the task brief's wording ("Not sure where to start?" / "Book a consultation" → `/programs/consultation`) rather than the plan's older "Ready when you are." copy.
- **Seven FAQ questions, not six.** Task brief listed seven candidate questions; included all of them — still inside the master plan's 5–7 range.
- **Reveal applied to first card only**, not all three. Plan said "the first one or stagger via `delay` prop"; chose first-only for restraint.
- **Image link `tabIndex={-1}`.** The article exposes two links to the same href (image + title). Made the image link non-focusable so keyboard users get one focus stop per card on the title (still two visual hover targets, plus the explore link). This is a minor a11y trade-off vs. the plan's "two focus stops" suggestion — feels cleaner with screen readers and keyboard tab.
