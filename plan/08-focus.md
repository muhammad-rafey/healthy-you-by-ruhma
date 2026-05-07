# Plan 08 — Focus Pages (Hormonal Health, Weight Management)

> Files in scope:
> - `app/focus/[slug]/page.tsx`
> - `content/focus/hormonal-health.mdx`
> - `content/focus/weight-management.mdx`
> - `components/marketing/FocusHero.tsx`
> - `components/marketing/Prose.tsx`
> - `components/marketing/Pullquote.tsx`
> - `components/marketing/Illustration.tsx`
> - `components/marketing/ConditionsList.tsx`
> - `components/marketing/RelatedCards.tsx`
> - `lib/focus.ts`

This plan covers the two long-form, type-driven Focus pages. They are deliberately the most "magazine"-feeling pages on the site — the signature move (per master §3.7) is that a visitor lands here and feels they are reading an essay in a print quarterly, not browsing a service grid. Drop-cap, two-column body on `lg+`, Epilogue pull-quotes, an embedded botanical illustration or two, then a quiet handoff into the conditions list, related cards, and CTA.

---

## 1. Goal

Ship two production-ready, MDX-driven, statically-generated long-read pages at:

- `/focus/hormonal-health` — sourced from existing WP page id 562 (~6,390 chars; "harmone" typo fixed to "hormone" everywhere)
- `/focus/weight-management` — sourced from existing WP page id 645 (~10,562 chars)

Both pages must:

1. Render from a single dynamic route `app/focus/[slug]/page.tsx` that calls `generateStaticParams` from the contents of `content/focus/*.mdx`.
2. Use a type-only editorial hero (no image — that's the whole point of this template).
3. Render the long-form article through a `<Prose>` wrapper that gives the body Inter 17/1.6, h2 in Epilogue 36px, h3 28px, mauve subtle-underline links, mauve-left-border blockquotes, custom list markers, optional drop-cap on the first paragraph, and on `lg+` viewports a balanced two-column layout for the article body (CSS `column-count: 2` with column-gap and proper widow/orphan control).
4. Expose four MDX-only components inside the body: `<Pullquote>`, `<DropCap>` (already exported by plan 05), `<Illustration>`, and `<ConditionsList>`.
5. Hydrate the trailing structured sections (`Where this shows up`, `Related`, CTA band) from frontmatter, not from prose, so the editorial body stays clean.
6. Emit JSON-LD `Article` schema and a per-page `<title>`/`<meta>` derived from frontmatter.
7. Pass acceptance: `lg+` two-column body, drop-cap on the first paragraph (when frontmatter opts in), Pullquote in Epilogue 32 italic mauve, no layout shift from font swap, axe-core clean, Lighthouse 95+ on the page.

Out of bounds: the journal post template (which is a single-column long-read with hero image, byline, category chip, etc.) — that lives in plan 10 and reuses `<Prose>` but **not** `<FocusHero>`.

---

## 2. Pre-requisites

This plan assumes the following plans are merged and live in the codebase before this one starts:

| Plan | What it provides that we depend on |
|---|---|
| **01 — Design system** | Tokens (`--cream`, `--cream-deep`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`), Inter + Epilogue via `next/font`, `<Container>`, `<Eyebrow>`, `<Heading>`, the 5–8 botanical SVGs in `public/illustrations/{fennel,mint,citrus,fenugreek,seed,…}.svg`, the 3 motion utilities `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`. |
| **02 — Layout shell** | `app/layout.tsx`, `<Nav>`, `<Footer>`, global `<CtaBand>` component (the cream-deep "Ready when you are." band reused on most pages), redirects in `next.config.js` (`/hormonal-health` → `/focus/hormonal-health`, `/weight-management` → `/focus/weight-management`). |
| **03 — Content & media migration** | `lib/mdx.ts` with `getMdxBySlug(dir, slug)` and `getAllMdxSlugs(dir)`, `lib/seo.ts` with `articleJsonLd(...)`, MDX pipeline wired to `next-mdx-remote` v5, `gray-matter` frontmatter parser, the `<DropCap>` component from plan 05 reachable as `@/components/marketing/DropCap`, and the optimized media set under `public/media/`. |

If any of those are missing, **do not** stub them here — block on the prereq plan landing first. We will not duplicate the MDX pipeline or the CTA band.

---

## 3. Dependencies

Pure additions (already in `package.json` from earlier plans, listed here for the audit):

- `next-mdx-remote` v5 — MDX rendering
- `gray-matter` — frontmatter
- `rehype-slug`, `rehype-autolink-headings` — for h2/h3 anchors inside Prose
- `schema-dts` + `lib/seo.ts` — Article JSON-LD typing
- `clsx` — already pulled by plan 01 utilities

No new top-level dependency is introduced by this plan. If a reviewer notices `remark-smartypants` is missing and we want curly quotes inside Prose, that goes in plan 03 (content migration), not here.

---

## 4. Files to create / modify (with concrete code)

### 4.1 `lib/focus.ts` — small helper for the route

```ts
// lib/focus.ts
import { getAllMdxSlugs, getMdxBySlug } from "@/lib/mdx";

export type FocusFrontmatter = {
  title: string;
  eyebrow: string;            // always "Focus area" but kept in frontmatter for parity with other templates
  slug: "hormonal-health" | "weight-management";
  description: string;        // 140–160 chars, used for <meta> and the subhead
  subhead: string;             // 2-line editorial subhead, NOT the meta description
  ogImage?: string;           // optional, /api/og fallback otherwise
  dropCap?: boolean;           // opt-in, default true
  conditions: Array<{ title: string; summary: string }>;   // exactly 3
  related: Array<{ type: "program" | "library" | "focus"; slug: string; label: string }>;  // 2–3
  publishedAt?: string;        // ISO, optional, used for Article JSON-LD if present
  updatedAt?: string;
};

const DIR = "focus";

export async function getAllFocusSlugs(): Promise<string[]> {
  return getAllMdxSlugs(DIR);
}

export async function getFocusEntry(slug: string) {
  return getMdxBySlug<FocusFrontmatter>(DIR, slug);
}
```

The expected return shape from `getMdxBySlug` (defined in plan 03) is `{ frontmatter, source }` where `source` is the serialized MDX ready for `<MDXRemote />`. We don't redefine it here.

### 4.2 `components/marketing/Prose.tsx` — the article body wrapper

This is the workhorse. It is wrapped around the `<MDXRemote />` call and gives every Focus page (and later, every Journal post) consistent editorial typography. The two-column behaviour is **only** applied on Focus, via a `variant` prop, because journal posts stay single-column for legibility on long technical reads.

```tsx
// components/marketing/Prose.tsx
import { type ReactNode } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  variant?: "single" | "longread"; // longread => 2-col on lg+
  className?: string;
};

export function Prose({ children, variant = "single", className }: Props) {
  return (
    <div
      className={clsx(
        "prose-editorial mx-auto w-full",
        variant === "longread" ? "max-w-[1040px]" : "max-w-[720px]",
        className,
      )}
      data-variant={variant}
    >
      <div
        className={clsx(
          "prose-body",
          // 2-col on lg+ only when variant=longread; column-fill: balance keeps both columns equal,
          // break-inside-avoid on h2/h3/blockquote/figure/pullquote prevents them from snapping across columns.
          variant === "longread" &&
            "lg:[column-count:2] lg:[column-gap:64px] lg:[column-fill:balance] lg:[column-rule:0]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
```

The matching CSS lives in `app/globals.css` (added by this plan, scoped under `.prose-editorial`):

```css
/* app/globals.css — Prose-editorial scope. Placed below the design tokens. */

.prose-editorial {
  color: var(--ink-soft);
  font-family: var(--font-inter);
  font-size: 17px;
  line-height: 1.6;
}

/* All block elements inside Prose: keep them out of column splits. */
.prose-editorial .prose-body :where(h2, h3, h4, blockquote, figure, ul, ol, .pullquote, .illustration) {
  break-inside: avoid;
}

/* Headings */
.prose-editorial h2 {
  font-family: var(--font-epilogue);
  font-weight: 500;
  font-size: clamp(28px, 2.6vw, 36px);
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 2.4em 0 0.6em;
}
.prose-editorial h3 {
  font-family: var(--font-epilogue);
  font-weight: 500;
  font-size: clamp(22px, 2vw, 28px);
  line-height: 1.2;
  letter-spacing: -0.015em;
  color: var(--ink);
  margin: 1.8em 0 0.5em;
}
.prose-editorial h4 {
  font-family: var(--font-inter);
  font-weight: 500;
  font-size: 18px;
  letter-spacing: -0.005em;
  color: var(--ink);
  margin: 1.4em 0 0.4em;
}

/* Paragraphs */
.prose-editorial p {
  margin: 0 0 1.1em;
  hanging-punctuation: first last;
}

/* Links */
.prose-editorial a {
  color: var(--mauve);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: color-mix(in oklab, var(--mauve) 40%, transparent);
  transition: text-decoration-color 200ms ease, color 200ms ease;
}
.prose-editorial a:hover {
  color: var(--mauve-deep);
  text-decoration-color: var(--mauve-deep);
}

/* Blockquote (used by stray > in MDX; pullquote is its own component) */
.prose-editorial blockquote {
  border-left: 2px solid var(--mauve);
  padding: 0.2em 0 0.2em 1.2em;
  margin: 1.6em 0;
  color: var(--ink);
  font-style: italic;
}
.prose-editorial blockquote p { margin-bottom: 0.5em; }

/* Lists */
.prose-editorial ul, .prose-editorial ol {
  margin: 1em 0 1.4em;
  padding-left: 1.4em;
}
.prose-editorial ul li::marker { color: var(--mauve); content: "— "; }
.prose-editorial ol { list-style: none; counter-reset: editorial; }
.prose-editorial ol > li {
  counter-increment: editorial;
  position: relative;
  padding-left: 1.6em;
}
.prose-editorial ol > li::before {
  content: counter(editorial, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: 0.05em;
  font-family: var(--font-epilogue);
  font-feature-settings: "tnum";
  color: var(--mauve);
  font-size: 0.95em;
}

/* hr — used as section break inside Prose */
.prose-editorial hr {
  border: 0;
  height: 1px;
  background: color-mix(in oklab, var(--ink) 10%, transparent);
  margin: 2.4em auto;
  width: 64px;
}

/* DropCap helper — works whether the MDX provides <DropCap> or we auto-target the first p */
.prose-editorial .dropcap::first-letter,
.prose-editorial[data-dropcap="true"] > .prose-body > p:first-of-type::first-letter {
  font-family: var(--font-epilogue);
  font-weight: 500;
  font-size: 4.6em;
  line-height: 0.9;
  float: left;
  padding: 0.05em 0.12em 0 0;
  color: var(--ink);
}

/* Reduced motion: nothing here animates, but be defensive when Prose is wrapped in <FadeUp>. */
@media (prefers-reduced-motion: reduce) {
  .prose-editorial * { animation: none !important; transition: none !important; }
}
```

A few specific notes the implementer should not miss:

- We use **`break-inside: avoid`** on every block-level element inside the column container. Without this, multi-column flow happily splits an `<h2>` or a blockquote across the column gutter, which looks broken.
- `column-fill: balance` is the correct value here. The default `auto` fills the first column completely before starting the second, which on a short-ish article makes column 2 look orphaned.
- We do **not** use `text-align: justify`. Justified body in CSS without hyphens looks worse than ragged-right. (Master §3.7 says "justified body where appropriate" — this is the appropriate decision: don't.)
- The drop-cap rule has two activation paths: (1) MDX explicitly wraps the first paragraph in `<DropCap>` (which gets `class="dropcap"`), or (2) the page sets `data-dropcap="true"` on the Prose container based on frontmatter. We default to (2) because it lets the writer skip the wrapper boilerplate, and it lets the page turn the drop-cap off without editing MDX.

### 4.3 `components/marketing/Pullquote.tsx`

```tsx
// components/marketing/Pullquote.tsx
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  attribution?: string;
};

export function Pullquote({ children, attribution }: Props) {
  return (
    <figure className="pullquote my-12 mx-auto" style={{ maxWidth: 600 }}>
      <blockquote
        className="m-0 p-0"
        style={{
          fontFamily: "var(--font-epilogue)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(24px, 2.6vw, 32px)",
          lineHeight: 1.25,
          letterSpacing: "-0.01em",
          color: "var(--mauve)",
          textWrap: "balance",
        }}
      >
        {children}
      </blockquote>
      {attribution ? (
        <figcaption
          className="mt-3"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            letterSpacing: "0.04em",
            color: "var(--ink-soft)",
            textTransform: "none",
          }}
        >
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

The `.pullquote` class is what the Prose CSS targets to keep it from being split across columns. We deliberately set `font-style: italic` here, **not** in CSS, because we want the italic to render even outside the Prose scope (e.g., a future style-guide page).

### 4.4 `components/marketing/Illustration.tsx`

A thin lookup over the SVG set commissioned in plan 01. Inline render so we can recolor with `currentColor` and animate with `<FadeUp>` if needed.

```tsx
// components/marketing/Illustration.tsx
import Image from "next/image";

const ALLOWED = ["fennel", "mint", "citrus", "fenugreek", "seed", "leaf", "anise", "carrot"] as const;
export type IllustrationName = (typeof ALLOWED)[number];

type Props = {
  name: IllustrationName;
  size?: number;     // px; capped at 80 per master §1
  align?: "left" | "center" | "right";
  alt?: string;      // empty by default — these are decorative
};

export function Illustration({ name, size = 80, align = "center", alt = "" }: Props) {
  if (!ALLOWED.includes(name)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Illustration name="${name}" /> is not in the allowed set.`);
    }
    return null;
  }
  const px = Math.min(size, 80);
  const justify = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  return (
    <div
      className="illustration my-8 flex"
      style={{ justifyContent: justify, color: "var(--ink)" }}
      aria-hidden={alt === "" ? true : undefined}
    >
      <Image
        src={`/illustrations/${name}.svg`}
        alt={alt}
        width={px}
        height={px}
        // SVGs are tiny, no need for next/image's optimizer
        unoptimized
      />
    </div>
  );
}
```

The 80 px cap is a hard rule from master §1 ("used at 80 px max as section anchors"). The component enforces it so a writer can't sneak in an 800 px illustration mid-article.

### 4.5 `components/marketing/FocusHero.tsx`

Type-only editorial hero. No image, no background panel — just the eyebrow, the title, and a 2-line subhead. The negative space is the design.

```tsx
// components/marketing/FocusHero.tsx
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LetterStagger } from "@/components/motion/LetterStagger";

type Props = {
  eyebrow: string;        // always "Focus area" for these pages
  title: string;
  subhead: string;        // already pre-broken into 2 lines via a soft \n if desired
};

export function FocusHero({ eyebrow, title, subhead }: Props) {
  return (
    <section className="bg-cream pt-[clamp(96px,12vw,180px)] pb-[clamp(48px,6vw,96px)]">
      <Container>
        <div className="max-w-[880px]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1
            className="mt-6"
            style={{
              fontFamily: "var(--font-epilogue)",
              fontWeight: 500,
              fontSize: "clamp(40px, 6vw, 96px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              textWrap: "balance",
            }}
          >
            <LetterStagger>{title}</LetterStagger>
          </h1>
          <p
            className="mt-8 max-w-[640px]"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(17px, 1.4vw, 19px)",
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              textWrap: "pretty",
            }}
          >
            {subhead}
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### 4.6 `components/marketing/ConditionsList.tsx`

```tsx
// components/marketing/ConditionsList.tsx
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Props = {
  conditions: Array<{ title: string; summary: string }>;
  heading?: string;       // defaults to "Where this shows up"
};

export function ConditionsList({ conditions, heading = "Where this shows up" }: Props) {
  if (conditions.length !== 3) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("<ConditionsList> expects exactly 3 items per master §3.7.");
    }
  }
  return (
    <section className="bg-cream-deep py-[clamp(72px,8vw,128px)]">
      <Container>
        <Eyebrow>Reference</Eyebrow>
        <h2
          className="mt-4 max-w-[720px]"
          style={{
            fontFamily: "var(--font-epilogue)",
            fontWeight: 500,
            fontSize: "clamp(32px, 4vw, 56px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          {heading}
        </h2>
        <ol className="mt-12 grid gap-12 md:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
          {conditions.map((c, i) => (
            <li key={c.title}>
              <span
                className="block"
                style={{
                  fontFamily: "var(--font-epilogue)",
                  fontFeatureSettings: '"tnum"',
                  color: "var(--mauve)",
                  fontSize: 32,
                  lineHeight: 1,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="mt-4"
                style={{
                  fontFamily: "var(--font-epilogue)",
                  fontWeight: 500,
                  fontSize: 24,
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                }}
              >
                {c.title}
              </h3>
              <p
                className="mt-3"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: "var(--ink-soft)",
                  textWrap: "pretty",
                }}
              >
                {c.summary}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

### 4.7 `components/marketing/RelatedCards.tsx`

A small, restrained card row — not the main editorial product grid (that's `/library`). Two or three cards, simple eyebrow + title + arrow.

```tsx
// components/marketing/RelatedCards.tsx
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

type Item = { type: "program" | "library" | "focus"; slug: string; label: string };

const HREF: Record<Item["type"], (slug: string) => string> = {
  program: (s) => `/programs/${s}`,
  library: (s) => `/library/${s}`,
  focus:   (s) => `/focus/${s}`,
};

const TYPE_LABEL: Record<Item["type"], string> = {
  program: "Program",
  library: "Guidebook",
  focus:   "Focus area",
};

export function RelatedCards({ items }: { items: Item[] }) {
  return (
    <section className="bg-cream py-[clamp(72px,8vw,128px)]">
      <Container>
        <Eyebrow>Related</Eyebrow>
        <h2
          className="mt-4 max-w-[720px]"
          style={{
            fontFamily: "var(--font-epilogue)",
            fontWeight: 500,
            fontSize: "clamp(28px, 3vw, 40px)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          Where to go next.
        </h2>

        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={`${item.type}/${item.slug}`}>
              <Link
                href={HREF[item.type](item.slug)}
                className="group block bg-paper p-8 transition-colors duration-200 hover:bg-shell"
                style={{ borderRadius: 0 }}
              >
                <Eyebrow>{TYPE_LABEL[item.type]}</Eyebrow>
                <span
                  className="mt-4 block"
                  style={{
                    fontFamily: "var(--font-epilogue)",
                    fontWeight: 500,
                    fontSize: 24,
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    color: "var(--ink)",
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="mt-6 inline-flex items-center gap-2 text-mauve transition-colors group-hover:text-mauve-deep"
                  style={{ fontFamily: "var(--font-inter)", fontSize: 14, letterSpacing: "0.02em" }}
                >
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

### 4.8 `app/focus/[slug]/page.tsx`

The route itself. This is where `generateStaticParams`, `generateMetadata`, the MDX component map, and the page composition all live.

```tsx
// app/focus/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllFocusSlugs, getFocusEntry } from "@/lib/focus";
import { articleJsonLd } from "@/lib/seo";

import { FocusHero } from "@/components/marketing/FocusHero";
import { Prose } from "@/components/marketing/Prose";
import { Pullquote } from "@/components/marketing/Pullquote";
import { Illustration } from "@/components/marketing/Illustration";
import { ConditionsList } from "@/components/marketing/ConditionsList";
import { RelatedCards } from "@/components/marketing/RelatedCards";
import { CtaBand } from "@/components/marketing/CtaBand";
import { DropCap } from "@/components/marketing/DropCap";
import { FadeUp } from "@/components/motion/FadeUp";
import { Container } from "@/components/layout/Container";

const components = {
  Pullquote,
  Illustration,
  DropCap,
};

export async function generateStaticParams() {
  const slugs = await getAllFocusSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getFocusEntry(slug);
  if (!entry) return {};
  const { title, description, ogImage } = entry.frontmatter;
  return {
    title: `${title} — Healthy You By Ruhma`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/focus/${slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/focus/${slug}` },
  };
}

export default async function FocusPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entry = await getFocusEntry(slug);
  if (!entry) notFound();

  const { frontmatter, source } = entry;
  const dropCap = frontmatter.dropCap !== false; // default true

  return (
    <>
      <FocusHero
        eyebrow={frontmatter.eyebrow}
        title={frontmatter.title}
        subhead={frontmatter.subhead}
      />

      <FadeUp>
        <Container>
          <div className="py-[clamp(48px,6vw,96px)]" data-dropcap={dropCap}>
            <Prose variant="longread">
              <MDXRemote source={source} components={components} />
            </Prose>
          </div>
        </Container>
      </FadeUp>

      <ConditionsList conditions={frontmatter.conditions} />

      <RelatedCards items={frontmatter.related} />

      <CtaBand
        line="Ready when you are."
        href="/programs/consultation"
        label="Book a consultation"
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleJsonLd({
              headline: frontmatter.title,
              description: frontmatter.description,
              url: `/focus/${slug}`,
              image: frontmatter.ogImage,
              datePublished: frontmatter.publishedAt,
              dateModified: frontmatter.updatedAt ?? frontmatter.publishedAt,
            }),
          ),
        }}
      />
    </>
  );
}
```

A few specific notes on this file:

- `params` is a Promise (Next 15). Don't destructure it synchronously.
- We pass `data-dropcap` on the wrapper around `<Prose>` so the CSS rule can attach the drop-cap to the first paragraph rendered by MDX, without the writer needing to wrap it manually. The writer can still use `<DropCap>` for explicit per-paragraph drop-caps elsewhere in the body if they want.
- We deliberately do **not** wrap `<Prose>` itself in a `Container` — `<Prose>` already centers and limits its own width. We wrap in `<Container>` here only so the surrounding margin matches the rest of the page horizontally on small screens.
- `articleJsonLd` is the helper from plan 03 (`lib/seo.ts`). We pass `image` if frontmatter set one, otherwise the helper falls back to the dynamic OG endpoint.

### 4.9 `content/focus/hormonal-health.mdx`

```mdx
---
title: What hormones can do for you
eyebrow: Focus area
slug: hormonal-health
description: A clinical dietitian's plain-language guide to how hormones shape weight, mood, sleep, and skin — and what nutrition can actually move.
subhead: Hormones are the body's quiet operators — and the difference between feeling like yourself and feeling untranslated.
ogImage: /media/og/focus-hormonal-health.png
dropCap: true
publishedAt: "2026-04-01"
updatedAt: "2026-04-01"
conditions:
  - title: PCOS
    summary: Insulin resistance and androgen excess. Diet patterns that lower fasting insulin tend to do the heaviest lifting.
  - title: Thyroid
    summary: Both under- and over-active patterns affect metabolic rate, body temperature, and the patience the rest of you has for the day.
  - title: Cortisol & stress
    summary: Sleep, blood-sugar variability, and chronic restriction quietly write the cortisol curve. So does breakfast.
related:
  - { type: "library", slug: "pcos-guidebook", label: "The PCOS Guidebook" }
  - { type: "program", slug: "coaching", label: "8-week Coaching Program" }
  - { type: "focus",   slug: "weight-management", label: "Weight Management" }
---

Hormones do not make their case loudly. They do their work in the small print of how a morning starts, whether a craving lands at 3 p.m. or 9, whether sleep arrives easily or by negotiation. Most of the women who walk into my practice describe symptoms — irregular cycles, weight that won't shift, skin that flares without warning — long before anyone names a hormone. The naming, when it happens, is almost a relief.

This page is the long version of the conversation I have most weeks. It is not a replacement for clinical care. It is the part of the conversation that doesn't fit in a forty-minute consultation: what hormones actually are, how they show up in food, and what to look at first if you're trying to feel like yourself again.

## The short answer

If you read nothing else, read this. The four levers most worth pulling, in order of how often they move things for the women in my practice:

1. **Steady blood sugar** through the day — protein at breakfast, fewer naked carbs, eat before you're starving.
2. **Sleep** — seven hours, regular bedtime, dark room. Sleep is the cheapest hormone medicine on the planet.
3. **Strength training** — two sessions a week. Muscle is endocrine tissue.
4. **Less chronic restriction** — long calorie deficits are stress events. Stress is not free.

Everything below is the explanation of why those four, and what they look like at the level of a Tuesday.

<Illustration name="fennel" />

## What "hormones" actually means in the kitchen

A hormone is a messenger. The endocrine system is a postal service: a gland writes a letter, releases it into the bloodstream, and a receptor somewhere else in the body opens it. The relevant ones for nutrition are insulin, cortisol, the thyroid pair (T3 and T4), oestrogen, progesterone, testosterone, leptin, and ghrelin. You do not need to memorise them. You need to know that each one responds — sometimes within minutes, sometimes over months — to what you eat, when you eat, how you sleep, and how you move.

Insulin is the one most directly dietary. Every meal with carbohydrate raises blood sugar; insulin is what brings it back down. The shape of that rise and fall — sharp spike or gentle wave — is the single most modifiable hormonal pattern most women have access to. PCOS, fatty liver, type-2 diabetes risk, energy slumps, sugar cravings: insulin sits behind all of them.

<Pullquote attribution="On her first visit, repeatedly">
  I'm not eating that much, but the weight won't move.
</Pullquote>

Cortisol is the second. It is not the villain it's marketed as. Cortisol is what gets you out of bed; it follows a curve through the day, peaks in the morning, and falls before sleep. Trouble starts when the curve flattens — when stress is constant, when sleep is short, when meals are skipped, when training is heavy and food is scarce. A flattened cortisol curve looks, from the inside, like *tired but wired*.

The thyroid pair sets metabolic tempo: how warm you are, how fast your heart beats, how often your bowel moves, how patient you can stand to be. Iodine, selenium, iron, and adequate calories are the dietary inputs that matter most. Chronic under-eating is a thyroid stressor; women routinely don't believe me about this until their period goes.

Oestrogen, progesterone, and testosterone are the cycle hormones. They respond to body composition (fat tissue makes oestrogen), to stress (cortisol "steals" from progesterone in the production line), and to insulin (high insulin lifts androgens, which is most of the PCOS picture). They are not, on the whole, things you eat your way directly to — but the conditions you build with diet are the conditions they operate under.

Leptin and ghrelin are the appetite pair. Leptin says *I've had enough*; ghrelin says *feed me*. Sleep loss flips both in the wrong direction within two nights. This is why a tired week feels like a hungry week.

## What food actually moves

The protein-at-breakfast finding is the most replicable thing I see in practice. Thirty grams of protein within an hour of waking — eggs, yoghurt with seeds, a daal-and-roti breakfast that leans on the daal — flattens the morning blood-sugar curve, blunts the mid-morning slump, and reduces the 3 p.m. craving for something fast and sweet. It is unglamorous and it works.

Fibre is the second. Twenty-five to thirty grams a day, mostly from vegetables, lentils, fruit with skin, and intact grains. Fibre is what oestrogen leaves the body in; a low-fibre diet recirculates oestrogen via the gut and contributes to the heavy, painful periods I see most weeks. There is a reason fennel, fenugreek, and flax come up in every grandmother's kitchen advice — they're high-fibre and high-phytoestrogen, which is a way of saying they take the edge off both ends of the cycle.

<Illustration name="fenugreek" />

Fat is the third. Hormones are made from cholesterol; very-low-fat diets are an old idea that did not age well. Olive oil, ghee in moderation, nuts, seeds, oily fish if you eat it. Avoid the ultra-processed seed oils and the deep-fried things; cook with what your grandmother would have recognised.

Carbohydrates are not the enemy and they are not free. Whole grains, fruit, legumes, vegetables — keep them. Refined sugar and refined flour eaten alone, on an empty stomach — minimise. The trick is rarely "no carbs"; the trick is "carbs in the company of protein, fat, and fibre."

## What food does not move

Most "hormone-balancing" supplements. Most cleanses. Most "boost your metabolism" teas. The ten-day reset that promises a new endocrine system. If a regime promises rapid results without changing anything you do at breakfast, sleep, or in the gym, the regime is selling something else.

There is a longer list of evidence-based interventions in the [PCOS Guidebook](/library/pcos-guidebook), and a structured way to apply them in the [coaching program](/programs/coaching). The Library entry is the cheaper way in; the program is the supervised way.

## What to look at first

If you are trying to figure out where your particular bottleneck is, the order I run through with new clients:

1. **Bloodwork** — a fasting insulin, fasting glucose (and from those a HOMA-IR), a full thyroid panel including antibodies, vitamin D, ferritin, and a lipid panel. Get the numbers. Don't guess.
2. **A week of food** — written, honestly. Not to judge, to map. Most patterns are visible within seven days.
3. **A week of sleep** — bedtime, wake time, how it felt. Sleep is upstream of everything.
4. **A cycle log** — three months if you're cycling, period start dates and any symptom that recurs.

With those four artifacts, the picture is usually clear within a single appointment. Without them, we're guessing.

<Pullquote>
  The endocrine system has a long memory. So does the kitchen.
</Pullquote>

The work is not glamorous. Hormonal health, in practice, looks like a regular breakfast, a fibre-shaped lunch, a strength session twice a week, and a bedtime that holds. It is the opposite of a cleanse and the opposite of a hack. It is the part of nutrition I am most certain of and most reluctant to oversell.

If you'd like the structured version, the resources below are where to start.
```

A few editorial notes for the content reviewer:

- The original WP page id 562 spelled the word "harmone" throughout. **Every instance is now "hormone."** This is the §6 typo fix.
- The original copy was 6,390 chars; the rewritten copy is intentionally a touch longer because the §3.7 template needs material to fill 2 columns at 720px without leaving a stranded column 2.
- "Grandmother" / "Tuesday" / "consultation" framings are deliberate — they preserve the existing voice (warm practitioner, plain-language, lightly Pakistani-context) without adding cliché flourishes.
- Pullquote attribution can be omitted (second pullquote does this).

### 4.10 `content/focus/weight-management.mdx`

```mdx
---
title: Weight, the long way around
eyebrow: Focus area
slug: weight-management
description: An evidence-based, patient guide to weight management — what actually moves the scale, what doesn't, and how to do it without breaking the rest of you.
subhead: There are faster ways to lose weight than this. There are very few that work twice.
ogImage: /media/og/focus-weight-management.png
dropCap: true
publishedAt: "2026-04-01"
updatedAt: "2026-04-01"
conditions:
  - title: Stalled loss
    summary: The plateau after the first 4–6 kg. Almost always a metabolic adaptation issue, not a willpower one.
  - title: Post-pregnancy
    summary: A different problem from "lose weight." Sleep, breastfeeding load, and recovery come first; the scale is downstream.
  - title: Emotional eating
    summary: When the meal is doing two jobs — feeding and regulating. Naming this is most of the work.
related:
  - { type: "program", slug: "diet-planning", label: "Diet Planning Program" }
  - { type: "program", slug: "coaching", label: "8-week Coaching Program" }
  - { type: "focus",   slug: "hormonal-health", label: "Hormonal Health" }
---

Most of what is written about weight management is written by people who have either never lost weight, or lost it once and have been monetising the story since. The version I have to give as a clinical dietitian is duller, slower, and considerably more honest. It also works.

This is the long version of that conversation. It assumes you have already tried something — most of the women who reach my practice have tried several somethings — and that you are looking for the part underneath the noise.

## The frame

Weight is not a moral category. It is a measurement, taken at a point in time, of one of dozens of variables that describe the body. It correlates with health in some directions and not others; it is a reasonable target sometimes and a counterproductive one at others. The decision to pursue weight loss is reasonable when the weight is genuinely tied to a health goal, the timing is sustainable, and the cost — sleep, social life, mental space — is one you can afford to pay for the duration. It is not reasonable as a default state.

I lead with that because half the work in my practice is helping a client decide whether weight loss is the right project at all. Sometimes the answer is yes. Sometimes the right project is sleep, or strength, or the relationship with food. Sometimes the right project is to leave the scale alone for six months.

## What actually causes weight loss

Sustained, modest energy deficit, over time. That is the entire mechanism, in one sentence. Every regime that produces weight loss does it through that lever, regardless of whether it is marketed as keto, intermittent fasting, low-carb, plant-based, or "clean eating." The differences between regimes are how easy each one is to stick to for *you*, in *your* life.

What this means in practice: there is no metabolic trick. There is no fat-burning food. There is no magic combination of nutrients that lets a body lose weight while in energy balance. The mechanism is energy in versus energy out, and everything else is logistics.

<Pullquote>
  Every regime that works does the same thing. The difference is which one you can live in.
</Pullquote>

The logistics are not trivial, however, and this is where most weight-loss attempts fail. The two most common failure modes:

1. **Too steep a deficit.** A 1,000-calorie deficit feels heroic for two weeks and unsustainable by week six. The body adapts, the deficit closes, and the regime collapses. A 300–500 calorie deficit is slower, less satisfying, and considerably more durable.
2. **Ignoring protein and strength.** A 10 kg loss made up of 4 kg of muscle and 6 kg of fat leaves you weaker, more tired, with a lower resting metabolism, and a higher chance of regaining. The same 10 kg loss as 1 kg muscle and 9 kg fat is a different physiology entirely.

<Illustration name="seed" />

## What does not cause weight loss

A short list, since the long list is most of the internet:

- **Detox.** The liver and kidneys do this; they are unmoved by smoothies.
- **Apple cider vinegar.** Lowers a single post-meal glucose reading; does not move the scale.
- **Lemon water.** Lemon water is fine. It is hydration with flavour. It is not a metabolic event.
- **Belly fat exercises.** Spot reduction is not a thing the body does. Fat loss is systemic.
- **Anything described as "boosting metabolism" without naming a mechanism.** Be skeptical of nouns wearing verbs as hats.
- **Wedding diets, two-week diets, fit-into-this-dress diets.** They produce a number on the scale and rarely a change in the body. The weight comes back at speeds that surprise people.

## The protein floor

The single most reliable lever I see. A weight-loss diet without adequate protein loses muscle, lowers metabolic rate, and leaves the dieter in a worse position than they started. The minimum I work with is 1.6 g of protein per kg of *target* body weight per day, distributed across three to four meals. For most women that lands between 90 and 130 grams a day, and for most women it is significantly more protein than they were eating before.

This is not optional. It is the single intervention that distinguishes a weight loss that holds from one that doesn't. Everything else in this article is downstream of this.

## Strength training

The second most reliable lever. Two sessions a week, full-body, progressive load. Not cardio — cardio is good for many things but is not the lever for body composition during a deficit. Muscle is what tells the body the deficit is being asked to come from fat tissue rather than from the muscle itself.

Women in my practice resist this twice as long as men do, on average, and benefit from it twice as much. The physiology does not care about the gendered cultural script around lifting; it responds to the load.

<Illustration name="leaf" />

## Sleep and stress

Underslept dieters lose more muscle and less fat at the same calorie deficit than rested dieters. Stressed dieters drive cortisol, which interacts with insulin, which interacts with appetite. None of this is mysterious; all of it is well-established. The practical implication: a person sleeping six hours on a 500-calorie deficit is in a worse position than a person sleeping eight hours on a 300-calorie deficit. The slower regime wins again.

## The plateau

Every weight-loss regime plateaus. The body is well-engineered for this and does not consult the dieter. When loss stalls, the question is not *why has the body betrayed me* but *what has adapted, and what can I move next*. The usual answers, in order:

1. **Adherence has drifted.** Most plateaus are not metabolic; they are arithmetic. A weekend of unmeasured food adds up. A food log for a week usually finds the deficit has quietly closed.
2. **Adaptive thermogenesis.** Real, but smaller than dieters fear. A diet break — two weeks at maintenance — often resets the system better than cutting further.
3. **Muscle has been lost.** Fix the protein floor, fix the strength training, give it six weeks before judging.
4. **Life has changed.** New job, new sleep schedule, new stressor. The regime that worked last quarter may need editing.

Cutting calories further is almost never the right first move. It is the move that feels right, which is part of how it is wrong.

## Post-pregnancy

A separate category, and the one most often mishandled. The body in the first year postpartum is not in a position to lose weight efficiently and is not supposed to be. Sleep is fragmented, recovery is ongoing, lactation has its own caloric load. The right project is to eat well, move when energy permits, and let the scale do what it does on the timeline it does. Aggressive deficits postpartum routinely produce milk supply problems, hair loss, mood crashes, and rebound weight gain. The slow road is the only road.

<Pullquote attribution="In a follow-up, six months in">
  The first time I tried this, I lost it in three months. The third time, I kept it.
</Pullquote>

## Emotional eating

The category that diets rarely address and that determines whether a regime survives the first hard week. When a meal is doing two jobs — feeding and regulating — restricting the meal removes the regulation tool without replacing it. The result is usually a binge two weeks later that the dieter blames themselves for.

The work here is not to eat less. The work is to build other regulation tools — sleep, walks, real conversations, a therapist if it's that — so that when the meal is asked to do one job again it can. This is not a nutrition project; it is a life-architecture project. I refer out for it when needed and I name it directly with every client because it is more often the actual problem than the macros are.

## A reasonable timeline

For most women, half a kilogram a week is the upper end of what is sustainable; a quarter to half is more typical. That is 10–25 kg in a year, which is more than most rapid regimes deliver and far more than they keep. Patience here is not a virtue, it is a strategy.

The structured way through this is the [Diet Planning Program](/programs/diet-planning) for the eight-week version, or the [Coaching Program](/programs/coaching) if accountability and weekly adjustments are what you actually need. Either is a more honest path than the regime that promises 10 kg in 30 days.
```

Same notes apply: voice preserved, typos cleaned (the existing WP page id 645 had several minor errors per master §6 — those are fixed in the rewrite). The piece is intentionally a bit longer than 10,562 chars because the original was wordy in places we tightened, and we needed coverage for the conditions list.

---

## 5. Step-by-step tasks

A reviewer should be able to walk this top-to-bottom and produce the working pages without judgment calls.

1. **Verify prereqs.** `lib/mdx.ts`, `lib/seo.ts`, `<Container>`, `<Eyebrow>`, `<DropCap>`, `<FadeUp>`, `<LetterStagger>`, `<CtaBand>`, and the botanical SVGs at `public/illustrations/{fennel,mint,citrus,fenugreek,seed,leaf,anise,carrot}.svg` all exist. If any are missing, stop and ping the owning plan.

2. **Add the Prose CSS** to `app/globals.css` under a `/* Prose-editorial scope */` comment. Run a visual sanity check by adding a temporary `<Prose variant="longread">` with three `<p>` and an `<h2>` to the `_kit` route from plan 01. Confirm 2 columns appear at `lg:` breakpoint and the heading stays in column 1.

3. **Create components in this order**, exporting from `components/marketing/index.ts` as you go:
   - `Prose.tsx`
   - `Pullquote.tsx`
   - `Illustration.tsx`
   - `FocusHero.tsx`
   - `ConditionsList.tsx`
   - `RelatedCards.tsx`

4. **Create `lib/focus.ts`.** Confirm the type compiles against the existing `getMdxBySlug` generic.

5. **Author the two MDX files** at `content/focus/hormonal-health.mdx` and `content/focus/weight-management.mdx`. Use the bodies above as the canonical text. **Do not paraphrase from the WP export verbatim** — the rewritten versions in §4.9 / §4.10 are already the typo-fixed, tightened, master-§6-compliant versions.

6. **Create the route** `app/focus/[slug]/page.tsx`. Wire `generateStaticParams`, `generateMetadata`, the page composition, and the JSON-LD script tag.

7. **Verify static generation.** `pnpm build` should produce two prerendered HTML files: `.next/server/app/focus/hormonal-health.html` and `.next/server/app/focus/weight-management.html`. Confirm both exist and contain the article body in the rendered HTML (i.e., not "Loading…" — this is RSC, the body must be in the static output).

8. **Verify redirects** added by plan 02 still work: `curl -I localhost:3000/hormonal-health` returns 308 → `/focus/hormonal-health`; same for `/weight-management`.

9. **Visual QA pass** at `lg+` viewport (≥1024px):
   - Two-column body, balanced
   - Drop-cap on first paragraph
   - Pullquote: 32px italic mauve, max-width 600 px, attribution line if present, does not split across columns
   - Illustration centered, ≤80 px, decorative (`alt=""`)
   - h2/h3 in Epilogue, do not split across columns
   - Links subtle mauve underline; hover deepens

10. **Visual QA at `md`** (768–1023): single column, max-width 720 px, otherwise identical.

11. **Visual QA at `sm`** (<768): single column, drop-cap reduced to 3.6em (CSS already handles this via the clamp on the sibling rules; verify), Pullquote scales by clamp.

12. **Accessibility QA.**
    - axe-core: 0 violations on each page.
    - Tab order: hero → article body links → conditions list → related cards → CTA. No focus traps.
    - Heading order: h1 (FocusHero) → h2 (article sections) → h2 ("Where this shows up") → h2 ("Where to go next.") → no skipped levels. The conditions list using `<h3>` per condition is intentional and inside an `<h2>`-led section.
    - The Pullquote uses real `<blockquote>` + `<figcaption>`; not divs.

13. **JSON-LD validation.** Paste the rendered output into Google's Rich Results test for each URL; expect a green `Article` with no errors. Required fields: `@type`, `headline`, `description`, `datePublished`, `author`, `publisher`. `author` and `publisher` come from `lib/seo.ts` defaults.

14. **Lighthouse run** on each page (mobile profile, throttled 3G). Target: Performance ≥95, Accessibility 100, Best Practices ≥95, SEO 100. The biggest risk for performance here is Inter + Epilogue blocking — confirm `display: swap` is set in the `next/font` config from plan 01.

15. **Smoke test the related links.** Each link href in frontmatter must resolve to a real route — i.e., `/programs/coaching`, `/library/pcos-guidebook`, `/focus/weight-management`, etc. The `/programs/*` routes come from plan 06; `/library/*` from plan 09. Until those plans land, the links resolve to a 404. That is **expected** during the parallel-write phase and should be flagged in the PR description, not papered over with a temporary redirect.

16. **Open the PR** with the title `feat(focus): hormonal-health + weight-management long-reads`. Body includes a screenshot of each viewport breakpoint, a Lighthouse summary, and the note above about cross-plan link dependencies.

---

## 6. Acceptance criteria

The plan is done when **all** of the below hold. A reviewer should be able to verify each in under five minutes.

1. `/focus/hormonal-health` renders with a type-only hero (no image), title in Epilogue ≥56 px desktop, eyebrow "Focus area", and a 2-line subhead.
2. `/focus/weight-management` renders the same template with its own copy.
3. On `lg+` (≥1024 px viewport width), the article body lays out in **two balanced columns**, with no `<h2>`, `<h3>`, `<blockquote>`, `<figure>`, or `<Pullquote>` split across the column gutter.
4. On `md` and below, the article body collapses to a single column, max-width 720 px.
5. The first paragraph renders with a drop-cap (Epilogue, ~4.6em, mauve-deep on cream) when frontmatter `dropCap` is `true` (the default for both pages).
6. `<Pullquote>` instances render in Epilogue 32 px (clamped 24–32), italic, mauve, max-width 600 px, with an attribution line set in Inter 13 px when supplied.
7. `<Illustration name="…">` renders the named SVG at ≤80 px, centered (or aligned per prop), decorative.
8. The "Where this shows up" section renders exactly three conditions from frontmatter, each with a numbered Epilogue heading (01/02/03), title, and 1–2-line summary.
9. The "Related" section renders the 2–3 cards from frontmatter, linking to the correct routes (`/programs/...`, `/library/...`, `/focus/...`).
10. The CTA band at the bottom reads "Ready when you are." with a "Book a consultation" button linking to `/programs/consultation`.
11. `generateStaticParams` returns exactly the slugs present in `content/focus/`. Adding a third MDX file is enough to add a third route at build time, with no code change.
12. `generateMetadata` populates `<title>`, `<meta name="description">`, OG tags, Twitter card, and `<link rel="canonical">` per page, sourced from frontmatter.
13. A valid JSON-LD `Article` block is present on each page; Google's Rich Results test reports no errors.
14. axe-core reports 0 violations on each page.
15. Lighthouse mobile (throttled 3G) reports Performance ≥95, Accessibility 100, Best Practices ≥95, SEO 100.
16. The word "harmone" does not appear anywhere in the source or rendered HTML of `/focus/hormonal-health`. (It was the original WP typo; this is the §6 fix.)
17. `prefers-reduced-motion: reduce` disables the LetterStagger and FadeUp on the page; the static layout is identical.
18. Building the site (`pnpm build`) produces a fully prerendered HTML for each Focus URL — no client-only fallback, no "Loading…" content in the static output. Inspecting the static HTML shows the article body, conditions, and related cards already in the markup.
19. The legacy paths `/hormonal-health` and `/weight-management` 308-redirect to `/focus/hormonal-health` and `/focus/weight-management` respectively (verifying plan 02's redirects still apply to the new routes).
20. No console warnings or errors in dev mode on either page.

---

## 7. Out of scope

Listed explicitly so a reviewer does not push this plan to grow:

- **The journal post template.** `/journal/[slug]` is a structurally similar long-read but uses a hero image, byline, category chip, read-time, and `<Prose variant="single">` (no two-column body). It also reuses `<Pullquote>` and `<DropCap>`. That template lives in **plan 10** and explicitly does **not** import `<FocusHero>` or `<ConditionsList>` or `<RelatedCards>`. If the journal author wants a related-cards row, plan 10 will define its own variant.
- **The Programs templates.** `/programs/[slug]` is a different template (structured sections, sample week card, pricing card, FAQ). Lives in **plan 06**.
- **The Library detail.** `/library/[slug]` is its own template with split hero + buy-out CTA. Lives in **plan 09**.
- **A general-purpose `<TwoColumnProse>` shared with marketing pages.** Resist the temptation to abstract — the only place 2-column is used is `<Prose variant="longread">`, and only on Focus. Pulling it into a third surface is a future concern, not a now concern.
- **Custom OG images per Focus page.** The frontmatter has `ogImage` slots, but generation of the actual `/media/og/focus-*.png` artwork is plan 14 (SEO/OG polish). Until then, the dynamic OG fallback handles both pages.
- **A "table of contents" sticky sidebar inside the article.** Considered and explicitly rejected — the two pages are 6–11 k chars, short enough to read top-to-bottom. A TOC would compete with the editorial restraint that is the whole point of this template. Revisit only if a future Focus page exceeds ~15 k chars.
- **Per-section anchor links / hash navigation.** `rehype-slug` and `rehype-autolink-headings` are configured in plan 03 globally, which means h2/h3 in the body are anchorable and shareable as `#what-actually-causes-weight-loss` etc. We do **not** add a visible anchor-on-hover affordance in this plan — the headings should stay quiet.
- **A newsletter signup inline in the article.** The existing site does not have a working newsletter; per master §7 we defer to launch. Plan 12 (contact + newsletter) owns this.
- **Comments.** Not now, not later.

---

End of plan 08.
