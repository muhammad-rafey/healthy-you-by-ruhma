# Healthy You By Ruhma — Next.js Redesign Plan

## Context

The current site (dietitianruhma.com) is a WordPress + Elementor + WooCommerce build for **Dr. Ruhma**, a Pakistani dietitian. Brand: **Healthy You By Ruhma**. Currency: **PKR**. The existing site has solid bones — a coherent palette (warm cream, charcoal, dusty mauve), a decent type pairing (Inter + Epilogue), and reasonable content — but is built on the typical Elementor template-mart aesthetic and doesn't communicate the practitioner's authority or warmth.

**The brief**: rebuild the site in Next.js as an awards-grade marketing site (think Awwwards / SOTD candidate), keep all existing content + media, evolve the visual identity into something distinctive, and use restrained, purposeful motion. No implementation yet — this document is the design plan.

The verdict from existing-site analysis: 16 pages, 3 digital ebooks (PKR 1,500–3,000), 1 placeholder blog post, 1,555 media files (320 MB) with usable hero photography and product mockups, brand colors and type already chosen. The existing copy is genuine and personal ("My Mission is to Make You Shine From Inside" / "Nourishing You Inside Out For Healthy You Throughout"). We will preserve this voice and the photography but rebuild presentation top-to-bottom.

---

## 1. Visual Direction — "Quiet Authority"

A single design thesis everything else flows from. The tone the redesign needs to hit:

> **Aesop × Cup of Jo × NYT Cooking.** Warm, editorial, considered. Authority without coldness. Photography-led. Restrained motion. Award-distinctive via *typography moments*, not flashy effects.

**Why this direction (not, e.g., maximalist Awwwards):** the brand is a personal practitioner, not a tech startup. Wellness audiences (women managing PCOS / hormonal health / weight) respond to *trust* signals over spectacle. The award-winning move here is restraint, beautiful typography, real photography, considered whitespace — see Aesop, Toogood, ssense editorial, Apartamento. Bold motion would undercut credibility.

### Design tokens

| Token | Value | Use |
|---|---|---|
| `--cream` | `#F4F0EE` | Base background (matches current "Beige Element") |
| `--cream-deep` | `#E8E1D8` | Secondary surface, alternating sections |
| `--shell` | `#E7D3CC` | Tertiary surface, hover states on warm chips |
| `--ink` | `#1A1A1A` | Primary text, headings (slightly deeper than current `#282828` for editorial feel) |
| `--ink-soft` | `#3E3E3E` | Body |
| `--mauve` | `#895575` | Accent (links, underlines, small chips) |
| `--mauve-deep` | `#6E3F5C` | Hover state for mauve |
| `--moss` | `#5D6B4E` | Secondary accent for botanical/health cues — NEW token, used sparingly |
| `--paper` | `#FFFFFF` | Cards, modals |

The existing palette is already correct; we deepen the ink slightly for editorial contrast and add a single muted moss-green to reference the dietary/botanical world without going clichéd-leaf-emoji.

### Typography

Keep **Inter** (variable, 100–900) for UI/body and **Epilogue** (variable, 100–900) for editorial display. Drop **La Belle Aurore** entirely (script fonts age fast and dilute the practitioner's authority). All loaded via `next/font` for zero CLS and self-hosting.

Type scale (clamp-based, fluid):

| Role | Family | Size (clamp) | Weight | Tracking | Notes |
|---|---|---|---|---|---|
| Display XL | Epilogue | clamp(64px, 12vw, 220px) | 600 | -0.04em | The "moment" — homepage hero, section openers |
| Display | Epilogue | clamp(40px, 6vw, 96px) | 500 | -0.03em | Page titles |
| H1 | Epilogue | clamp(32px, 4vw, 56px) | 500 | -0.02em | |
| H2 | Inter | clamp(24px, 2.5vw, 36px) | 500 | -0.01em | |
| Eyebrow | Inter | 12px | 500 | 0.16em uppercase | Section labels |
| Body | Inter | 17px | 400 | 0 | Editorial body, 1.6 line-height |
| Small | Inter | 14px | 400 | 0 | |
| Caption | Inter | 13px | 400 | 0.04em | Image captions, italics allowed |

The signature move: a single oversized **Epilogue lowercase moment** per page (e.g., the word **"nourish"** rendered at 220px on the homepage hero, sitting under the photograph). One per page max — that restraint is the trick.

### Photography & art direction

The 320 MB media library is mostly usable but inconsistent. Audit during implementation:
- **Keep**: the practitioner portraits (`coach-1.png`, `call1-1.png`, `AboutPage-Hero-1.jpg`), product mockups, real lifestyle shots.
- **Drop**: stock placeholders, generic icon boxes, "quote graphic" PNGs (replace with real CSS-typeset blockquotes), the canned Elementor templates.
- **New micro-elements (commission or DIY)**: 5–8 simple botanical/ingredient line-art SVGs (fennel, mint, citrus rind) used at 80px max as section anchors. Hand-drawn feel, single line, --ink color. These cost ~$200 on Fiverr or 1 afternoon in Figma.

### Motion — minimal, opinionated

**Three motions only**, no more:
1. **Fade-up reveal** — content blocks fade up 16px on scroll-into-view, 600ms, ease-out. Disabled if `prefers-reduced-motion`.
2. **Image reveal** — hero photographs reveal via a clip-path wipe (1.2s, custom cubic-bezier) on initial mount and route transition. One per page hero.
3. **Letter stagger** — display headings stagger letter opacity 0→1 over 800ms on mount. The "moment" gets this; nothing else.

No cursor effects. No parallax. No WebGL. No scroll-jacking. No page transitions beyond a 200ms cross-fade. **Award-distinctive via fewer, more confident motions.**

---

## 2. Information Architecture

We carry over every existing page slug for SEO continuity (with three slug fixes: `diet-plannig-program` → `diet-planning-program`, `conultation-call` → `consultation-call`, `hormonal-health` stays). Old slugs 301-redirect to corrected ones.

```
/                              Home
/about                         About Dr. Ruhma  (was /about-me)
/services                      Services overview
/programs/diet-planning        Diet Planning Program
/programs/coaching             Coaching Program
/programs/consultation         1:1 Consultation Call
/focus/hormonal-health         What hormones can do for you
/focus/weight-management       Weight Management
/library                       Ebook presentation index (was /shop)
/library/diabetes-essentials   Ebook detail (links out to external store)
/library/pcos-guidebook        Ebook detail
/library/skin-secrets          Ebook detail
/journal                       Blog index (placeholder, ready for content)
/journal/[slug]                Blog post
/contact                       Contact
/legal/privacy                 Privacy policy
/legal/terms                   Terms
/legal/refunds                 Refund policy
```

**Note**: `/shop` is renamed to `/library` to match the editorial framing (these are guidebooks, not e-commerce SKUs). The old `/shop` slug 301-redirects to `/library`. Cart, checkout, and my-account pages from the old WP site are dropped — checkout happens on the external platform Dr. Ruhma chooses (Gumroad / Lemon Squeezy / Amazon KDP / etc.).

The `/programs/` and `/focus/` namespaces are new — they group what's currently a flat list of overlapping pages. "Programs" = paid offerings with a clear funnel; "Focus areas" = content/educational pages that funnel into programs.

### Global navigation
- **Top bar** (sticky, condensing on scroll): wordmark · Programs · Focus · Library · Journal · About · Contact (CTA pill)
- **Footer**: 4 columns — Practice / Programs / Resources / Legal — plus newsletter signup, IG/email/WhatsApp icons, the current tagline "Nourishing You Inside Out For Healthy You Throughout" set in Epilogue 32px.

---

## 3. Per-page design plans

Each page below gets: **purpose** · **structure** (sections in order) · **signature move** · **content source** · **motion notes**.

### 3.1 Home (`/`)

**Purpose**: in 8 seconds, communicate (1) who Dr. Ruhma is, (2) what transformation she offers, (3) where to start.

**Structure**:
1. **Hero** — split layout. Left: H1 "Get transformed into your dream version" set Epilogue 96px, eyebrow "Healthy You By Ruhma — Lahore, Pakistan", body 2-line subhead, primary CTA "Book a consultation". Right: full-bleed practitioner portrait (`coach-1.png` cleaned up), with a 1.2s reveal wipe on load.
2. **The "moment"** — full-width band, cream background. Single word **"nourish"** in Epilogue 220px lowercase, tightly tracked. Below: 3-line manifesto in Inter italic 18px — "Nourishing you inside out for healthy you throughout."
3. **Three pillars** — 3-column editorial grid: *Hormonal Health* / *Weight Management* / *Diet Planning*. Each: small botanical SVG, eyebrow, 1-line description, "Read more →".
4. **Featured ebook** — alternating layout. Left: PCOS Guidebook mockup (currently sale: PKR 3,000 → 1,500). Right: title, blurb, price, CTA.
5. **About teaser** — half-bleed portrait + 2-paragraph "About Dr. Ruhma" + CTA to /about.
6. **Testimonials** — 3-column quote grid, Epilogue pull-quotes, attribution in caption style. Re-typeset the existing "quote graphic" PNGs as actual text.
7. **Journal preview** — 3 latest posts (when content exists; placeholder cards for now).
8. **CTA band** — cream-deep background, single line "Ready when you are." + "Book a consultation" button.
9. **Footer**.

**Signature move**: the "nourish" moment in section 2.

**Content source**: existing home page text + practitioner portrait + product image.

**Motion**: hero image reveal (clip-path wipe). H1 letter stagger. Sections fade-up on scroll. Otherwise still.

---

### 3.2 About (`/about`)

**Purpose**: build trust. Show the human, the credentials, the philosophy.

**Structure**:
1. **Hero** — full-bleed portrait (`AboutPage-Hero-1.jpg` cleaned), title overlay bottom-left "Dr. Ruhma" Epilogue 96px, eyebrow above "Clinical Dietitian · Lahore".
2. **Mission statement** — centered, max-width 720px: "My mission is to make you shine from inside." Epilogue 56px, italic body excerpt below.
3. **Bio** — two-column editorial. Left: 4–6 paragraphs of Dr. Ruhma's story, Inter 17px, drop-cap on first paragraph. Right: small portrait + pull-quote + credentials list (chip style).
4. **Philosophy** — 4 numbered principles, Epilogue numerals 96px in mauve, each principle as 1 sentence. Botanical SVG between sections.
5. **In the press / certifications** — logo strip if available; if not, omit gracefully.
6. **CTA band** — "Ready to start?"

**Signature move**: oversized mauve numerals (01, 02, 03, 04) for the philosophy section.

**Content source**: existing about-me page (10k chars).

---

### 3.3 Services (`/services`)

**Purpose**: high-level menu of all paid offerings, routes to individual program pages.

**Structure**:
1. Page header — eyebrow "Services", H1 Epilogue.
2. **Three cards** in editorial grid (not a typical service grid — make each card feel like a magazine feature): Diet Planning Program / Coaching Program / Consultation Call. Each: hero image, eyebrow ("Program 01" etc.), title, 2-line description, price-from chip, "Explore →".
3. FAQ (5–7 questions) — clean accordion, mauve underline on hover.
4. CTA band.

**Signature move**: editorial numbered cards instead of generic "service tiles."

---

### 3.4 Programs — Diet Planning (`/programs/diet-planning`)

**Purpose**: convert. This page has 19k chars of existing content — give it editorial dignity.

**Structure**:
1. Hero — split: program title (Epilogue 96px), eyebrow "Program 01", body intro, price + CTA. Right: relevant lifestyle shot.
2. **What's included** — 6-tile grid, each with botanical icon + 1-line. Spaced.
3. **How it works** — 4-step horizontal scroll on desktop, vertical stack on mobile. Each step: number, title, description.
4. **Sample week** — embedded scrollable card showing a sample meal plan. Real content from the existing page.
5. **Testimonials** — 2 long-form quote cards (Epilogue pull-quote treatment).
6. **Pricing** — single card, large price, what's included list, "Book your slot" button.
7. **FAQ** (specific to this program).
8. CTA band.

**Signature move**: the "sample week" embedded card — gives the buyer something concrete instead of vague promises.

---

### 3.5 Programs — Coaching (`/programs/coaching`)

Mirrors 3.4 structure but with coaching-specific content (23k chars source). Eyebrow "Program 02". Differentiator: a "What 8 weeks looks like" timeline component (vertical with milestones).

**Signature move**: the 8-week timeline.

---

### 3.6 Programs — Consultation (`/programs/consultation`)

Shorter page. Hero, "What to expect" (3 steps), "How to prepare", pricing card, embedded Calendly/Cal.com booking iframe (or link), FAQ, CTA.

**Signature move**: the booking widget feels native (matched to brand colors).

---

### 3.7 Focus — Hormonal Health (`/focus/hormonal-health`)

**Purpose**: educational long-form, soft-funnel into programs.

**Structure**:
1. Editorial hero — large display title, eyebrow "Focus area", subhead. No image; just type-driven.
2. Long-form article body — 2-column on desktop max-width 720px column, drop-caps, pull-quotes set in Epilogue, embedded ingredient illustrations.
3. **"Where this shows up"** — 3 conditions (PCOS / thyroid / cortisol) with 1-line descriptions.
4. **Related** — link card to PCOS Guidebook ebook + Coaching Program.
5. CTA band.

**Signature move**: this page feels like a *magazine longread*, not a service page. Drop-caps, pull-quotes, justified body where appropriate.

---

### 3.8 Focus — Weight Management (`/focus/weight-management`)

Same template as 3.7. Different content (10k chars source).

---

### 3.9 Library (`/library`)

**Purpose**: present 3 ebooks as elevated objects, not generic product tiles. No on-site checkout — each ebook links out to its external store (URL editable per-book in MDX frontmatter).

**Structure**:
1. Header — Epilogue title "The Library", subhead "Three guidebooks. Practical, evidence-based, written for women who want answers."
2. **Editorial product grid** — 3 large cards stacked alternating left/right (NOT a 3-column tile grid). Each card: book cover mockup (oversized, with subtle shadow), Epilogue title, 3-line description, price (with sale strikethrough where applicable), "Open →" linking to the local detail page.
3. CTA band — "Not sure where to start? Book a consultation."

**Signature move**: alternating editorial layout — each ebook gets a feature spread feeling rather than a thumbnail.

---

### 3.10 Ebook detail (`/library/[slug]`)

**Purpose**: present the ebook editorially and hand off to the external checkout.

**Structure**:
1. **Split hero** — Left: cover mockup (large, with subtle 3D rotation on hover, 4° max). Right: eyebrow ("Guidebook 01"), title, price (regular + sale + savings chip), **primary CTA "Buy on [Platform] →"** (external link from MDX frontmatter, opens new tab with `rel="noopener"`), format ("Digital · PDF · ~60 pages"), instant-delivery note.
2. **Inside** — table of contents preview as numbered editorial list.
3. **Sample pages** — 3 image previews of internal spreads.
4. **About the author** — small portrait + 2-paragraph bio + link to /about.
5. **FAQ**.
6. **Related** — the other 2 ebooks as small cards.

**Signature move**: the editorial TOC preview — gives the buyer a real sense of the content without giving it away.

**Frontmatter contract** (per ebook MDX):

```yaml
title: PCOS Guidebook
eyebrow: Guidebook 02
slug: pcos-guidebook
price: 3000
salePrice: 1500
currency: PKR
buyUrl: https://gumroad.com/...   # editable, swap platforms anytime
cover: /media/library/pcos-cover.png
sampleSpreads:
  - /media/library/pcos-sample-1.png
  - /media/library/pcos-sample-2.png
  - /media/library/pcos-sample-3.png
toc:
  - "What's actually happening with PCOS"
  - "The hormonal cascade in plain language"
  - …
```

---

### 3.11 Journal (`/journal`) and post pages

**Purpose**: future content home. Currently empty (1 placeholder post). Build the structure ready to scale.

**Structure** (`/journal`):
- Featured post (large card, 16:9 image, title Epilogue 56px, eyebrow category, excerpt, "Read →").
- Recent posts grid (3-col, magazine-style, mixed sizes).
- Categories chip row.
- Empty-state copy: "New entries coming soon — sign up for updates" with newsletter form.

**Structure** (`/journal/[slug]`):
- Hero with title, eyebrow (category + date + read time).
- Article body (Inter 17/1.6, max-width 680px), drop-cap, pull-quotes, captioned images.
- Author footer (Dr. Ruhma).
- "More entries" related strip.

---

### 3.12 Contact (`/contact`)

**Purpose**: low-friction inquiries.

**Structure**:
1. Page header — Epilogue title "Let's talk".
2. **Two-column** — Left: form (name, email, topic select, message). Right: contact details (email, WhatsApp, IG handle, response-time note).
3. Embedded map (optional — only if there's a real practice address).
4. FAQ (3 questions about response times, consultations, etc.).

**Signature move**: form fields use a subtle hand-drawn underline-only style instead of bordered boxes — softens the conversion ask.

---

### 3.13 Legal (`/legal/privacy`, `/legal/terms`, `/legal/refunds`)

Plain typographic pages. Inter 17px, max-width 720px, eyebrow + title + body. No images. Last-updated date in caption style.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC) | Default for awards-grade marketing |
| Language | **TypeScript** strict | |
| Styling | **Tailwind CSS v4** + CSS variables for tokens | Tokens defined once, swap themes easy |
| UI primitives | **shadcn/ui** (Radix-backed) | Accessible primitives, no lock-in |
| Animation | **Motion** (formerly Framer Motion) v11 | RSC-friendly, our 3 motions covered |
| Type loading | **next/font** with Inter + Epilogue (variable) | Self-hosted, zero CLS |
| Images | `next/image` with AVIF + WEBP fallbacks | 320MB media → ~25MB optimized |
| Content | **MDX in repo** via `next-mdx-remote` v5 + `gray-matter` | Programs / focus / library / journal / legal as `.mdx`. Dev-managed updates via PR |
| Commerce | **External link-out** — no on-site checkout. Each ebook MDX has a `buyUrl` field pointing to Gumroad/Lemon Squeezy/Amazon/etc. | Zero payment infra. Swap platforms anytime by editing frontmatter |
| Forms | **React Hook Form** + Zod, **server actions** posting to Resend (transactional) | Single contact form, no separate API |
| Newsletter | **Buttondown** (recommended, $9/mo) — embed simple form | Clean, privacy-friendly, owns its data. Defer signup if not ready |
| Analytics | **Vercel Analytics** + **Plausible** (cloud, $9/mo) | Privacy-respecting, no cookie banner needed |
| SEO | `next-sitemap`, JSON-LD via `schema-dts`, dynamic OG images via `@vercel/og` | |
| Hosting | **Vercel** | Free tier covers this; matches Next.js capabilities |
| Domain | `dietitianruhma.com` (cutover later) | |

---

## 5. Repo & project structure

GitHub repo (to be created during Phase 0 of build): **`muhammad-rafey/healthy-you-by-ruhma`**, **private**. Created via `gh repo create muhammad-rafey/healthy-you-by-ruhma --private --source=. --remote=origin --push` after the Next.js scaffold is committed locally.

```
.
├── app/
│   ├── page.tsx                     # /
│   ├── about/page.tsx
│   ├── services/page.tsx
│   ├── programs/[slug]/page.tsx
│   ├── focus/[slug]/page.tsx
│   ├── library/page.tsx
│   ├── library/[slug]/page.tsx      # editorial detail; buy CTA links out
│   ├── journal/page.tsx
│   ├── journal/[slug]/page.tsx
│   ├── contact/page.tsx
│   ├── legal/[slug]/page.tsx
│   ├── layout.tsx
│   ├── globals.css                  # tokens, base styles
│   ├── opengraph-image.tsx          # branded OG generator
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/                          # shadcn primitives
│   ├── marketing/                   # Hero, MomentBand, PillarsGrid, EditorialGrid…
│   ├── motion/                      # FadeUp, ImageReveal, LetterStagger
│   └── layout/                      # Nav, Footer
├── content/
│   ├── programs/{diet-planning,coaching,consultation}.mdx
│   ├── focus/{hormonal-health,weight-management}.mdx
│   ├── library/{diabetes-essentials,pcos-guidebook,skin-secrets}.mdx
│   ├── journal/*.mdx                # placeholder + future
│   ├── legal/{privacy,terms,refunds}.mdx
│   └── site.ts                      # site identity, nav, social, footer copy
├── lib/
│   ├── tokens.ts                    # ts-side access to design tokens
│   ├── seo.ts
│   └── og.tsx
├── public/
│   ├── media/                       # migrated, optimized images
│   └── illustrations/               # botanical SVGs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### Tooling
- **Package manager**: pnpm (faster, disk-efficient — to be installed via corepack).
- **Linter**: ESLint (Next config) + Prettier with Tailwind plugin.
- **Pre-commit**: lint-staged + Husky.
- **CI**: GitHub Actions — install, typecheck, lint, build on every PR; preview deploy on Vercel automatic.
- **Type checking**: TypeScript strict, no `any`.

---

## 6. Content & asset migration

### Content

For each page, copy is sourced from the running local WP. Workflow:
1. Export each page's HTML via `wp post get <id> --field=post_content` from the running container.
2. Manually copy-edit into MDX, fixing the typos surfaced earlier (e.g., "harmone" → "hormone", "manue" → "menu", "plannig" → "planning"). The existing voice is good — preserve it, polish for typos and parallelism only.
3. Each MDX file gets frontmatter: `title, description, ogImage, eyebrow, slug`.
4. Long pages (Diet Planning, Coaching) are restructured into the section schema described in §3 — not copied 1:1.

### Media

1. Inventory what's actually used (most of 1,555 files are auto-generated thumbnails).
2. Hand-pick ~80–120 source images that map to the new sections.
3. Run through `sharp` once: convert to AVIF + WEBP, generate sizes [400, 800, 1200, 1600, 2400] for `next/image` `srcSet`.
4. Optimize the SVG logo (`Artboard-4.svg`) and use as the wordmark.
5. Discard the canned Elementor template visuals and the "quote graphic" PNGs (replaced by real text).

Estimated final asset weight: ~25–35 MB after optimization vs. 320 MB now.

### URL/SEO continuity

301 redirects in `next.config.js` from old slugs to new ones:

```
/about-me              → /about
/contact-me            → /contact
/diet-plannig-program  → /programs/diet-planning
/coaching-program      → /programs/coaching
/conultation-call      → /programs/consultation
/hormonal-health       → /focus/hormonal-health
/weight-management     → /focus/weight-management
/shop                  → /library
/shop/diabetes-essentials → /library/diabetes-essentials
/shop/pcos-guidebook   → /library/pcos-guidebook
/shop/skin-secrets     → /library/skin-secrets
/cart                  → /library  (cart no longer exists)
/checkout              → /library  (checkout is external)
/my-account            → /library  (no accounts on the new site)
/refund_returns        → /legal/refunds
/privacy-policy        → /legal/privacy
/terms-and-conditions  → /legal/terms
```

---

## 7. Decisions made

| # | Decision | Choice |
|---|---|---|
| 1 | Commerce | **External link-out only.** No on-site checkout, cart, or accounts. Each ebook MDX has a `buyUrl` field (Gumroad / Lemon Squeezy / Amazon KDP — Dr. Ruhma's choice, swappable). |
| 2 | CMS | **MDX in repo.** All content lives as `.mdx` under `content/`. Updates ship via PR. No external CMS. |
| 3 | Visual direction | **Quiet Authority.** Aesop × Cup of Jo. Warm cream + charcoal + dusty mauve. Large editorial Epilogue typography moments. Photography-led. Three motions only. |
| 4 | Repo | **`muhammad-rafey/healthy-you-by-ruhma`**, **private**. Created during build Phase 0. |

### Operational items deferred to build time (not blocking the plan):

- **External ebook stores**: Dr. Ruhma to confirm where each ebook is sold (Gumroad / Lemon Squeezy / Amazon / Stripe payment links). MDX `buyUrl` placeholders until then.
- **Newsletter**: defer to launch — start with `<form action="">` placeholder, wire to Buttondown / Resend Audiences when content cadence is real.
- **Booking widget on /programs/consultation**: Calendly vs Cal.com — Dr. Ruhma's account choice.
- **Production domain cutover**: keep WP backup live until Next.js launch, then swap DNS.

---

## 8. Implementation phasing (for the eventual build)

This document is the design plan; build comes later. When ready, work in this order:

1. **Phase 0 — Setup** (~1 day): `pnpm dlx create-next-app@latest healthy-you-by-ruhma --ts --tailwind --app --eslint --src-dir=false --turbopack`. Add Prettier + tailwind plugin, Husky + lint-staged, ESLint strict. Initial commit. `gh repo create muhammad-rafey/healthy-you-by-ruhma --private --source=. --push`. Connect Vercel project, set production branch to `main`.
2. **Phase 1 — Design system** (~2–3 days): tokens in `globals.css` and `tailwind.config.ts`, fonts via `next/font` (Inter + Epilogue), type scale, Button / Eyebrow / Heading / Container primitives, the three motion utilities (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`), botanical SVG set, kit page at `/_kit` route to visually verify.
3. **Phase 2 — Layout shell** (~1 day): Nav (sticky + scroll-condense), Footer, `app/layout.tsx`, redirects in `next.config.js`, robots, sitemap.
4. **Phase 3 — Marketing pages** (~5–7 days, in this order): Home → About → Services → Focus pages (×2) → Program pages (×3). MDX-driven sections wherever long-form copy lives.
5. **Phase 4 — Library** (~2 days): `/library` index + `/library/[slug]` editorial detail pages reading MDX + external `buyUrl`.
6. **Phase 5 — Journal + Contact + Legal** (~2 days): journal index/post template (with placeholder content), contact form via server action → Resend, legal MDX pages.
7. **Phase 6 — Polish** (~2–3 days): motion QA, SEO/JSON-LD per page, dynamic OG images via `@vercel/og`, redirects verified, perf budget (LCP < 2.0s, CLS < 0.05, INP < 150ms), Lighthouse 95+ target on every page.
8. **Phase 7 — Cutover**: DNS swap to Vercel, monitor 301s in Search Console for a week, retire the local WP stack (`docker compose down -v` once we're confident nothing else needs it).

Total estimate: **~3 working weeks** for one developer at a comfortable pace.

---

## 9. Verification (how we'll know the design works)

When implemented, the plan succeeds if:
- **Award candidacy** — can submit to Awwwards SOTD with a straight face. Internal review against 5 reference award sites (aesop.com, cupofjo.com, basic.agency, hypeandhyper.com, glossier.com archive) the week of launch.
- **Performance** — Lighthouse 95+ on every metric on the homepage, About, and a Program page; real-user LCP < 2.0s on 3G.
- **Accessibility** — axe-core 0 violations, full keyboard nav, screen-reader pass on all flows, color contrast ≥ AA everywhere (mauve-on-cream specifically — verify).
- **SEO continuity** — every old URL 301s, sitemap submitted, no traffic dip > 10% in week-1 Search Console.
- **External-purchase flow** — every ebook detail page has a working `buyUrl` that lands on a real, working external checkout. Click-through tracked via Plausible event.
- **Content fidelity** — every section from the old site has a home in the new one, or a deliberate decision to omit it documented in a `MIGRATION_NOTES.md`.
- **Motion discipline** — exactly the three motions defined in §1, no more added during build. Reviewer can name them all.

---

## 10. Critical files reference

The redesign needs nothing from the existing WP file tree at code-level. It does need:
- `/home/duh/Documents/website backup (1)/uploads/` — image source library (filtered).
- DB queries against the running local stack to extract page text:
  - `sudo docker exec -u www-data dietitianruhma-local-wpcli-1 wp --path=/var/www/html post get <id> --field=post_content`
- `/home/duh/Documents/website backup (1)/CLAUDE.md` — context for future sessions about the local WP stack.

Existing helpers we'll reuse: none from the WP tree; this is a clean Next.js project.
