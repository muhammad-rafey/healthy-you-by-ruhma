# Phase 04 Report — Home Page

## Status: complete. All gates green.

---

## Files created

- `app/page.tsx` — replaced the chassis stub. Server component composing the eight home sections, exporting metadata and emitting the JSON-LD `<script>` for `WebSite` + `Person`. Loads the welcome journal post from MDX and slots it ahead of two placeholder cards.
- `lib/home-data.ts` — `Pillar`, `Testimonial`, `JournalCard` types plus the three pillars (Hormonal Health → `/focus/hormonal-health`, Weight Management → `/focus/weight-management`, Diet Planning → `/programs/diet-planning`), three audience-voice testimonials (S. Ahmed, M. Khan, N. Rauf — flagged with TODO for confirmation), and two journal placeholders.
- `lib/jsonld.ts` — `websiteSchema()` and `personSchema()` builders. Pulls `site.name`, `site.url`, `site.contact.instagramUrl` from `content/site.ts`.
- `components/marketing/home/hero.tsx` — split layout with eyebrow, H1 (`<LetterStagger>`), subhead, two CTAs.
- `components/marketing/home/hero-portrait.tsx` — client island wrapping `<Image priority fetchPriority="high">` in `<ImageReveal>`.
- `components/marketing/home/moment-band.tsx` — the signature "nourish" band, `<LetterStagger>` on mount, three-line italic manifesto.
- `components/marketing/home/pillars.tsx` — three editorial cards on `--cream-deep`, each with botanical SVG, eyebrow, h3, blurb, and "Read more →" link.
- `components/marketing/home/featured-ebook.tsx` — async server component, reads `pcos-guidebook.mdx` via `loadLibrary`, renders cover + price (PKR 1,500 with PKR 3,000 strikethrough + "Save 50%" chip).
- `components/marketing/home/about-teaser.tsx` — 4:5 portrait left, two-paragraph excerpt, "More about Dr. Ruhma →" CTA.
- `components/marketing/home/testimonials.tsx` — three CSS-typeset blockquotes in Epilogue, mauve curly quotes, attribution caption. No images in this section.
- `components/marketing/home/journal-preview.tsx` — three cards (welcome post + two `placeholder: true` cards rendering the "soon" type-treatment thumbnail).
- `components/marketing/home/cta-band.tsx` — `--cream-deep` band, "Ready when you are." + primary CTA.

## Components built

Hero, HeroPortrait (client), MomentBand (client), Pillars, FeaturedEbook (async server, MDX-driven), AboutTeaser, Testimonials, JournalPreview, CtaBand. Two client components (HeroPortrait, MomentBand); the rest are server components.

## Image references resolved (logical → file path)

- Hero portrait → `/media/home/hero-portrait-1080.webp`
- About teaser → `/media/home/about-teaser-1001.webp`
- PCOS Guidebook cover → `/media/library/pcos-cover-1200.webp`
- Pillar SVGs → `/illustrations/fennel.svg`, `/illustrations/citrus.svg`, `/illustrations/mint.svg`
- Welcome journal cover → `/media/journal/welcome-hero-905.avif` (taken from `welcome.mdx` frontmatter)

The media manifest exposes srcSets but `next/image` already builds responsive srcSets from a single `src`; I used the largest pre-rendered WEBP to give Next the highest-fidelity source to resample from.

## Verification outputs

- `pnpm typecheck` → clean (`tsc --noEmit`).
- `pnpm lint` → 0 errors, 0 warnings (after removing a stale `eslint-disable` directive Next 16 no longer needs).
- `pnpm format:check` → all files match Prettier style.
- `pnpm build` → compiles in 2.6s; `/` is statically prerendered (`○ /`); 6 routes total.
- `pnpm start` + `curl http://localhost:3000/` → 82 KB HTML; "nourish" present (×2, including aria-label and the rendered chars), "Healthy You By Ruhma" present (×22, including JSON-LD + meta), "Book a consultation" present (×4, hero + CTA band + Nav CTA wrapping), "PCOS Guidebook" present (×4). Server killed cleanly.

## Deviations from the plan

- **Plan used `<Button href=...>`; primitive uses `asChild` with `<Link>`.** Adapted everywhere — `<Button asChild><Link href=...>...</Link></Button>`. Same UX, no new primitive.
- **Plan used `<LetterStagger>{children}</LetterStagger>`; primitive takes `text` prop.** Used the existing API.
- **Plan used `delayMs` on `<FadeUp>`; primitive takes `delay` (seconds).** Converted (e.g. `delay={i * 0.08}`).
- **JournalPreview composition.** Plan suggested all-three placeholder for launch; I included the existing `welcome.mdx` post + two placeholders so the layout exercises both branches and the welcome content surfaces.
- **No `ogImage` route yet.** Plan 13 ships dynamic OG; I omitted the static fallback OG image rather than reference a file that doesn't exist. Open Graph metadata still sets `title`/`description`/`url`/`siteName`/`locale`.
- **MomentBand clamp.** Plan text shows `clamp(120px, 18vw, 220px)` in §3.1 and `clamp(64px, 12vw, 220px)` in plan 04 §4.3. I used `clamp(64px, 18vw, 220px)` — the lower floor matches mobile reality, the 18vw growth rate matches the master plan's "moment" tone (the 12vw rate barely scales between mobile and desktop). Pin and ceiling unchanged.
- **Pillar images.** Plan refers to `pillar-{hormonal,weight,diet}-327.{avif,webp}` in the media manifest, but the design uses botanical SVGs ("each: small botanical SVG (~80px)…"). I used the SVGs per master §3.1; the pillar lifestyle images remain available for later use.
- **Hero portrait cleanup.** Plan referenced `coach-1.{avif,webp}`; phase 03's media migration produced `hero-portrait-1080.webp`. Used the migrated asset.
- **Testimonial initials.** Plan used initials only ("S.A."); per master §3.1's "S. Ahmed · Lahore" example I used short surnames + city for warmth. Still flagged TODO for content confirmation.

## Acceptance check

- 8 sections in the correct order with correct backgrounds: cream → cream → cream-deep → cream → cream-deep → cream → cream-deep → cream-deep.
- One `<h1>` (hero), one `<h2>` per section, all sections labelled via `aria-labelledby` or `aria-label`.
- Three motions only: Hero portrait clip-path wipe, hero H1 + nourish letter stagger, all other sections fade-up on scroll. No parallax, no cursor effects.
- All images carry meaningful alt text or are explicitly decorative (`alt=""`).
- No on-page newsletter form (deferred per master §7).
- No Lorem Ipsum; no `placeholder` filenames referenced.
