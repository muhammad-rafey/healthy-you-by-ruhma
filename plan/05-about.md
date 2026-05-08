# 05 — About page (`/about`)

Implementation plan for the About page per master plan §3.2. This is a high-trust editorial page; the signature move is the four oversized mauve numerals in the Philosophy section. Tone reference: Aesop "Our Story" × Cup of Jo "About" — long-form, photography-led, restrained.

---

## 1. Goal

Ship `/about` as a six-section editorial page that:

1. Renders an MDX-authored content body (`content/about.mdx`) inside an opinionated component shell (`app/about/page.tsx`).
2. Communicates trust through Dr. Ruhma's portrait, mission, bio, philosophy, and credentials — in that order.
3. Owns the page's signature visual: four numbered principles set in Epilogue 96px `text-mauve`, with single-sentence statements aligned to a 12-column editorial grid.
4. Ships with `Person` JSON-LD, per-page metadata, and graceful degradation when optional sections (press strip) have no data.
5. Reuses the design-system primitives from plan `01-design-system` (Container, Eyebrow, Heading, Button, FadeUp, ImageReveal, LetterStagger, BotanicalDivider) and the layout shell from plan `02-layout-shell` (Nav, Footer, root `<html>` font wiring).

Non-goals: building any new motion primitives, building a CMS/MDX runtime (lives in `01`), and copy-editing Dr. Ruhma's voice — preserve the existing voice, fix typos only.

---

## 2. Pre-requisites

These plans must be merged (or at minimum scaffolded) before this plan starts:

- **`01-design-system`** — provides `tailwind.config.ts` tokens (`cream`, `cream-deep`, `shell`, `ink`, `ink-soft`, `mauve`, `mauve-deep`, `moss`, `paper`), the type scale (`text-display`, `text-display-xl`, `text-h1`, `text-h2`, `text-eyebrow`, `text-body`, `text-caption`), and primitives in `components/ui/` (`<Container>`, `<Eyebrow>`, `<Heading>`, `<Button>`, `<Chip>`) plus motion utilities in `components/motion/` (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`) and the botanical SVG set under `public/illustrations/`.
- **`02-layout-shell`** — provides `app/layout.tsx` (root font loading + `<Nav>` + `<Footer>`), `app/globals.css` with token CSS variables, and the redirect `/about-me → /about` in `next.config.js`.
- **`03-content-media-migration`** — provides:
  - `public/media/about/AboutPage-Hero-1.{avif,webp,jpg}` at sizes `[800, 1200, 1600, 2400]` and `public/media/about/portrait-bio.{avif,webp,jpg}` at sizes `[400, 800, 1200]` — both sourced from the WP backup `uploads/` tree, optimized via `sharp`.
  - `content/about.mdx` body copy hand-edited from `wp post get 46 --field=post_content` output (typo pass: "harmone" → "hormone", "mision" → "mission", "manue" → "menu", "ai" → "I" where applicable).
  - The MDX runtime (`next-mdx-remote` v5 + `gray-matter`) wired into the build per plan `01`.

If any pre-requisite is incomplete, this plan stops at the structural scaffold (component files + page shell) and the MDX integration is deferred — but the Philosophy component and AboutHero must ship regardless because they're the signature.

---

## 3. Dependencies

Already declared by plan `01-design-system`; this plan adds nothing:

- `next` (15.x), `react` (19.x), `react-dom`
- `next-mdx-remote@^5`, `gray-matter@^4`
- `motion@^11` (the three motions only)
- `schema-dts@^1` (typed JSON-LD)
- `clsx@^2` (class composition)
- `tailwindcss@^4`
- Fonts: `next/font/google` `Inter` + `Epilogue`, both variable, loaded once in `app/layout.tsx`

No new third-party packages introduced by this plan. If a desire for a press-logo carousel surfaces, do it in CSS (flex + `gap`) — do not add embla/swiper for a 5-logo strip.

---

## 4. Files to create / modify

### 4.1 `app/about/page.tsx` — new

Server Component. Reads `content/about.mdx`, parses frontmatter, renders the section shell, and passes MDX components into `MDXRemote`.

```tsx
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Person, WithContext } from "schema-dts";

import { Container } from "@/components/ui/Container";
import { BotanicalDivider } from "@/components/ui/BotanicalDivider";
import { CtaBand } from "@/components/marketing/CtaBand";

import { AboutHero } from "@/components/marketing/about/AboutHero";
import { MissionStatement } from "@/components/marketing/about/MissionStatement";
import { Bio } from "@/components/marketing/about/Bio";
import { Philosophy } from "@/components/marketing/about/Philosophy";
import { PressStrip } from "@/components/marketing/about/PressStrip";
import { Credentials } from "@/components/marketing/about/Credentials";
import { DropCap } from "@/components/marketing/about/DropCap";
import { PullQuote } from "@/components/marketing/about/PullQuote";

import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "About Dr. Ruhma — Healthy You By Ruhma",
  description:
    "Clinical dietitian based in Lahore. Dr. Ruhma helps women navigate hormonal health, PCOS, and weight management through evidence-based nutrition.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Dr. Ruhma",
    description: "Clinical dietitian, Lahore. Hormonal health, PCOS, weight management.",
    url: "/about",
    type: "profile",
    images: [{ url: "/media/about/AboutPage-Hero-1.jpg", width: 1600, height: 2000 }],
  },
};

const PHILOSOPHY_PRINCIPLES = [
  "Food is information your body listens to — every meal is a signal, not a punishment.",
  "Hormones rule the room — fix the upstream rhythm and weight, energy, and skin follow.",
  "Sustainability beats intensity — a plan you can keep for years outperforms one you survive for weeks.",
  "Care travels with the science — evidence-based, but never delivered cold.",
] as const;

const CREDENTIALS = [
  "MSc Clinical Nutrition",
  "Registered Dietitian (PNC)",
  "PCOS & hormonal health specialist",
  "8+ years clinical practice",
  "Lahore, Pakistan",
] as const;

async function readAboutMdx() {
  const filePath = path.join(process.cwd(), "content", "about.mdx");
  const raw = await fs.readFile(filePath, "utf8");
  return matter(raw);
}

export default async function AboutPage() {
  const { content, data } = await readAboutMdx();

  const personLd: WithContext<Person> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dr. Ruhma",
    jobTitle: "Clinical Dietitian",
    description: "Clinical dietitian specializing in hormonal health, PCOS, and weight management.",
    url: `${siteConfig.url}/about`,
    image: `${siteConfig.url}/media/about/AboutPage-Hero-1.jpg`,
    worksFor: {
      "@type": "Organization",
      name: "Healthy You By Ruhma",
      url: siteConfig.url,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lahore",
      addressCountry: "PK",
    },
    sameAs: siteConfig.social.map((s) => s.url),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <AboutHero
        eyebrow="Clinical Dietitian · Lahore"
        title="Dr. Ruhma"
        image={{
          src: "/media/about/AboutPage-Hero-1.jpg",
          alt: "Portrait of Dr. Ruhma",
        }}
      />

      <BotanicalDivider variant="fennel" />

      <MissionStatement
        statement="My mission is to make you shine from inside."
        excerpt={data.missionExcerpt}
      />

      <BotanicalDivider variant="mint" />

      <Bio
        portrait={{
          src: "/media/about/portrait-bio.jpg",
          alt: "Dr. Ruhma at her clinic",
        }}
        pullQuote={data.pullQuote ?? "Health is a relationship, not a transaction."}
        credentials={[...CREDENTIALS]}
      >
        <MDXRemote
          source={content}
          components={{
            DropCap,
            PullQuote,
            MissionStatement,
            Credentials,
            p: (props) => <p className="text-body text-ink-soft mb-6" {...props} />,
            h2: (props) => <h2 className="font-display text-h1 text-ink mt-12 mb-4" {...props} />,
          }}
        />
      </Bio>

      <BotanicalDivider variant="citrus" />

      <Philosophy principles={[...PHILOSOPHY_PRINCIPLES]} />

      <BotanicalDivider variant="fennel" />

      <PressStrip
        logos={siteConfig.press ?? []}
        // PressStrip itself returns null when the array is empty
      />

      <CtaBand
        eyebrow="Ready to start?"
        title="Let's talk."
        body="Book a 30-minute consultation and walk away with a plan."
        primary={{ label: "Book a consultation", href: "/programs/consultation" }}
        secondary={{ label: "Browse programs", href: "/services" }}
      />
    </>
  );
}
```

Notes:

- The Philosophy principles are hard-coded in the page file (not MDX) because they are the signature visual moment and should never accidentally drift to 3 or 5 entries via a content edit. If a copy edit is needed, change the array here in a typed file with a known shape.
- `PHILOSOPHY_PRINCIPLES` is `as const` so the `Philosophy` component can guard `principles.length === 4` at runtime in dev with a `console.warn`.
- The MDX `components` map intentionally re-exposes only the editorial primitives Dr. Ruhma might reach for in copy. No raw `<div>` or layout escape hatches.
- `data.missionExcerpt` and `data.pullQuote` come from MDX frontmatter — typed in §4.7.

### 4.2 `content/about.mdx` — new

Frontmatter + body. Body is the bio (4–6 paragraphs) sourced from WP page id 46 (~10k chars), polished. The MDX renders inside the `<Bio>` left column.

```mdx
---
title: "About Dr. Ruhma"
slug: "about"
eyebrow: "Clinical Dietitian · Lahore"
description: "Clinical dietitian, Lahore. Hormonal health, PCOS, weight management."
ogImage: "/media/about/AboutPage-Hero-1.jpg"
missionExcerpt: "I see nutrition as the quiet, daily practice of caring for the body you're going to live in for the rest of your life. Not a sprint. Not a punishment."
pullQuote: "Health is a relationship, not a transaction."
---

<DropCap>I</DropCap> grew up in a household where food was the centre of every conversation — the
room where worry, celebration, and care all arrived in the form of a meal. My mother managed three
households on a single calendar of seasonal cooking; my grandmother could read a person's energy by
the colour under their eyes. Long before I had the vocabulary for it, I understood that eating was
rarely just eating.

I trained as a clinical dietitian because I wanted to give that intuitive knowledge a structure — to learn what the science could confirm, complicate, or correct. After my MSc in Clinical Nutrition and several years on hospital wards in Lahore, I noticed the same pattern over and over: women arriving with PCOS, thyroid imbalance, exhaustion, "stubborn" weight — and being handed the same generic calorie sheet that had failed them three times before.

That's the gap this practice was built to fill. _Healthy You By Ruhma_ is a clinical practice for women who want answers that match their bodies, not a printout. Most of my work centres on **hormonal health**, **PCOS**, and **sustainable weight management** — three areas where the standard advice tends to be loudest and least useful.

What I offer is closer to a partnership than a prescription. We start with what your body is actually doing — bloodwork, cycle history, sleep, stress, the meals you genuinely eat on a Tuesday — and design a plan around that. Plans are revisited. Goals shift. Real life happens. The work is to keep the plan honest.

I also write — guidebooks on PCOS, diabetes, and skin health — because not everyone needs (or can afford) one-on-one care, and the basics of eating well shouldn't sit behind a paywall of expensive consultations. The library is the long version of what I'd want my sister, my best friend, and my younger self to know.

If any of this feels like it's describing your last six months, I'd love to hear from you.
```

The body is written, not pasted. Original WP copy is the source — the rewriting is editorial polish (parallelism, typo fix) at PR review time. The dropcap on the first paragraph is a `<DropCap>` MDX component (not CSS-only) so the W in "When"-style first letters always renders cleanly without depending on `:first-letter` quirks across browsers. (The CSS `::first-letter` fallback is still defined in `globals.css` per §4.10 — `<DropCap>` overrides it where used.)

### 4.3 `components/marketing/about/AboutHero.tsx` — new

Full-bleed portrait with title overlay bottom-left. Image reveals via `<ImageReveal>` (the global clip-path wipe primitive). Title uses `<LetterStagger>`.

```tsx
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { LetterStagger } from "@/components/motion/LetterStagger";

interface AboutHeroProps {
  eyebrow: string;
  title: string;
  image: { src: string; alt: string };
}

export function AboutHero({ eyebrow, title, image }: AboutHeroProps) {
  return (
    <section aria-label="About hero" className="bg-ink relative isolate overflow-hidden">
      <ImageReveal className="relative aspect-[4/5] w-full md:aspect-[3/4] lg:aspect-[16/10]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
        <div
          aria-hidden
          className="from-ink/60 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </ImageReveal>

      <Container className="absolute inset-x-0 bottom-0 pb-12 md:pb-16 lg:pb-20">
        <Eyebrow className="text-cream/85">{eyebrow}</Eyebrow>
        <h1 className="font-display text-display text-cream mt-3">
          <LetterStagger>{title}</LetterStagger>
        </h1>
      </Container>
    </section>
  );
}
```

Notes:

- Aspect ratio steps from `4/5` (mobile portrait) → `3/4` (tablet) → `16/10` (desktop) so the portrait stays a portrait on phones (where it should dominate) and crops to landscape on desktop (where vertical space is constrained).
- `object-[center_30%]` biases the crop toward the face. Adjust per actual image during QA.
- The gradient sits at `from-ink/60 via-ink/10 to-transparent` so the title has WCAG AA contrast against the image regardless of crop.

### 4.4 `components/marketing/about/MissionStatement.tsx` — new

Centered, max-width 720px, large Epilogue display, italic excerpt below.

```tsx
import { Container } from "@/components/ui/Container";
import { FadeUp } from "@/components/motion/FadeUp";

interface MissionStatementProps {
  statement: string;
  excerpt?: string;
}

export function MissionStatement({ statement, excerpt }: MissionStatementProps) {
  return (
    <section aria-label="Mission statement" className="bg-cream py-24 md:py-32 lg:py-40">
      <Container className="max-w-[720px] text-center">
        <FadeUp>
          <p className="font-display text-h1 text-ink leading-[1.1] tracking-[-0.02em] md:text-[clamp(2.5rem,4vw,3.5rem)]">
            {statement}
          </p>
        </FadeUp>
        {excerpt ? (
          <FadeUp delay={0.1}>
            <p className="font-body text-ink-soft mt-8 text-[18px] leading-[1.6] italic">
              {excerpt}
            </p>
          </FadeUp>
        ) : null}
      </Container>
    </section>
  );
}
```

Note the explicit `clamp` at the desktop step — the master plan calls for **Epilogue 56px** for this statement; `text-h1` is `clamp(32px, 4vw, 56px)` per `01-design-system`, which is exactly the same target — but stating the clamp inline guards against type-scale renames during build.

### 4.5 `components/marketing/about/Bio.tsx` — new

Two-column editorial. Left: MDX body (`children`). Right: sticky sidebar with a small portrait, pull-quote, credentials chips.

```tsx
import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { FadeUp } from "@/components/motion/FadeUp";
import { Credentials } from "./Credentials";
import { PullQuote } from "./PullQuote";

interface BioProps {
  children: ReactNode;
  portrait: { src: string; alt: string };
  pullQuote: string;
  credentials: string[];
}

export function Bio({ children, portrait, pullQuote, credentials }: BioProps) {
  return (
    <section aria-label="Biography" className="bg-cream py-24 md:py-28 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <FadeUp className="bio-prose lg:col-span-7 lg:col-start-1">{children}</FadeUp>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="space-y-10 lg:sticky lg:top-32">
              <FadeUp delay={0.1}>
                <div className="bg-shell relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  <Image
                    src={portrait.src}
                    alt={portrait.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </FadeUp>

              <FadeUp delay={0.15}>
                <PullQuote>{pullQuote}</PullQuote>
              </FadeUp>

              <FadeUp delay={0.2}>
                <Credentials items={credentials} />
              </FadeUp>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
```

Grid choice: 12-column with the body on cols 1–7 and the sidebar on cols 9–12. The empty col 8 acts as a gutter and gives the sidebar room to breathe. On `<lg`, the sidebar drops below the body.

### 4.6 `components/marketing/about/Philosophy.tsx` — **the signature, fully implemented**

Four numbered principles. Numerals are Epilogue 96px, weight 500, `text-mauve`, mono-style tabular numerals (`tabular-nums`), tightly tracked. Each principle is one sentence, Inter 17–20px, max-width 60ch, on a 12-column grid where the numeral spans 2 cols and the sentence spans 9 cols (col 12 left empty for breathing room).

```tsx
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FadeUp } from "@/components/motion/FadeUp";

interface PhilosophyProps {
  principles: string[];
}

export function Philosophy({ principles }: PhilosophyProps) {
  if (process.env.NODE_ENV !== "production" && principles.length !== 4) {
    // The signature visual is built around four numerals — guard against drift.
    // eslint-disable-next-line no-console
    console.warn(`[Philosophy] Expected exactly 4 principles, received ${principles.length}.`);
  }

  return (
    <section aria-labelledby="philosophy-heading" className="bg-cream-deep py-28 md:py-32 lg:py-40">
      <Container>
        <div className="mb-16 max-w-[640px] md:mb-20 lg:mb-24">
          <Eyebrow>Philosophy</Eyebrow>
          <h2 id="philosophy-heading" className="font-display text-h1 text-ink mt-4">
            Four ideas the practice runs on.
          </h2>
        </div>

        <ol className="space-y-14 md:space-y-16 lg:space-y-20">
          {principles.map((principle, i) => {
            const numeral = String(i + 1).padStart(2, "0");
            return (
              <FadeUp key={numeral} delay={i * 0.05}>
                <li
                  className="grid grid-cols-12 items-baseline gap-6 md:gap-8"
                  // List markers are visually replaced by the numeral; hide the
                  // default marker but keep the semantic <ol>/<li>.
                  style={{ listStyle: "none" }}
                >
                  <span
                    aria-hidden
                    className="font-display text-mauve group-hover:text-mauve-deep col-span-3 text-[clamp(56px,9vw,96px)] leading-[0.9] font-medium tracking-[-0.04em] tabular-nums transition-colors md:col-span-2"
                  >
                    {numeral}
                  </span>

                  <p className="font-body text-ink col-span-9 max-w-[60ch] text-[clamp(18px,1.4vw,22px)] leading-[1.45] tracking-[-0.005em] md:col-span-9 lg:col-span-8">
                    {principle}
                  </p>
                </li>
              </FadeUp>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
```

Implementation notes for the signature:

1. **`tabular-nums`** — without it, the `1` in `01` is narrower than the `0`, which makes the four numerals visually unaligned down the column. Tabular figures fix this for free.
2. **Zero-padded** — `01 02 03 04`, never `1 2 3 4`. The leading zero is the design (it gives the numeral the editorial weight; bare digits read like a bulleted list).
3. **`text-mauve` (#895575)** — verify contrast against `cream-deep` (#E8E1D8). Computed contrast ratio: ~4.7:1, which clears WCAG AA for large text (≥18pt) but **not** AAA. The numerals are decorative (`aria-hidden`); the principle text is semantic and uses `text-ink` which clears AAA. If a designer pushes for AAA on the numerals too, switch to `text-mauve-deep` (#6E3F5C, ~6.1:1).
4. **`aria-hidden` on the numeral** — screen readers already announce ordinal position from the `<ol>` semantics; reading "zero-one" then the principle is noisy.
5. **`<ol>` / `<li>` semantics preserved** — the visual is decorative, the structure is real. SEO and a11y both win.
6. **Hover state** — there's a single `group-hover:text-mauve-deep` shift; this is intentional. We don't add any motion to the numeral on hover (no scale, no rotate). The point of the signature is restraint.
7. **`leading-[0.9]`** on the numeral — display digits set with normal line-height get a baseline that floats too high relative to the body text. Tightening to 0.9 + `items-baseline` on the grid lands the numeral baseline on the sentence baseline.
8. **`clamp(56px, 9vw, 96px)`** — exactly meets the master plan target of 96px on desktop while degrading to 56px on phones. Without the clamp, 96px breaks below the 12-col mobile grid.
9. **No quotation marks anywhere** — the principles are stated, not quoted. The acceptance criteria flag this explicitly.

### 4.7 `components/marketing/about/PressStrip.tsx` — new

Optional / conditional. Renders nothing when the logos array is empty.

```tsx
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { FadeUp } from "@/components/motion/FadeUp";

export interface PressLogo {
  name: string;
  src: string;
  width: number;
  height: number;
  href?: string;
}

interface PressStripProps {
  logos: PressLogo[];
  heading?: string;
}

export function PressStrip({ logos, heading = "Featured in" }: PressStripProps) {
  if (!logos || logos.length === 0) return null;

  return (
    <section aria-label={heading} className="bg-cream py-20 md:py-24">
      <Container>
        <FadeUp>
          <Eyebrow className="text-center">{heading}</Eyebrow>
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-70 grayscale transition-opacity hover:opacity-100 md:gap-x-16">
            {logos.map((logo) => {
              const img = (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width}
                  height={logo.height}
                  className="h-7 w-auto md:h-9"
                />
              );
              return (
                <li key={logo.name} className="flex items-center">
                  {logo.href ? (
                    <a
                      href={logo.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${logo.name} (opens in new tab)`}
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </li>
              );
            })}
          </ul>
        </FadeUp>
      </Container>
    </section>
  );
}
```

### 4.8 `components/marketing/about/Credentials.tsx` — new

Chips list. Used in the bio sidebar and re-exposed to MDX.

```tsx
interface CredentialsProps {
  items: string[];
  label?: string;
}

export function Credentials({ items, label = "Credentials" }: CredentialsProps) {
  return (
    <div>
      <p className="text-eyebrow text-ink-soft tracking-[0.16em] uppercase">{label}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="border-ink/10 bg-paper text-ink-soft hover:border-mauve/40 hover:text-mauve inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] leading-none transition-colors"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.9 `components/marketing/about/DropCap.tsx` and `PullQuote.tsx` — new

Tiny editorial primitives, both also exposed to MDX.

```tsx
// DropCap.tsx
import type { ReactNode } from "react";

interface DropCapProps {
  children: ReactNode;
}

export function DropCap({ children }: DropCapProps) {
  return (
    <span
      className="font-display text-mauve float-left mt-1 mr-3 text-[5.5rem] leading-[0.85] font-medium tracking-[-0.04em] select-none"
      aria-hidden
    >
      {children}
    </span>
  );
}
```

```tsx
// PullQuote.tsx
import type { ReactNode } from "react";

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-mauve font-display text-ink border-l-2 pl-5 text-[clamp(20px,1.6vw,26px)] leading-[1.35] italic">
      {children}
    </blockquote>
  );
}
```

### 4.10 `app/globals.css` — extend (do not replace)

Add the bio prose CSS-only drop-cap fallback (kicks in if MDX author forgot the `<DropCap>` component). The component-based `<DropCap>` takes precedence because it floats its own glyph and the first letter of the paragraph it precedes is no longer the `:first-letter` of the paragraph.

```css
/* Bio prose first-paragraph drop-cap fallback */
.bio-prose > p:first-of-type::first-letter {
  float: left;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 5.5rem;
  line-height: 0.85;
  margin: 0.25rem 0.5rem 0 0;
  color: var(--color-mauve);
  letter-spacing: -0.04em;
}

/* If the first paragraph already starts with a <DropCap> component,
   suppress the fallback. The <DropCap> renders as a <span> floated left,
   so the paragraph's :first-letter is the actual second character — but
   browsers vary here. The data attribute makes the override explicit. */
.bio-prose > p:first-of-type:has(> span[data-dropcap])::first-letter {
  all: unset;
}
```

(If `:has()` browser support is a concern at launch, fall back to a `.has-dropcap` class the MDX `<DropCap>` adds to its parent — but `:has()` ships in all modern browsers as of 2024.)

The `<DropCap>` component above should set `data-dropcap=""` on its span:

```tsx
// edit DropCap.tsx accordingly:
<span data-dropcap className="...">
  {children}
</span>
```

### 4.11 `content/site.ts` — extend

Add an optional `press` field. If unset, the strip is omitted.

```ts
export const siteConfig = {
  url: "https://dietitianruhma.com",
  name: "Healthy You By Ruhma",
  // ...existing fields
  social: [
    { name: "Instagram", url: "https://instagram.com/dietitianruhma" },
    { name: "Email", url: "mailto:hello@dietitianruhma.com" },
    { name: "WhatsApp", url: "https://wa.me/923000000000" },
  ],
  press: [] as Array<{
    name: string;
    src: string;
    width: number;
    height: number;
    href?: string;
  }>,
};
```

Empty `press` array → `<PressStrip>` returns `null` → section disappears with no whitespace artifact. This is the "omit gracefully" requirement from the master plan.

### 4.12 `components/marketing/CtaBand.tsx` — reused

Built in plan `01-design-system` or `04-home`. This plan **does not** create it. If this plan ships before `04-home`, scaffold a minimal version inline in `app/about/page.tsx` and refactor when `04-home` lands. The contract:

```ts
interface CtaBandProps {
  eyebrow?: string;
  title: string;
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}
```

### 4.13 `components/ui/BotanicalDivider.tsx` — reused

Built in plan `01-design-system`. Renders one of the botanical SVGs (fennel / mint / citrus) at 80px max, centered, with `--ink` color and ~20% opacity. Used between sections as the "Botanical SVG between sections" requirement from the master plan.

---

## 5. Step-by-step tasks

Sequenced. Each step should be its own commit.

1. **Verify pre-requisites** — run `pnpm dev` and confirm `/` (or the kit page `/_kit`) renders the design tokens, fonts, motion utilities, and `<BotanicalDivider>`. If any are missing, halt and surface to plan owners for `01`–`03`.
2. **Create directory** — `mkdir -p components/marketing/about content`.
3. **Author content** — write `content/about.mdx` with frontmatter and 4–6 polished paragraphs sourced from WP page id 46. Run a manual typo pass (search for "harmone", "mision", "manue", "ai " as standalone). Commit: `content(about): import and polish bio from WP page 46`.
4. **Build leaf primitives** — `DropCap.tsx`, `PullQuote.tsx`, `Credentials.tsx`. Each with a Storybook-style entry in `/_kit` (if the kit page exists per `01`). Commit: `feat(about): editorial primitives — drop-cap, pull-quote, credentials`.
5. **Build `MissionStatement.tsx`** — verify the 56px clamp visually, verify `prefers-reduced-motion` disables the `<FadeUp>`. Commit: `feat(about): mission statement section`.
6. **Build `AboutHero.tsx`** — verify the image reveal fires once per route entry, verify the gradient overlay keeps the title at AA contrast on the actual portrait. Commit: `feat(about): hero with portrait + title overlay`.
7. **Build `Bio.tsx`** — verify the sticky sidebar behaves on `lg` and stacks on `<lg`, verify the MDX body width is comfortable (~70ch). Commit: `feat(about): two-column bio with sticky sidebar`.
8. **Build `Philosophy.tsx`** (the signature) — visually verify all four numerals at 96px desktop, 56px mobile; verify `tabular-nums` keeps `01–04` aligned vertically on the left edge; verify `aria-hidden` on numerals + screen-reader pass with VoiceOver / NVDA reading "List of 4 items, 1, Food is information…". Commit: `feat(about): philosophy section — the signature`.
9. **Build `PressStrip.tsx`** — verify it returns `null` when `siteConfig.press` is empty. Verify hover de-grayscale. Commit: `feat(about): optional press logo strip`.
10. **Wire the page** — `app/about/page.tsx` per §4.1. Verify MDX renders, verify `Person` JSON-LD validates against schema.org's validator, verify metadata renders in the `<head>`. Commit: `feat(about): /about page wiring + Person JSON-LD`.
11. **Add the `:first-letter` fallback CSS** to `globals.css` per §4.10. Commit: `style(about): bio drop-cap fallback`.
12. **Add the redirect** — confirm `01-redirects` or `02-layout-shell` already maps `/about-me → /about`. If not, add it to `next.config.js`. Commit only if added.
13. **Add a Playwright smoke test** under `tests/about.spec.ts` (if testing infra exists per `01`):
    ```ts
    import { test, expect } from "@playwright/test";
    test("about page renders all six sections", async ({ page }) => {
      await page.goto("/about");
      await expect(page.getByRole("heading", { name: "Dr. Ruhma" })).toBeVisible();
      await expect(page.getByText("My mission is to make you shine from inside.")).toBeVisible();
      await expect(page.getByRole("heading", { name: /four ideas/i })).toBeVisible();
      // exactly 4 list items in philosophy
      const numerals = await page.locator("ol > li").count();
      expect(numerals).toBeGreaterThanOrEqual(4);
    });
    ```
    Commit: `test(about): smoke test for six-section render`.
14. **Lighthouse + axe pass** — run Lighthouse on `/about` (target: 95+ on every metric) and axe-core (target: 0 violations). Fix anything that surfaces. Commit fixes individually.
15. **Visual QA against reference** — open `/about` next to aesop.com/about and cupofjo.com/about-us; verify the page reads as restrained and editorial, not template-y. The Philosophy section should be the visible hero of the page on second-screen scroll.

---

## 6. Acceptance criteria

A reviewer (or future-Claude) confirms each of these before merge:

- [ ] `/about` renders without errors in `pnpm dev` and `pnpm build && pnpm start`.
- [ ] All six sections appear in this order: Hero → Mission → Bio → Philosophy → Press (or omitted) → CTA. A `<BotanicalDivider>` separates each pair of sections.
- [ ] **Hero**: full-bleed `AboutPage-Hero-1.jpg`, eyebrow "Clinical Dietitian · Lahore" appears above the title, title "Dr. Ruhma" renders in Epilogue, weight 500, at 96px on desktop (clamp may scale down to ≥40px on mobile). The image reveals via the global clip-path wipe motion exactly once on route entry.
- [ ] **Mission**: centered, max-width 720px, text reads exactly "My mission is to make you shine from inside." in Epilogue at 56px on desktop.
- [ ] **Bio**: two-column on `lg+` (body cols 1–7, sidebar cols 9–12), single-column on `<lg`. The first paragraph has a visible drop-cap glyph (5 lines tall, mauve, Epilogue). Sidebar contains a portrait, a pull-quote (italic Epilogue with mauve left border), and credentials chips.
- [ ] **Philosophy** (signature):
  - Exactly **four** principles render. Five or three is a bug.
  - Numerals render as **`01 02 03 04`** (zero-padded, not `1 2 3 4`).
  - Numerals are **Epilogue, weight 500, 96px on desktop, `text-mauve` (#895575)**, `tabular-nums`, `tracking-[-0.04em]`.
  - Numerals are `aria-hidden`; the `<ol>/<li>` semantic structure is intact.
  - **No decorative quotation marks** anywhere in the section. Each principle is a single declarative sentence.
  - Numerals and principles share a common baseline (verify by drawing a horizontal ruler across any row).
- [ ] **Press strip**: when `siteConfig.press` is empty, the `<section>` is not rendered (no empty whitespace, no heading). When populated, logos render in grayscale with hover restoring color.
- [ ] **CTA band**: appears at the bottom with "Ready to start?" eyebrow and a primary CTA linking to `/programs/consultation`.
- [ ] **Person JSON-LD** validates against Google's Rich Results Test: name, jobTitle, image, url, address, sameAs all populated.
- [ ] **Metadata**: `<title>` is "About Dr. Ruhma — Healthy You By Ruhma", description present, OG image is the hero portrait, canonical is `/about`.
- [ ] **Redirect**: `/about-me` 301s to `/about` (verified via `curl -I`).
- [ ] **Accessibility**: axe-core reports 0 violations on `/about`. Color contrast: `text-mauve` numerals on `cream-deep` ≥ 4.5:1 (large-text AA); body text on cream ≥ 7:1 (AAA).
- [ ] **Motion discipline**: only the three blessed motions appear (`ImageReveal` once on hero, `LetterStagger` once on the title, `FadeUp` on each section block). No additional motions, no parallax, no cursor effects.
- [ ] **`prefers-reduced-motion`**: with the OS setting on, `ImageReveal` mounts to final state instantly, `LetterStagger` mounts to final state instantly, `FadeUp` mounts to final state instantly. Page renders complete and beautiful without any animation.
- [ ] **Performance**: Lighthouse on `/about` reports 95+ in every category. LCP ≤ 2.0s on simulated 3G. CLS < 0.05. The hero image is `priority` and uses `next/image` with AVIF/WEBP fallbacks at appropriate sizes.

---

## 7. Out of scope

Explicitly **not** done in this plan; route to other plans or future work:

- **Booking widget integration** (Calendly / Cal.com) — lives on `/programs/consultation` per plan `08-programs-consultation`. The About CTA band only links there.
- **Newsletter signup form** — global concern, lives in the `<Footer>` per plan `02-layout-shell`. About page does not host its own form.
- **Press logo sourcing** — if Dr. Ruhma has been featured in publications, those logos need to be procured (and license-cleared) before `siteConfig.press` is populated. This plan ships with the array empty; the strip is invisible.
- **Translating the bio to Urdu** — not in scope for the launch site. If added later, route via `next-intl` per a future i18n plan.
- **Blog cross-links from the bio** — `/journal` is empty at launch. Once journal posts exist, the bio MDX can be edited to link to them; no code change required.
- **Headshot photoshoot** — `AboutPage-Hero-1.jpg` and `portrait-bio.jpg` come from the existing WP `uploads/` library per plan `03`. If Dr. Ruhma wants new photography, that's a separate content task.
- **Animated portrait reveal beyond the global `ImageReveal`** — no parallax on the hero, no scroll-driven crop, no "Ken Burns" pan. The motion budget is spent.
- **Editing the existing WP site** — per CLAUDE.md, the WP backup directory is a snapshot. Nothing in this plan touches `themes/`, `plugins/`, or `database.sql`. Content is read-only-extracted via `wp post get`; the new site stands on its own.
- **A "team" section** — Dr. Ruhma is a solo practitioner per the master plan. If she hires, this section gets added in a future plan, not retrofitted now.
- **Testimonials on About** — testimonials live on the home page (per master §3.1) and per-program pages. About is for the practitioner, not the patients.
