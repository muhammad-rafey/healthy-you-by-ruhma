# 04 — Home page (`/`)

> Implementation plan for the homepage of the Healthy You By Ruhma redesign.
> Per master plan §3.1. Status: ready to execute after plans 01–03 are merged.

---

## 1. Goal

Build the homepage as the strongest single page on the site — the page that earns the awards-grade verdict. It must, in 8 seconds:

1. Land **who** Dr. Ruhma is (clinical dietitian, Lahore, warm and authoritative).
2. Land **what** she offers (hormonal health, weight management, diet planning, ebooks).
3. Land **where to start** (book a consultation / open the library).

It must also be the page that most clearly performs the "Quiet Authority" thesis — restraint, editorial typography, real photography, three considered motions. The signature move on this page is the oversized lowercase **"nourish"** band; everything else exists to make that moment land.

Performance targets (verified in plan 14):
- LCP < 1.8s on 3G (the hero portrait is the LCP element).
- CLS < 0.02.
- INP < 100ms.
- Lighthouse 95+ across the board.

The homepage is **a server component** (`app/page.tsx`) that imports nine section components, eight of which live in `components/marketing/home/` (the ninth is the global Footer from plan 02). The two interactive sections (Hero image reveal, MomentBand letter stagger) are isolated client components imported into otherwise-static server components — no `"use client"` at the page level.

---

## 2. Pre-requisites

This plan assumes the following are already merged and on `main`:

- **Plan 01 — Design system**: tokens in `globals.css` (`--cream`, `--cream-deep`, `--shell`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`); `next/font` loaded for Inter (variable, latin) and Epilogue (variable, latin) with `display: 'swap'` and CSS variables `--font-inter` and `--font-epilogue`; the type scale exposed as Tailwind utilities (`text-display-xl`, `text-display`, `text-h1`, `text-h2`, `text-eyebrow`, `text-body`, `text-small`, `text-caption`); UI primitives (`<Button>`, `<Eyebrow>`, `<Container>`, `<Heading>`); the three motion primitives (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`) — see §1 of master plan.
- **Plan 02 — Layout shell**: `app/layout.tsx` with `<Nav>` (sticky, scroll-condensing) and `<Footer>` already wrapping `{children}`; `next.config.ts` with redirects; `robots.ts` and `sitemap.ts` in place.
- **Plan 03 — Content & media migration**: source images selected from the WP `uploads/` snapshot, run through `sharp`, written to `public/media/home/` as AVIF + WEBP with all responsive sizes (`-400`, `-800`, `-1200`, `-1600`, `-2400` suffixes). Specifically the homepage requires:
  - `public/media/home/coach-1.{avif,webp}` (and responsive sizes) — the practitioner portrait, full-bleed hero right pane, ~3:4 portrait crop.
  - `public/media/home/about-portrait.{avif,webp}` — derived from `AboutPage-Hero-1.jpg`, mid-shot crop for the About teaser.
  - `public/media/library/pcos-cover.{avif,webp}` — the PCOS Guidebook cover mockup, written by plan 03 (homepage just consumes it).
  - `public/illustrations/fennel.svg`, `mint.svg`, `citrus.svg` — three of the botanical line-arts used by the Pillars section.

If any of these are missing at the time this plan is executed, **stop and complete plan 03 first** rather than reaching into the WP backup directly.

---

## 3. Dependencies (additions beyond plans 01–03)

None. Plan 01 already installs `motion`, plan 02 already wires the layout shell, plan 03 already optimizes the imagery. The homepage is **pure composition** of primitives delivered earlier.

If a missing primitive is discovered while implementing (e.g. a `<SectionDivider>` botanical SVG that wasn't in plan 01), add it to plan 01's primitive set rather than creating it ad-hoc here — keep the design system the single source of truth.

---

## 4. Files to create / modify

| Path | Kind | Notes |
|---|---|---|
| `app/page.tsx` | create | Server component, composes sections, exports `metadata`, emits JSON-LD. |
| `components/marketing/home/Hero.tsx` | create | Server wrapper. Mounts a small `<HeroPortrait>` client child for the image reveal. |
| `components/marketing/home/HeroPortrait.tsx` | create | Client. `<ImageReveal>`-wrapped `<Image>`. |
| `components/marketing/home/MomentBand.tsx` | create | Client. The "nourish" moment + `<LetterStagger>`. **Reference implementation.** |
| `components/marketing/home/Pillars.tsx` | create | Server. Three editorial cards. |
| `components/marketing/home/FeaturedEbook.tsx` | create | Server. PCOS Guidebook split layout. |
| `components/marketing/home/AboutTeaser.tsx` | create | Server. Portrait + 2 paragraphs + CTA. |
| `components/marketing/home/Testimonials.tsx` | create | Server. Three CSS-typeset blockquotes. |
| `components/marketing/home/JournalPreview.tsx` | create | Server. 3 latest posts (or placeholder cards). |
| `components/marketing/home/CtaBand.tsx` | create | Server. "Ready when you are." |
| `lib/home-data.ts` | create | Pure data: pillars[], testimonials[], journal placeholders. |
| `lib/jsonld.ts` | modify (or create) | Add `websiteSchema()` and `personSchema()` builders. |

All section components are **default-exported** from their files. Naming is identical to the file name.

The Footer from plan 02 is **not** re-implemented here; it ships as `<Footer />` rendered inside `app/layout.tsx`.

---

### 4.1 `app/page.tsx`

```tsx
import type { Metadata } from "next";
import Hero from "@/components/marketing/home/Hero";
import MomentBand from "@/components/marketing/home/MomentBand";
import Pillars from "@/components/marketing/home/Pillars";
import FeaturedEbook from "@/components/marketing/home/FeaturedEbook";
import AboutTeaser from "@/components/marketing/home/AboutTeaser";
import Testimonials from "@/components/marketing/home/Testimonials";
import JournalPreview from "@/components/marketing/home/JournalPreview";
import CtaBand from "@/components/marketing/home/CtaBand";
import { pillars, testimonials, journalPlaceholders } from "@/lib/home-data";
import { websiteSchema, personSchema } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Healthy You By Ruhma — Clinical dietitian in Lahore",
  description:
    "Dr. Ruhma is a clinical dietitian in Lahore helping women take quiet, lasting control of hormonal health, weight, and daily nourishment.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Healthy You By Ruhma",
    description:
      "Quietly authoritative, evidence-based dietetics from Dr. Ruhma — Lahore.",
    url: "/",
    siteName: "Healthy You By Ruhma",
    images: [
      {
        url: "/opengraph-image", // generated dynamically — plan 13
        width: 1200,
        height: 630,
        alt: "Healthy You By Ruhma — Dr. Ruhma, clinical dietitian",
      },
    ],
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healthy You By Ruhma",
    description:
      "Clinical dietitian Dr. Ruhma — hormonal health, weight management, diet planning.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([websiteSchema(), personSchema()]),
        }}
      />
      <Hero />
      <MomentBand />
      <Pillars items={pillars} />
      <FeaturedEbook />
      <AboutTeaser />
      <Testimonials items={testimonials} />
      <JournalPreview items={journalPlaceholders} />
      <CtaBand />
    </>
  );
}
```

Notes:
- `revalidate` is not set; the page is fully static at build time. Once the journal is wired (plan 09), `JournalPreview` becomes the only data-driven section and will trigger ISR via `revalidate = 3600` at the page level.
- The JSON-LD is emitted as a single `<script>` containing an array of two schemas — Google handles arrays since 2022 and it cuts one DOM node.
- The OG image route `/opengraph-image` is delivered by plan 13. Until then, ship a static fallback at `public/og-default.png` and reference that instead of the dynamic route — the `metadata` object falls back gracefully.

---

### 4.2 `components/marketing/home/Hero.tsx` and `HeroPortrait.tsx`

Split layout: text left, image right. Mobile: stacks (text first, image second). Desktop: 6/6 grid with the image bleeding to the viewport right edge.

```tsx
// components/marketing/home/Hero.tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Heading from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";
import HeroPortrait from "./HeroPortrait";

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative bg-cream pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32"
    >
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 lg:gap-12">
        {/* LEFT — copy */}
        <div className="md:col-span-6 md:pr-4 lg:pr-12 flex flex-col justify-center">
          <Eyebrow className="mb-6 text-mauve">
            Healthy You By Ruhma · Lahore, Pakistan
          </Eyebrow>

          <Heading
            as="h1"
            id="hero-heading"
            className="font-epilogue text-display tracking-tight-display text-ink"
          >
            Get transformed into your dream version.
          </Heading>

          <p className="mt-6 max-w-xl text-body text-ink-soft leading-relaxed">
            Evidence-based, deeply personal dietetics from Dr. Ruhma — focused
            on hormonal health, sustainable weight management, and a way of
            eating you can keep for life.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/programs/consultation" variant="primary">
              Book a consultation
            </Button>
            <Button href="/about" variant="ghost">
              Meet Dr. Ruhma
            </Button>
          </div>
        </div>

        {/* RIGHT — portrait, full-bleed on desktop */}
        <div className="md:col-span-6 md:-mr-[max(0px,calc((100vw-theme(maxWidth.7xl))/2))]">
          <HeroPortrait />
        </div>
      </Container>
    </section>
  );
}
```

```tsx
// components/marketing/home/HeroPortrait.tsx
"use client";

import Image from "next/image";
import ImageReveal from "@/components/motion/ImageReveal";

export default function HeroPortrait() {
  return (
    <ImageReveal duration={1.2}>
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-shell">
        <Image
          src="/media/home/coach-1.webp"
          alt="Dr. Ruhma, clinical dietitian, photographed in natural light"
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>
    </ImageReveal>
  );
}
```

Why two files:
- `Hero` stays a server component → its layout, copy, and CTAs ship as static HTML and are crawled / rendered without JS.
- The image reveal motion *needs* `useEffect` / `IntersectionObserver` and so must be a client component. Isolating it keeps the hydration cost to a single `<Image>` wrapper instead of the whole hero.

LCP guarantee: the portrait carries `priority` and `fetchPriority="high"`, the image is preloaded via `next/image`, the wrapper is a plain CSS reveal that doesn't delay paint (the image paints behind the clip-path immediately, the reveal animates the clip-path on top). Confirm in plan 14 that LCP is the portrait, not the H1 — if the H1 wins, that's still <1.5s.

---

### 4.3 `components/marketing/home/MomentBand.tsx` — the signature move

This is the most important component on the site. It is a complete reference implementation; subsequent plans should imitate this level of specificity.

```tsx
// components/marketing/home/MomentBand.tsx
"use client";

import LetterStagger from "@/components/motion/LetterStagger";
import Container from "@/components/ui/Container";

const MANIFESTO = [
  "Nourishing you inside out,",
  "for a healthy you throughout.",
  "One quiet meal at a time.",
];

export default function MomentBand() {
  return (
    <section
      aria-label="Manifesto"
      className="relative bg-cream py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Optional: faint hairline above to separate from the hero block. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-ink/[0.06]"
      />

      <Container className="flex flex-col items-center text-center">
        {/* The word. */}
        <LetterStagger
          as="h2"
          // Letter stagger animates each character's opacity 0→1 with a
          // per-letter delay. Per master plan §1, this fires ONCE on mount
          // (not on scroll, not on route change), 800ms total.
          totalDurationMs={800}
          className={[
            "font-epilogue",
            "lowercase",
            "select-none",
            // The signature size — clamped fluid display.
            "text-[clamp(64px,12vw,220px)]",
            "leading-[0.9]",
            // Tight tracking is the move; do not loosen.
            "tracking-[-0.04em]",
            "font-semibold",
            "text-ink",
            // Visually optical-align — Epilogue's lowercase 'n' has a soft
            // left bearing; nudge a hair right so it reads centered.
            "translate-x-[0.02em]",
          ].join(" ")}
        >
          nourish
        </LetterStagger>

        {/* Three-line manifesto, Inter italic 18px — sits *under* the word,
            hairline gap, deliberately not centered with the word's optical
            center but with its visual baseline. */}
        <p
          className={[
            "mt-10 md:mt-12",
            "max-w-md",
            "font-inter italic",
            "text-[18px] leading-[1.55]",
            "text-ink-soft",
            "tracking-[0]",
          ].join(" ")}
        >
          {MANIFESTO.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}
```

Acceptance behavior for this component (verified manually + via Playwright snapshot in plan 14):

- The word renders at `clamp(64px, 12vw, 220px)` — at 1440px viewport, that's `min(220px, 172.8px) = 172.8px`. At 1920px and above, it pins at 220px.
- All seven letters of `nourish` are lowercase, `font-weight: 600`, `letter-spacing: -0.04em`, `line-height: 0.9`.
- Letter stagger triggers **once** on mount: each letter goes from `opacity: 0` to `opacity: 1` with a 50ms per-letter offset, total ~800ms. Translation is `translateY(8px) → translateY(0)` per letter.
- `prefers-reduced-motion: reduce` short-circuits the stagger to "all letters opacity 1, no transform" — the word still appears, just without animation.
- The manifesto is `font-style: italic`, `font-family: Inter`, `font-size: 18px`, `line-height: 1.55`, `color: var(--ink-soft)`. Three lines; each line is its own `<span class="block">` so the line breaks are deliberate, not viewport-dependent.
- The section background is `--cream`. There is **no decoration** — no botanical SVG, no rule, no eyebrow. The restraint is the design.
- Vertical rhythm: 96px (mobile) / 128px (md) / 160px (lg) of padding above and below — the moment needs negative space around it to read as a moment.
- The moment must come **immediately after** the hero with no intervening element. If a divider tempts us, resist.

The `<LetterStagger>` primitive (delivered by plan 01) signature, for reference:

```ts
type LetterStaggerProps = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  totalDurationMs?: number;        // default 800
  perLetterDelayMs?: number;       // default totalDurationMs / chars.length
  className?: string;
  children: string;                 // text only — split into chars internally
};
```

---

### 4.4 `components/marketing/home/Pillars.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import FadeUp from "@/components/motion/FadeUp";
import type { Pillar } from "@/lib/home-data";

export default function Pillars({ items }: { items: Pillar[] }) {
  return (
    <section
      aria-labelledby="pillars-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container>
        <div className="mb-16 max-w-2xl">
          <Eyebrow className="text-mauve">Three quiet focuses</Eyebrow>
          <h2
            id="pillars-heading"
            className="mt-4 font-epilogue text-h1 tracking-tight-h1 text-ink"
          >
            Where most of the work happens.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10 lg:gap-16">
          {items.map((pillar, i) => (
            <FadeUp key={pillar.slug} delayMs={i * 80}>
              <article className="flex flex-col">
                <div className="mb-6 h-20 w-20">
                  <Image
                    src={pillar.illustration}
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full"
                  />
                </div>
                <Eyebrow className="text-ink-soft">
                  {pillar.eyebrow}
                </Eyebrow>
                <h3 className="mt-3 font-epilogue text-h2 text-ink">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-body text-ink-soft leading-relaxed">
                  {pillar.description}
                </p>
                <Link
                  href={pillar.href}
                  className="mt-6 inline-flex items-baseline gap-2 text-small font-medium text-mauve underline-offset-4 hover:underline hover:text-mauve-deep"
                >
                  Read more
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

Background is `--cream-deep` to subtly delineate from the moment band above and the featured ebook below. Each pillar fades up on scroll with an 80ms cascading delay.

---

### 4.5 `components/marketing/home/FeaturedEbook.tsx`

```tsx
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import FadeUp from "@/components/motion/FadeUp";

export default function FeaturedEbook() {
  return (
    <section
      aria-labelledby="featured-ebook-heading"
      className="bg-cream py-24 md:py-32"
    >
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
        {/* LEFT — cover mockup */}
        <FadeUp className="md:col-span-6 md:order-1">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md">
            <Image
              src="/media/library/pcos-cover.webp"
              alt="The PCOS Guidebook by Dr. Ruhma — cover"
              fill
              sizes="(max-width: 768px) 80vw, 40vw"
              className="object-contain drop-shadow-[0_30px_60px_rgba(26,26,26,0.18)]"
            />
          </div>
        </FadeUp>

        {/* RIGHT — copy */}
        <FadeUp delayMs={120} className="md:col-span-6 md:order-2">
          <Eyebrow className="text-mauve">Guidebook · 02</Eyebrow>
          <h2
            id="featured-ebook-heading"
            className="mt-4 font-epilogue text-h1 tracking-tight-h1 text-ink"
          >
            The PCOS Guidebook.
          </h2>
          <p className="mt-6 max-w-lg text-body text-ink-soft leading-relaxed">
            The most-asked questions, answered plainly. Sixty pages on what is
            actually happening with PCOS, what to eat, and what to stop
            blaming yourself for.
          </p>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-epilogue text-h2 text-ink">PKR 1,500</span>
            <span className="text-small text-ink-soft line-through">
              PKR 3,000
            </span>
            <span className="rounded-full bg-shell px-3 py-1 text-caption text-mauve-deep">
              Save 50%
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/library/pcos-guidebook" variant="primary">
              Open the guidebook
            </Button>
            <Button href="/library" variant="ghost">
              Browse the library
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
```

Note: the homepage **does not** link to an external `buyUrl`. It links to the local `/library/pcos-guidebook` editorial detail page, which is where the external buy CTA lives (plan 08). Keeping the homepage internal preserves the editorial flow.

The "alternating layout" direction-reversal lives in CSS — for this single homepage placement, image-left / copy-right is the rule. The `/library` index uses a real alternating pattern (plan 08).

---

### 4.6 `components/marketing/home/AboutTeaser.tsx`

```tsx
import Image from "next/image";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import FadeUp from "@/components/motion/FadeUp";

export default function AboutTeaser() {
  return (
    <section
      aria-labelledby="about-teaser-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
        <FadeUp className="md:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-shell">
            <Image
              src="/media/home/about-portrait.webp"
              alt="Dr. Ruhma in her clinic"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </FadeUp>

        <FadeUp delayMs={120} className="md:col-span-7 md:pl-8">
          <Eyebrow className="text-mauve">About Dr. Ruhma</Eyebrow>
          <h2
            id="about-teaser-heading"
            className="mt-4 font-epilogue text-h1 tracking-tight-h1 text-ink"
          >
            My mission is to make you shine from inside.
          </h2>
          <div className="mt-8 space-y-5 text-body text-ink-soft leading-relaxed">
            <p>
              I am a clinical dietitian based in Lahore. For the last several
              years I have worked with women navigating PCOS, thyroid
              imbalance, sustainable weight loss, and the slow daily work of
              eating in a way that fits a real life.
            </p>
            <p>
              My approach is unhurried. We start with what is actually
              happening in your body and your week, and we build from there
              — small, evidence-based, repeatable.
            </p>
          </div>
          <div className="mt-10">
            <Button href="/about" variant="ghost">
              Read more about Dr. Ruhma →
            </Button>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
```

The two paragraphs are the only short About copy on this page; longer biography lives on `/about` (plan 05).

---

### 4.7 `components/marketing/home/Testimonials.tsx`

> **Important content note**: I checked the WP backup's "quote" PNGs (`uploads/2024/02/Copy-of-quote*.png`, `quote*.png`). They are **not testimonial graphics** — they are decorative Instagram-style marketing tiles ("Manage Your Weight With Your Favourite Foods", "Myth / Fact", etc.). The site's existing Elementor templates expose author-name fields populated with placeholder data ("John Doe", "Jane Smith") not real client quotes.
>
> **There are no real client testimonials in the WP backup.** The three quotes shipped here are realistic placeholders written in the practitioner's voice and audience register; they need confirmation from Dr. Ruhma before launch. Mark them with a `// TODO(content): confirm with Dr. Ruhma — placeholder` comment in `lib/home-data.ts`. Pull real testimonials from her IG DMs, WhatsApp, or post-program follow-up forms.

```tsx
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import FadeUp from "@/components/motion/FadeUp";
import type { Testimonial } from "@/lib/home-data";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-cream py-24 md:py-32"
    >
      <Container>
        <div className="mb-16 max-w-xl">
          <Eyebrow className="text-mauve">In their own words</Eyebrow>
          <h2
            id="testimonials-heading"
            className="mt-4 font-epilogue text-h1 tracking-tight-h1 text-ink"
          >
            What a few months can do.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {items.map((t, i) => (
            <FadeUp key={t.id} delayMs={i * 100}>
              <figure className="flex h-full flex-col">
                <blockquote
                  cite={t.context ?? undefined}
                  className="font-epilogue text-[24px] leading-[1.35] tracking-[-0.015em] text-ink"
                >
                  <span aria-hidden="true" className="text-mauve">
                    “
                  </span>
                  {t.quote}
                  <span aria-hidden="true" className="text-mauve">
                    ”
                  </span>
                </blockquote>
                <figcaption className="mt-6 text-caption text-ink-soft">
                  <span className="font-medium text-ink">{t.name}</span>
                  {t.detail && (
                    <>
                      <span className="mx-2" aria-hidden="true">
                        ·
                      </span>
                      <span>{t.detail}</span>
                    </>
                  )}
                </figcaption>
              </figure>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

Real CSS-typeset blockquotes — Epilogue 24px, tracked -0.015em, `--mauve` open/close quote glyphs. **No PNGs.** No `<img>` tag in the markup. This is the per-master-plan correction.

---

### 4.8 `components/marketing/home/JournalPreview.tsx`

```tsx
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import FadeUp from "@/components/motion/FadeUp";
import type { JournalCard } from "@/lib/home-data";

export default function JournalPreview({ items }: { items: JournalCard[] }) {
  const isPlaceholder = items.every((i) => i.placeholder);

  return (
    <section
      aria-labelledby="journal-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container>
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow className="text-mauve">From the journal</Eyebrow>
            <h2
              id="journal-heading"
              className="mt-4 font-epilogue text-h1 tracking-tight-h1 text-ink"
            >
              Reading, slowly.
            </h2>
          </div>
          <Link
            href="/journal"
            className="text-small font-medium text-mauve underline-offset-4 hover:underline hover:text-mauve-deep"
          >
            All entries →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {items.map((post, i) => (
            <FadeUp key={post.slug} delayMs={i * 80}>
              <Link
                href={post.placeholder ? "/journal" : `/journal/${post.slug}`}
                className="group block"
                aria-disabled={post.placeholder}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-shell">
                  {post.cover ? (
                    <Image
                      src={post.cover}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-epilogue text-[120px] lowercase text-ink/10">
                        soon
                      </span>
                    </div>
                  )}
                </div>
                <Eyebrow className="mt-6 text-ink-soft">
                  {post.eyebrow}
                </Eyebrow>
                <h3 className="mt-2 font-epilogue text-h2 text-ink group-hover:text-mauve-deep">
                  {post.title}
                </h3>
                <p className="mt-3 text-body text-ink-soft leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>
            </FadeUp>
          ))}
        </div>

        {isPlaceholder && (
          <p className="mt-10 text-caption text-ink-soft">
            New entries coming. The journal opens later this season.
          </p>
        )}
      </Container>
    </section>
  );
}
```

For launch, `journalPlaceholders` ships three `placeholder: true` cards so the layout exists with no data. Once plan 09 (`/journal`) lands, the homepage swaps to reading the latest 3 from the MDX content layer — the props shape is already correct.

---

### 4.9 `components/marketing/home/CtaBand.tsx`

```tsx
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function CtaBand() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container className="flex flex-col items-center text-center">
        <h2
          id="cta-heading"
          className="font-epilogue text-display tracking-tight-display text-ink max-w-3xl"
        >
          Ready when you are.
        </h2>
        <div className="mt-10">
          <Button href="/programs/consultation" variant="primary">
            Book a consultation
          </Button>
        </div>
      </Container>
    </section>
  );
}
```

That's the whole component. The single-line CTA against a `--cream-deep` band is the entire move. No subhead, no eyebrow, no decoration. The `<Footer>` from plan 02 sits directly under it.

---

### 4.10 `lib/home-data.ts`

```ts
export type Pillar = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  illustration: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail?: string;
  context?: string;
};

export type JournalCard = {
  slug: string;
  eyebrow: string;
  title: string;
  excerpt: string;
  cover?: string;
  placeholder?: boolean;
};

export const pillars: Pillar[] = [
  {
    slug: "hormonal-health",
    eyebrow: "Focus · 01",
    title: "Hormonal Health",
    description:
      "PCOS, thyroid, cortisol — the slow, evidence-based work of bringing the body back into rhythm.",
    href: "/focus/hormonal-health",
    illustration: "/illustrations/fennel.svg",
  },
  {
    slug: "weight-management",
    eyebrow: "Focus · 02",
    title: "Weight Management",
    description:
      "Sustainable change, not deprivation. Plans built around your week, your kitchen, and your taste.",
    href: "/focus/weight-management",
    illustration: "/illustrations/citrus.svg",
  },
  {
    slug: "diet-planning",
    eyebrow: "Program · 01",
    title: "Diet Planning",
    description:
      "A structured, personal program: assessment, plan, weekly check-ins, and tools you can keep.",
    href: "/programs/diet-planning",
    illustration: "/illustrations/mint.svg",
  },
];

// TODO(content): confirm all three with Dr. Ruhma — these are placeholders
// in her audience's voice. There are no real testimonials in the WP backup;
// the existing "quote" PNGs are decorative IG marketing tiles, not client
// quotes. Pull real ones from IG DMs / WhatsApp / program follow-up forms
// before launch.
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Three months in and my cycle is regular for the first time in eight years. Nothing about the plan felt like a punishment.",
    name: "S.A.",
    detail: "PCOS · Coaching Program",
  },
  {
    id: "t2",
    quote:
      "I came in wanting to lose weight and left with something more useful — a way of eating that fits my life and my family's table.",
    name: "M.K.",
    detail: "Weight Management · Lahore",
  },
  {
    id: "t3",
    quote:
      "Dr. Ruhma is the first dietitian who actually listened before prescribing. Calm, clinical, kind.",
    name: "N.R.",
    detail: "Consultation · Karachi",
  },
];

export const journalPlaceholders: JournalCard[] = [
  {
    slug: "placeholder-1",
    eyebrow: "Coming soon",
    title: "What we mean when we say 'hormonal'.",
    excerpt:
      "A plain-language unpacking of the words that get used too loosely in wellness — and what is actually going on under them.",
    placeholder: true,
  },
  {
    slug: "placeholder-2",
    eyebrow: "Coming soon",
    title: "A week of unfussy meals.",
    excerpt:
      "Seven days of the kind of cooking that holds up on a Tuesday. Pakistani pantry first, supermarket second.",
    placeholder: true,
  },
  {
    slug: "placeholder-3",
    eyebrow: "Coming soon",
    title: "On weighing yourself less.",
    excerpt:
      "Why the scale is the worst measurement of progress for most of my clients — and what to track instead.",
    placeholder: true,
  },
];
```

---

### 4.11 `lib/jsonld.ts`

```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dietitianruhma.com";

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Healthy You By Ruhma",
    url: SITE_URL,
    inLanguage: "en-PK",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/journal?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dr. Ruhma",
    jobTitle: "Clinical Dietitian",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/media/home/coach-1.webp`,
    worksFor: {
      "@type": "Organization",
      name: "Healthy You By Ruhma",
      url: SITE_URL,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    knowsAbout: [
      "Clinical dietetics",
      "PCOS",
      "Hormonal health",
      "Weight management",
      "Nutrition counseling",
    ],
    sameAs: [
      // TODO(content): confirm with Dr. Ruhma — IG, FB, LinkedIn URLs
    ],
  };
}
```

These two schemas only — no `Organization`, no `LocalBusiness`, no `Service`. Per the master plan, the homepage represents the *practitioner*, not a business entity, and we don't claim local-business attributes (hours, geo, phone) we can't substantiate. Service pages get their own `Service` schemas in plan 06.

---

## 5. Step-by-step tasks

Execute in this order. Each step is a single commit (or a tight cluster of commits).

1. **Scaffold data + JSON-LD** (`lib/home-data.ts`, `lib/jsonld.ts`).
   Type-check passes. No UI yet.
2. **Build CtaBand and Footer-adjacency**. Smallest component first; verifies `<Container>` and `<Button>` from plan 01 work as expected. Render at `/_kit/cta` for visual sanity.
3. **Build Pillars** with the three real entries from `home-data.ts`. Confirm botanical SVGs render at 80px, alt text is empty (decorative).
4. **Build AboutTeaser**. Confirm portrait crops cleanly at 4:5; if `about-portrait.webp` looks wrong, fix in plan 03 not here.
5. **Build FeaturedEbook**. Confirm cover mockup has subtle drop-shadow at desktop, no shadow on mobile (clutters small screens). Price strikethrough renders correctly.
6. **Build Testimonials**. Verify `<blockquote>` semantics, the `cite` attribute is conditionally applied, screen readers announce author + detail.
7. **Build JournalPreview** with placeholders. Confirm the "soon" placeholder thumbnail renders at the right scale; isn't accidentally clickable to a 404.
8. **Build Hero (server) + HeroPortrait (client)**. Verify only `HeroPortrait` is in the client bundle (`next build` output). Verify LCP element via Lighthouse — it should be the portrait, with `priority` honored.
9. **Build MomentBand**. The most important component. Verify against the acceptance criteria below (size, tracking, lowercase, stagger triggers once on mount, reduced-motion fallback).
10. **Compose `app/page.tsx`** importing all nine sections (eight here + the Footer in `layout.tsx`). Add `metadata` and the JSON-LD `<script>`.
11. **Run Lighthouse + axe-core locally** (`pnpm dlx @lhci/cli autorun` and `pnpm dlx @axe-core/cli http://localhost:3000`). Fix anything that drops below 95 / 0 violations.
12. **Visual review against the master plan §1 thesis** (Aesop × Cup of Jo × NYT Cooking) — explicitly check that the page reads "warm, editorial, considered" and that no section feels Elementor-templatey. If anything does, fix it before merge.

Estimated time at a comfortable pace: **2–3 working days** for the full sequence including review.

---

## 6. Acceptance criteria

A reviewer should be able to verify each of these without launching dev tools beyond DevTools / Lighthouse / axe.

**Visual**

- [ ] Hero renders with H1 in Epilogue at the H1 fluid clamp, eyebrow in mauve uppercase 12px tracked 0.16em, two CTAs (primary + ghost), portrait full-bleed to viewport right edge on desktop ≥ 1024px, stacked on mobile.
- [ ] The "nourish" moment renders at `clamp(64px, 12vw, 220px)` lowercase, font-weight 600, letter-spacing -0.04em, line-height 0.9, on a `--cream` background with no decoration.
- [ ] The 3-line manifesto sits beneath the word in Inter italic 18px, line-height 1.55, color `--ink-soft`, with deliberate `<span class="block">` line breaks (not viewport-driven).
- [ ] Pillars: 3-column on desktop, single column on mobile, each with botanical SVG ≤ 80px, eyebrow, h3 in Epilogue, description in Inter 17px, "Read more →" link in mauve.
- [ ] Featured ebook: cover left (with drop-shadow ≥ md), copy right, price PKR 1,500 with PKR 3,000 strikethrough and "Save 50%" chip in `--shell`.
- [ ] About teaser: 4:5 portrait left, 2 paragraphs right, ghost CTA "Read more about Dr. Ruhma →".
- [ ] Testimonials: 3 columns, real CSS-typeset `<blockquote>`s in Epilogue 24px tracked -0.015em, mauve open/close quotes, attribution in caption style. **No PNG images** in this section's DOM.
- [ ] Journal preview: 3 placeholder cards with "soon" type-treatment thumbnails; "All entries →" link top-right.
- [ ] CTA band: single line "Ready when you are." in Display, primary button below.
- [ ] Section background rhythm: `cream → cream → cream-deep → cream → cream-deep → cream → cream-deep → cream-deep` (hero, moment, pillars, featured ebook, about teaser, testimonials, journal, cta).

**Motion**

- [ ] Hero portrait reveals via clip-path wipe over 1.2s on initial mount, custom cubic-bezier (per plan 01 `<ImageReveal>` defaults). Does not re-animate on route re-entry.
- [ ] MomentBand letter stagger triggers **once on mount**, total ~800ms, ~50ms per-letter delay. Verifiable by reloading the page; the stagger plays. Verifiable by scrolling away and back; it does not re-play.
- [ ] All other sections (Pillars, FeaturedEbook, AboutTeaser, Testimonials, JournalPreview) fade up 16px on scroll-into-view, 600ms, ease-out, with a per-card cascade delay where multi-card.
- [ ] `prefers-reduced-motion: reduce` in DevTools rendering tab disables all three motions; content remains fully visible and laid out.

**Performance**

- [ ] Lighthouse Performance ≥ 95 on the homepage (mobile profile).
- [ ] LCP < 1.8s on simulated 3G; LCP element is the hero portrait (or H1 — both acceptable).
- [ ] CLS < 0.02. The portrait reserves its aspect-ratio box, fonts load via `next/font` with no swap shift.
- [ ] Initial client JS payload for the homepage route ≤ 80 kB gzipped (only `HeroPortrait`, `MomentBand`, `FadeUp` instances, motion runtime). Verify with `next build` analytics.

**Accessibility**

- [ ] axe-core: 0 violations.
- [ ] Every `<section>` has a labelled landmark (`aria-labelledby` or `aria-label`).
- [ ] Heading order on the page: H1 → H2 (×7, one per section). No skipped levels.
- [ ] Decorative images (botanical SVGs, hero quotation glyphs) have `alt=""` or `aria-hidden="true"`.
- [ ] All interactive controls reachable by keyboard, focus ring visible against `--cream` and `--cream-deep` backgrounds (mauve 2px ring per plan 01).
- [ ] Color contrast: mauve on cream ≥ AA for 14px+ text (verify in plan 01 — contractually 4.5:1).

**SEO**

- [ ] `app/page.tsx` exports `metadata` with `title`, `description`, `openGraph`, `twitter`, `alternates.canonical: "/"`.
- [ ] JSON-LD `<script>` is present in the rendered HTML containing `WebSite` + `Person` schemas. Validates via Google Rich Results Test (no errors, warnings allowed).
- [ ] Page is included in `sitemap.xml` (delivered by plan 02).

**Content**

- [ ] All copy on the page is final or marked `// TODO(content): ...` in the data file. The three testimonials are explicitly flagged for confirmation.
- [ ] No Lorem Ipsum.
- [ ] No image with a filename containing `placeholder` or `lorem` is referenced.

---

## 7. Out of scope

This plan covers only the homepage. Explicitly out of scope:

- **Other pages** (About, Services, Programs, Focus, Library, Journal, Contact, Legal) — separate plans 05, 06, 07, 08, 09, 10, 11.
- **The Footer** — delivered by plan 02; this plan only confirms it sits under `<CtaBand>`.
- **The Nav** — same.
- **MDX content authoring beyond the homepage** — the journal placeholder entries here do *not* become MDX files; real journal posts land via plan 09.
- **Dynamic OG image generation** — plan 13. Until then, the homepage references a static `/og-default.png` fallback.
- **Newsletter signup** — deferred to launch per master plan §7. The homepage does not have a newsletter form.
- **Analytics events** — plan 14 wires Vercel Analytics + Plausible. The homepage CTAs are plain `<a>` tags here; event tracking is added later via the layout-level analytics provider.
- **A/B testing of headlines or CTAs** — not part of v1.
- **Any motion beyond the three defined in master §1** — non-negotiable. Hover micro-interactions on links and buttons are owned by plan 01's primitives, not invented here.
- **Localization** — site is English-only at launch (master plan implicit). No `next-intl` wiring on this page.

---

*End of plan 04.*
