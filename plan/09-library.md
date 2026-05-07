# 09 — Library (`/library` + `/library/[slug]`)

> Implementation plan for the **Library section**: editorial index page presenting three ebooks, plus three editorial detail pages, each with an external buy CTA. Per master plan §3.9, §3.10, and §7 (Decision 1): **no on-site checkout, no cart, no accounts**. Every "Buy" CTA opens an external URL from the MDX `buyUrl` frontmatter field in a new tab.

---

## 1. Goal

Ship a complete `/library` index and three editorially-presented `/library/[slug]` detail pages backed by MDX in `content/library/*.mdx`. Specifically:

- Render `/library` as **three large alternating editorial cards** (NOT a 3-column tile grid). Each card = oversized book cover mockup + Epilogue title + 3-line description + price + `Open →` linking to its detail page.
- Render `/library/[slug]` as a magazine-style ebook page: **split hero (cover + buy CTA)** → **editorial TOC ("Inside")** → **sample spreads** → **about the author** → **FAQ** → **related ebooks**.
- All three detail pages **statically prerender at build time** via `generateStaticParams` reading `content/library/`.
- Buy CTA is an **external link** parsed from `buyUrl` frontmatter (Gumroad / Lemon Squeezy / Amazon / Stripe payment-link / etc.), opened with `target="_blank" rel="noopener noreferrer"`. The platform name is auto-derived from the URL host so editing `buyUrl` updates the button label without code changes.
- Prices are PKR-formatted with comma-thousands and a savings chip when `salePrice` is present.
- Each detail page emits a JSON-LD `Book` schema for SEO.
- Plausible event `Library / Buy / <slug>` fires on every Buy CTA click for click-through tracking.

Out-of-scope work — explicitly forbidden in this section — is enumerated in §7 below.

---

## 2. Pre-requisites

This plan assumes the following plans have shipped first:

| # | Plan | What we depend on from it |
|---|------|---------------------------|
| 01 | `01-design-system.md` | Tokens (`--cream`, `--cream-deep`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`); Inter + Epilogue via `next/font`; type-scale utilities; `<Container>`, `<Eyebrow>`, `<Heading>`, `<Button>` primitives; the three motion components `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>` |
| 02 | `02-layout-shell.md` | `app/layout.tsx`, `<Nav>` + `<Footer>`, redirect rules in `next.config.js` (specifically the `/shop → /library` and `/shop/[slug] → /library/[slug]` 301s) |
| 03 | `03-content-media-migration.md` | The MDX-loading utility (`lib/mdx.ts` exporting `getContent<T>`, `getAllContent<T>`); image migration into `public/media/library/` (covers + spreads); `next-mdx-remote` configured; `gray-matter` configured; `lib/seo.ts` `buildMetadata()`; the `JsonLd` helper component |

If any of these are missing, **stop and note the gap** rather than re-implementing them in this plan.

---

## 3. Dependencies (packages)

All from the master tech stack (§4) — nothing new is introduced by this section:

- `next-mdx-remote` (v5+) — MDX render
- `gray-matter` — frontmatter parse
- `zod` — frontmatter validation (one schema, see §5.2)
- `clsx` / `tailwind-merge` — utility class composition (already in `lib/cn.ts` from plan 01)
- `schema-dts` — typed JSON-LD `Book` schema
- `motion/react` (Framer Motion v11 successor) — only via existing `<FadeUp>` motion component. **No new motion primitives.**

**No payment SDKs. No commerce libraries. No cart state. No client-side auth.** The Buy CTA is a plain anchor.

---

## 4. Files to create / modify

### 4.1 Routes

| Path | Type | Purpose |
|------|------|---------|
| `app/library/page.tsx` | RSC | `/library` index. Server-loads all three MDX files via `getAllContent<EbookFrontmatter>('library')`, renders `<LibraryGrid>`. |
| `app/library/[slug]/page.tsx` | RSC | Detail page. Implements `generateStaticParams` + `generateMetadata`. Renders the full editorial layout. |
| `app/library/[slug]/not-found.tsx` | RSC | Returned via `notFound()` when the slug doesn't match an MDX file. |

### 4.2 Content

| Path | Purpose |
|------|---------|
| `content/library/diabetes-essentials.mdx` | Diabetes Essentials ebook (PKR 1,500). Cover: `/media/library/diabetes-essentials/cover.png` (renamed from existing `Copy-of-ebook1.png` during plan 03 migration). |
| `content/library/pcos-guidebook.mdx` | PCOS Guidebook (PKR 3,000 → sale 1,500). Cover: `/media/library/pcos-guidebook/cover.jpg` (from `smartmockups_lwwe107j.jpg`). The featured ebook on home + the "savings chip" reference case. |
| `content/library/skin-secrets.mdx` | Skin Secrets (PKR 2,000). Cover: `/media/library/skin-secrets/cover.jpg` (from `smartmockups_lx5u5k3d.jpg`). |

### 4.3 Components

All under `components/marketing/library/`:

| File | Description |
|------|-------------|
| `LibraryGrid.tsx` | Server component. Alternating editorial cards. Takes `ebooks: EbookFrontmatter[]`. Renders 3 stacked sections, alternating `flex-row` / `flex-row-reverse`. |
| `EbookHero.tsx` | Client component (uses `useState` for hover rotation + Plausible click). Split hero with 3D cover rotation and the Buy CTA. |
| `EbookTOC.tsx` | Server component. Numbered editorial list of `toc[]` strings. |
| `SampleSpreads.tsx` | Server component. 3 image previews. Side-scrolls on mobile (`overflow-x-auto snap-x`), 3-column grid on desktop. |
| `AuthorCard.tsx` | Server component. Small portrait + 2-paragraph bio + "More about Dr. Ruhma →" link to `/about`. |
| `RelatedEbooks.tsx` | Server component. Takes `current: string` + `all: EbookFrontmatter[]`, renders the other two as small cards. |
| `BuyButton.tsx` | Client component. Wraps the anchor for Plausible tracking + label derivation. Used by `EbookHero` and reusable from `LibraryGrid` if a quick-buy is wanted later. |

### 4.4 Helpers

| File | Description |
|------|-------------|
| `lib/library.ts` | `EbookFrontmatter` type, `EbookSchema` (Zod), `formatPKR()`, `derivePlatformLabel(buyUrl)`, `computeSavings({price, salePrice})`. Single import surface so both index and detail page reuse the same helpers. |

### 4.5 Concrete code (reference implementations)

Where helpful below, full code is given. These are not optional sketches — implement as written, adjusting only for token names if `01-design-system.md` chose different ones.

---

#### 4.5.1 `lib/library.ts`

```ts
import { z } from "zod";

export const EbookSchema = z.object({
  title: z.string().min(1),
  eyebrow: z.string().min(1),                   // e.g. "Guidebook 02"
  slug: z.string().regex(/^[a-z0-9-]+$/),
  price: z.number().int().positive(),
  salePrice: z.number().int().positive().optional(),
  currency: z.literal("PKR"),
  buyUrl: z.string().url(),
  cover: z.string().startsWith("/media/"),
  sampleSpreads: z.array(z.string().startsWith("/media/")).length(3),
  toc: z.array(z.string().min(1)).min(4).max(12),
  description: z.string().min(40),              // 3-line index description
  pages: z.number().int().positive().optional(),
  format: z.string().optional(),                // "Digital · PDF"
});

export type EbookFrontmatter = z.infer<typeof EbookSchema>;

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

const PLATFORM_LABELS: Record<string, string> = {
  "gumroad.com": "Gumroad",
  "lemonsqueezy.com": "Lemon Squeezy",
  "amazon.com": "Amazon",
  "amazon.in": "Amazon",
  "buy.stripe.com": "Stripe",
  "ko-fi.com": "Ko-fi",
  "payhip.com": "Payhip",
};

export function derivePlatformLabel(buyUrl: string): string {
  try {
    const host = new URL(buyUrl).hostname.replace(/^www\./, "");
    // exact match first
    if (PLATFORM_LABELS[host]) return `Buy on ${PLATFORM_LABELS[host]}`;
    // suffix match (e.g. "store.gumroad.com")
    for (const known of Object.keys(PLATFORM_LABELS)) {
      if (host.endsWith(known)) return `Buy on ${PLATFORM_LABELS[known]}`;
    }
    return "Buy now";
  } catch {
    return "Buy now";
  }
}

export function computeSavings(args: { price: number; salePrice?: number }) {
  if (!args.salePrice || args.salePrice >= args.price) return null;
  const saved = args.price - args.salePrice;
  const pct = Math.round((saved / args.price) * 100);
  return { saved, pct, label: `Save ${formatPKR(saved)} (${pct}%)` };
}
```

---

#### 4.5.2 `components/marketing/library/EbookHero.tsx` (full reference)

```tsx
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  type EbookFrontmatter,
  computeSavings,
  derivePlatformLabel,
  formatPKR,
} from "@/lib/library";

type Props = { ebook: EbookFrontmatter };

export function EbookHero({ ebook }: Props) {
  const { title, eyebrow, cover, price, salePrice, buyUrl, format, pages, slug } = ebook;
  const savings = computeSavings({ price, salePrice });
  const buyLabel = derivePlatformLabel(buyUrl);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  // 4° max in either axis. Disabled if user prefers reduced motion.
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    const ry = (px - 0.5) * 8;   // -4..4
    const rx = -(py - 0.5) * 8;  // -4..4
    setTilt({ rx, ry });
  }
  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  function onBuyClick() {
    // Plausible custom event. Falls back silently if not loaded.
    if (typeof window !== "undefined" && "plausible" in window) {
      // @ts-expect-error – plausible global is injected by their script
      window.plausible("Library / Buy", { props: { slug } });
    }
  }

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 md:grid-cols-2 md:gap-20 md:px-10">
        {/* LEFT: cover with 3D rotation */}
        <div
          className="flex items-center justify-center"
          style={{ perspective: "1400px" }}
        >
          <div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative aspect-[3/4] w-full max-w-[420px] transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src={cover}
              alt={`${title} — cover`}
              fill
              priority
              sizes="(min-width: 768px) 420px, 80vw"
              className="rounded-sm object-cover shadow-[0_30px_60px_-20px_rgba(26,26,26,0.35)]"
            />
          </div>
        </div>

        {/* RIGHT: copy + price + CTA */}
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-mauve">
            {eyebrow}
          </p>
          <h1 className="font-display text-[clamp(40px,5vw,72px)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
            {title}
          </h1>

          {/* Price block */}
          <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            {salePrice ? (
              <>
                <span className="font-display text-[32px] font-medium text-ink">
                  {formatPKR(salePrice)}
                </span>
                <span className="text-[18px] text-ink-soft line-through">
                  {formatPKR(price)}
                </span>
              </>
            ) : (
              <span className="font-display text-[32px] font-medium text-ink">
                {formatPKR(price)}
              </span>
            )}
            {savings && (
              <span className="rounded-full bg-shell px-3 py-1 text-[13px] font-medium text-mauve-deep">
                {savings.label}
              </span>
            )}
          </div>

          {/* External buy CTA */}
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onBuyClick}
            data-plausible-event="Library / Buy"
            data-plausible-event-slug={slug}
            className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-ink px-7 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-mauve-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mauve"
          >
            <span>{buyLabel}</span>
            <span aria-hidden>→</span>
          </a>

          <p className="mt-4 text-[13px] text-ink-soft/80">
            Opens in a new tab. Checkout is handled on the publisher&rsquo;s site.
          </p>

          {(format || pages) && (
            <p className="mt-6 text-[14px] text-ink-soft">
              {[format, pages ? `~${pages} pages` : null]
                .filter(Boolean)
                .join(" · ")}
              {" · "}Instant delivery
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
```

Notes for the EbookHero:

- The 4° (×2 axes = 8° span) tilt is driven by **mouse position**, not a static hover. This is the signature interaction of the page.
- `prefers-reduced-motion` short-circuits the tilt entirely.
- `priority` on `<Image>` because this is the LCP element.
- The `data-plausible-*` attributes are belt-and-braces: if Plausible's outbound-link script is configured, it'll pick the click up; the inline `onBuyClick` handler is the primary path.
- The trailing arrow is a hairline `→`, deliberately **not** a Lucide icon — keeping the typography pure.

---

#### 4.5.3 `components/marketing/library/LibraryGrid.tsx` (full reference)

```tsx
import Image from "next/image";
import Link from "next/link";
import { type EbookFrontmatter, computeSavings, formatPKR } from "@/lib/library";

type Props = { ebooks: EbookFrontmatter[] };

export function LibraryGrid({ ebooks }: Props) {
  return (
    <section className="bg-cream">
      {ebooks.map((book, i) => {
        const savings = computeSavings({ price: book.price, salePrice: book.salePrice });
        const reverse = i % 2 === 1;
        return (
          <article
            key={book.slug}
            className={`border-t border-ink/10 ${i === ebooks.length - 1 ? "border-b" : ""}`}
          >
            <div
              className={[
                "mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-12 md:gap-16 md:px-10 md:py-28",
                reverse ? "md:[&>figure]:order-2" : "",
              ].join(" ")}
            >
              {/* Cover */}
              <figure
                className={`md:col-span-6 ${reverse ? "md:col-start-7" : "md:col-start-1"}`}
              >
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[460px]">
                  <Image
                    src={book.cover}
                    alt={`${book.title} — cover`}
                    fill
                    sizes="(min-width: 768px) 460px, 80vw"
                    className="rounded-sm object-cover shadow-[0_24px_50px_-18px_rgba(26,26,26,0.3)]"
                  />
                </div>
              </figure>

              {/* Copy */}
              <div
                className={`md:col-span-5 ${reverse ? "md:col-start-1" : "md:col-start-8"}`}
              >
                <p className="mb-4 text-[12px] font-medium uppercase tracking-[0.16em] text-mauve">
                  {book.eyebrow}
                </p>
                <h2 className="font-display text-[clamp(32px,4vw,56px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
                  {book.title}
                </h2>
                <p className="mt-6 max-w-[44ch] text-[17px] leading-[1.6] text-ink-soft">
                  {book.description}
                </p>

                <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {book.salePrice ? (
                    <>
                      <span className="text-[20px] font-medium text-ink">
                        {formatPKR(book.salePrice)}
                      </span>
                      <span className="text-[15px] text-ink-soft line-through">
                        {formatPKR(book.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-[20px] font-medium text-ink">
                      {formatPKR(book.price)}
                    </span>
                  )}
                  {savings && (
                    <span className="rounded-full bg-shell px-2.5 py-0.5 text-[12px] font-medium text-mauve-deep">
                      {savings.label}
                    </span>
                  )}
                </div>

                <Link
                  href={`/library/${book.slug}`}
                  className="mt-10 inline-flex items-center gap-2 border-b border-ink/40 pb-1 text-[15px] font-medium text-ink transition-colors hover:border-mauve hover:text-mauve-deep"
                >
                  Open <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
```

---

#### 4.5.4 `components/marketing/library/EbookTOC.tsx` (full reference)

```tsx
import type { EbookFrontmatter } from "@/lib/library";

type Props = { toc: EbookFrontmatter["toc"]; intro?: React.ReactNode };

export function EbookTOC({ toc, intro }: Props) {
  return (
    <section className="bg-cream-deep py-24 md:py-32">
      <div className="mx-auto max-w-[1080px] px-6 md:px-10">
        <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-mauve">
          Inside
        </p>
        <h2 className="mt-4 font-display text-[clamp(32px,4vw,56px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
          What you&rsquo;ll find in these pages
        </h2>

        {intro && (
          <div className="prose-editorial mt-8 max-w-[60ch] text-[17px] leading-[1.7] text-ink-soft">
            {intro}
          </div>
        )}

        <ol className="mt-16 divide-y divide-ink/15 border-y border-ink/15">
          {toc.map((item, i) => (
            <li key={i} className="grid grid-cols-[80px_1fr] items-baseline gap-6 py-6 md:grid-cols-[120px_1fr] md:py-8">
              <span
                className="font-display text-[clamp(40px,5vw,72px)] font-medium leading-none tracking-[-0.04em] text-mauve tabular-nums"
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[18px] leading-[1.4] text-ink md:text-[20px]">
                {item}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

The `intro` prop is the place where the MDX **body** (the prose intro before the FAQ) is mounted — see §5.4 for the page wiring.

---

#### 4.5.5 `components/marketing/library/SampleSpreads.tsx` (sketch)

Server component. Three image previews. Mobile = horizontal snap-scroll (`flex overflow-x-auto snap-x snap-mandatory gap-4`); desktop = 3-column grid. Each `<Image>` uses `aspect-[4/5]`, `sizes="(min-width: 768px) 33vw, 80vw"`, alt text "Sample spread {n} from {title}". Wrap in `<FadeUp>` from the motion kit.

#### 4.5.6 `components/marketing/library/AuthorCard.tsx` (sketch)

Server component. Reads from `content/site.ts` (the practitioner blob — assumed available from plan 02). 2-column on desktop (portrait left, prose right), stacked on mobile. Portrait = `Image` with `aspect-[4/5]`, max width 280px, `rounded-sm`. Two short paragraphs of bio. Footer link `More about Dr. Ruhma →` to `/about` styled the same as the index "Open →" link.

#### 4.5.7 `components/marketing/library/RelatedEbooks.tsx` (sketch)

Server component. `ebooks.filter(e => e.slug !== current).slice(0, 2)`. Renders two compact cards in a 2-col grid: small cover (max 220px), title (Epilogue 24px), price, link to detail. **Not** a duplicate of the editorial index — these are intentionally smaller, simpler tiles.

---

## 5. Step-by-step tasks

### 5.1 Author content

For each of the three ebooks, create `content/library/<slug>.mdx`. Use the **exact frontmatter contract** from master §3.10 — schema enforced by `EbookSchema` in `lib/library.ts`.

**`content/library/diabetes-essentials.mdx`** — initial frontmatter:

```yaml
---
title: Diabetes Essentials
eyebrow: Guidebook 01
slug: diabetes-essentials
price: 1500
currency: PKR
buyUrl: https://gumroad.com/l/placeholder-diabetes
cover: /media/library/diabetes-essentials/cover.png
sampleSpreads:
  - /media/library/diabetes-essentials/spread-1.png
  - /media/library/diabetes-essentials/spread-2.png
  - /media/library/diabetes-essentials/spread-3.png
toc:
  - "What blood sugar is actually doing"
  - "The plate model — for real life, not labs"
  - "Carbs that work for you, not against you"
  - "Mornings, mid-meals, and the dawn phenomenon"
  - "Pairing — the protein + fibre rule"
  - "Eating out without panic"
  - "Reading a glucose curve"
  - "When to call your doctor"
description: A practical guide to eating with type 2 diabetes — built around real Pakistani meals, not Western templates. What to eat, what to skip, and how to read your numbers without losing the joy of food.
pages: 56
format: "Digital · PDF"
---
```

**`content/library/pcos-guidebook.mdx`** — featured ebook with sale:

```yaml
---
title: PCOS Guidebook
eyebrow: Guidebook 02
slug: pcos-guidebook
price: 3000
salePrice: 1500
currency: PKR
buyUrl: https://gumroad.com/l/placeholder-pcos
cover: /media/library/pcos-guidebook/cover.jpg
sampleSpreads:
  - /media/library/pcos-guidebook/spread-1.jpg
  - /media/library/pcos-guidebook/spread-2.jpg
  - /media/library/pcos-guidebook/spread-3.jpg
toc:
  - "What's actually happening with PCOS"
  - "The hormonal cascade in plain language"
  - "Insulin resistance — the hidden lever"
  - "Building a PCOS-aware plate"
  - "Cycle-syncing meals, gently"
  - "Movement that calms, not punishes"
  - "Sleep, stress, and the cortisol loop"
  - "Supplements: what's worth it, what isn't"
  - "Tracking progress beyond the scale"
description: A clinical dietitian's guide to managing PCOS through food, movement, and rhythm — written for women in South Asia, with realistic meals and honest answers about what actually moves the needle.
pages: 72
format: "Digital · PDF"
---
```

**`content/library/skin-secrets.mdx`** — third book:

```yaml
---
title: Skin Secrets
eyebrow: Guidebook 03
slug: skin-secrets
price: 2000
currency: PKR
buyUrl: https://gumroad.com/l/placeholder-skin
cover: /media/library/skin-secrets/cover.jpg
sampleSpreads:
  - /media/library/skin-secrets/spread-1.jpg
  - /media/library/skin-secrets/spread-2.jpg
  - /media/library/skin-secrets/spread-3.jpg
toc:
  - "The gut-skin axis, explained simply"
  - "Foods that calm inflammation"
  - "Hydration that actually shows"
  - "Acne, hormones, and the dairy question"
  - "Glow from the inside — a 4-week menu"
  - "Skin-supporting micronutrients"
  - "What to skip, no matter what TikTok says"
description: Glow isn't a serum — it's a system. A nutritionist's playbook for clearer, calmer skin, built on what your gut, hormones, and plate are doing together.
pages: 48
format: "Digital · PDF"
---
```

The MDX **body** for each file is the prose intro that appears under the "Inside" heading on the detail page, ending with the FAQ list. Conventional structure:

```mdx
import { FAQ } from "@/components/marketing/FAQ";

These pages are written for the woman who&rsquo;s tried everything and is
ready for a calmer, evidence-based path. No fad diets. No shaming. Just
practical, regionally-relevant guidance from a clinical dietitian.

Each chapter pairs the *why* with a *what to do today* section so you can
start small and build a routine that actually fits your life.

<FAQ
  items={[
    { q: "Is this an eBook or a printed copy?", a: "Digital PDF, delivered instantly after purchase via the publisher&rsquo;s site." },
    { q: "Do I need a clinical diagnosis to use it?", a: "No — but it&rsquo;s designed to complement, not replace, your doctor's plan. If you&rsquo;re unsure, book a 1:1 consultation." },
    { q: "Can I get a refund?", a: "Refund policy is set by the platform you buy from (Gumroad, Lemon Squeezy, etc.) and detailed at checkout." },
    { q: "Will it work for non-Pakistani kitchens?", a: "Yes — the principles travel. Ingredient swaps are noted throughout." }
  ]}
/>
```

The `<FAQ>` component is assumed shipped in plan 04 (programs/focus pages already need it). If not, this plan adds a tiny local fallback in `components/marketing/library/EbookFAQ.tsx`.

> **Content TODO** flagged for Dr. Ruhma in `MIGRATION_NOTES.md`:
> 1. Replace each `buyUrl` placeholder with the real Gumroad / Lemon Squeezy / Amazon / Stripe payment link **before launch**. The build will not fail with placeholders, but Plausible click-through will track to dead URLs.
> 2. Provide three real **sample-spread JPG/PNGs** per ebook (interior pages). Until then, plan 03 should generate stub spreads from the cover (or a pale `--cream-deep` placeholder card).

### 5.2 Implement helpers

Create `lib/library.ts` exactly as in §4.5.1. Add a unit-style smoke check to a future test plan (out of scope here): `derivePlatformLabel('https://gumroad.com/l/x')` → `"Buy on Gumroad"`; `derivePlatformLabel('https://example.com/x')` → `"Buy now"`.

### 5.3 Implement the index page

`app/library/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getAllContent } from "@/lib/mdx";
import { EbookSchema, type EbookFrontmatter } from "@/lib/library";
import { LibraryGrid } from "@/components/marketing/library/LibraryGrid";
import { Container } from "@/components/ui/Container";
import { CtaBand } from "@/components/marketing/CtaBand";
import { FadeUp } from "@/components/motion/FadeUp";

export const metadata: Metadata = {
  title: "The Library — Healthy You By Ruhma",
  description:
    "Three guidebooks. Practical, evidence-based, written for women who want answers.",
  openGraph: { title: "The Library — Healthy You By Ruhma" },
};

export default async function LibraryIndexPage() {
  const all = await getAllContent<EbookFrontmatter>("library", EbookSchema);
  // Stable order: by eyebrow ("Guidebook 01" / "02" / "03")
  const ebooks = [...all].sort((a, b) => a.eyebrow.localeCompare(b.eyebrow));

  return (
    <main className="bg-cream">
      <header className="pt-28 pb-12 md:pt-40 md:pb-20">
        <Container>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-mauve">
            The Library
          </p>
          <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(48px,7vw,112px)] font-medium leading-[0.95] tracking-[-0.04em] text-ink">
            Three guidebooks.
          </h1>
          <p className="mt-8 max-w-[52ch] text-[18px] leading-[1.6] text-ink-soft">
            Practical, evidence-based, written for women who want answers — not
            another fad. Each one is the distilled version of conversations
            Dr. Ruhma has had with hundreds of clients.
          </p>
        </Container>
      </header>

      <FadeUp>
        <LibraryGrid ebooks={ebooks} />
      </FadeUp>

      <CtaBand
        eyebrow="Not sure where to start?"
        title="Book a consultation."
        href="/programs/consultation"
        cta="Book a consultation"
      />
    </main>
  );
}
```

### 5.4 Implement the detail page

`app/library/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { Book, WithContext } from "schema-dts";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllContent, getContent } from "@/lib/mdx";
import { EbookSchema, type EbookFrontmatter, formatPKR } from "@/lib/library";
import { EbookHero } from "@/components/marketing/library/EbookHero";
import { EbookTOC } from "@/components/marketing/library/EbookTOC";
import { SampleSpreads } from "@/components/marketing/library/SampleSpreads";
import { AuthorCard } from "@/components/marketing/library/AuthorCard";
import { RelatedEbooks } from "@/components/marketing/library/RelatedEbooks";
import { JsonLd } from "@/components/seo/JsonLd";
import { FadeUp } from "@/components/motion/FadeUp";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllContent<EbookFrontmatter>("library", EbookSchema);
  return all.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const ebook = await getContent<EbookFrontmatter>("library", slug, EbookSchema);
  if (!ebook) return {};
  const { title, description, salePrice, price, cover } = ebook.frontmatter;
  const priceLabel = salePrice ? formatPKR(salePrice) : formatPKR(price);
  return {
    title: `${title} — ${priceLabel} — Healthy You By Ruhma`,
    description,
    openGraph: {
      title,
      description,
      images: [cover],
      type: "book",
    },
    alternates: { canonical: `/library/${slug}` },
  };
}

export default async function EbookDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const ebook = await getContent<EbookFrontmatter>("library", slug, EbookSchema);
  if (!ebook) notFound();

  const all = await getAllContent<EbookFrontmatter>("library", EbookSchema);
  const fm = ebook.frontmatter;

  const jsonLd: WithContext<Book> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: fm.title,
    bookFormat: "https://schema.org/EBook",
    author: { "@type": "Person", name: "Dr. Ruhma", url: "https://dietitianruhma.com/about" },
    image: fm.cover,
    description: fm.description,
    inLanguage: "en",
    numberOfPages: fm.pages,
    offers: {
      "@type": "Offer",
      price: (fm.salePrice ?? fm.price).toString(),
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: fm.buyUrl,
    },
  };

  return (
    <main>
      <JsonLd data={jsonLd} />
      <EbookHero ebook={fm} />

      <FadeUp>
        <EbookTOC
          toc={fm.toc}
          intro={<MDXRemote source={ebook.body} />}
        />
      </FadeUp>

      <FadeUp>
        <SampleSpreads images={fm.sampleSpreads} title={fm.title} />
      </FadeUp>

      <FadeUp>
        <AuthorCard />
      </FadeUp>

      <FadeUp>
        <RelatedEbooks current={fm.slug} all={all} />
      </FadeUp>
    </main>
  );
}
```

Notes on the detail page:

- The MDX body — which includes the `<FAQ>` component — is rendered **inside** `<EbookTOC intro={...}>`. That keeps the FAQ visually inside the same editorial block as the TOC intro. If a separate FAQ section feels better in QA, refactor to a sibling without changing MDX content.
- `getContent`'s return shape (`{ frontmatter, body }`) matches plan 03's `lib/mdx.ts` API. If the actual API differs there (e.g. returns compiled MDX), adjust the call site only.
- `notFound()` triggers `app/library/[slug]/not-found.tsx`. That file should be a simple typographic block that links back to `/library`.

### 5.5 Wire redirects

Plan 02 owns `next.config.js`. Confirm these rules from master §6:

```
/shop                        → /library
/shop/diabetes-essentials    → /library/diabetes-essentials
/shop/pcos-guidebook         → /library/pcos-guidebook
/shop/skin-secrets           → /library/skin-secrets
/cart                        → /library
/checkout                    → /library
/my-account                  → /library
```

If they're missing in plan 02, raise a blocker — they're not in scope to add here.

### 5.6 QA pass

1. `pnpm dev` — visit `/library`, confirm three alternating sections, no horizontal overflow at 320px, 768px, 1280px, 1600px viewports.
2. Visit each `/library/<slug>` — confirm:
   - Cover loads, no CLS, hovering tilts ≤ 4° per axis.
   - `prefers-reduced-motion: reduce` (DevTools → Rendering panel) → tilt is disabled, no other motion plays.
   - Buy button reads `Buy on Gumroad →` (matches the placeholder host).
   - Click opens `https://gumroad.com/l/placeholder-...` in a new tab.
   - DevTools Network tab fires a Plausible event request `Library / Buy` with `props.slug=<slug>`.
   - Sale price + savings chip render only on `pcos-guidebook`.
   - JSON-LD validates in the Schema.org validator.
3. `pnpm build` — confirm three pages prerender (`○ /library/diabetes-essentials`, etc., as static).
4. Lighthouse on a built detail page: LCP < 2.0s, CLS < 0.05, accessibility 100.
5. axe-core: 0 violations.
6. Tab through the index — each `Open →` reachable, focus ring visible.
7. Tab through a detail page — Buy button reachable, focus ring on `--mauve`, screen reader announces "Buy on Gumroad, opens in new tab".
8. View source: `target="_blank"` and `rel="noopener noreferrer"` present on the buy CTA.

---

## 6. Acceptance criteria

A reviewer can mark this section "done" when **every** item below is true:

- [ ] `app/library/page.tsx` and `app/library/[slug]/page.tsx` exist and render without console errors.
- [ ] All three MDX files exist under `content/library/` and pass `EbookSchema` validation at build.
- [ ] `pnpm build` produces **three** statically-prerendered detail routes via `generateStaticParams` (visible as `○` lines in Next.js build output).
- [ ] `/library` renders three large alternating cards (left, right, left), **never** a 3-column tile grid.
- [ ] Each detail page's Buy CTA is an `<a>` with `href={buyUrl}`, `target="_blank"`, `rel="noopener noreferrer"`, and label derived from the URL host (`Buy on Gumroad →` for `gumroad.com`, `Buy now →` for unknown hosts).
- [ ] Buy click fires Plausible custom event `Library / Buy` with `props.slug` matching the page.
- [ ] Cover hover applies a 3D tilt with **max 4° on each axis** and is suppressed under `prefers-reduced-motion: reduce`.
- [ ] Price is rendered as `PKR 1,500` (comma-thousands, leading "PKR ").
- [ ] When `salePrice` is set: original price is struck through, new price is shown in larger weight, and a `Save PKR 1,500 (50%)` chip is visible. Verified concretely on `/library/pcos-guidebook`.
- [ ] Numbered TOC renders with two-digit Epilogue numerals (`01`, `02`, …) in `--mauve`.
- [ ] Sample spreads render as a 3-column grid on desktop and a horizontal snap-scroll on mobile.
- [ ] `RelatedEbooks` shows exactly the **other two** ebooks (never the current one).
- [ ] Each detail page emits a valid JSON-LD `Book` (validates in https://validator.schema.org).
- [ ] Lighthouse on a built detail page: Performance ≥ 95, Accessibility = 100, SEO ≥ 95, Best Practices ≥ 95.
- [ ] axe-core run on `/library` and one detail page: **0 violations**.
- [ ] Keyboard tab order on the detail page: skip-link → nav → cover image (skipped, decorative) → buy button → TOC items (decorative, skipped) → sample spread images (skipped, alt only) → about link → related cards. No keyboard traps.
- [ ] `MIGRATION_NOTES.md` lists the two content TODOs (real `buyUrl` values, real sample-spread images) under "Library — to provide before launch".
- [ ] No `buy`-related code path imports any payment SDK or commerce library.

---

## 7. Out of scope (DO NOT IMPLEMENT)

The following are explicitly **forbidden** for this section per master plan §7 (Decision 1) and §3.9. Adding any of them triggers a redesign review:

- **No on-site checkout, payment forms, or "Add to cart" buttons.** The site has no commerce surface. Period.
- **No client-side cart state** (`useCart`, Context providers, Zustand stores, etc.). There is no cart.
- **No user accounts, login, signup, "saved books," wishlists, or order history.**
- **No Stripe / PayFast / Razorpay / WooCommerce / Shopify / Snipcart / Foxy / Lemon Squeezy SDK / Gumroad SDK integration.** The Buy CTA is a plain `<a href={buyUrl}>`. That is the entire commerce surface.
- **No price computation in code beyond `formatPKR` + `computeSavings` for display.** Prices are static MDX frontmatter values. No tax math, no shipping math, no currency conversion.
- **No webhooks, no order sync, no inventory tracking, no licence-key generation.** All of that belongs to the external publisher (Gumroad / Lemon Squeezy / etc.).
- **No on-site PDF preview or download.** The "Sample spreads" are pre-rendered image previews only.
- **No reviews / ratings / comment system on detail pages.** Trust signals come from testimonials elsewhere on the site, not from a UGC layer here.
- **No newsletter signup embedded in the buy flow.** Newsletter is a global footer concern (plan 02), not a Library concern.
- **No A/B testing harness around the Buy CTA.** Plausible custom events are sufficient for click-through measurement.
- **No additional motion primitives.** Reuse `<FadeUp>` from plan 01. The 3D tilt on the cover is a **CSS transform driven by mouse position**, not a Framer Motion gesture, and is the only Library-specific interaction.
- **No additional fonts.** Inter + Epilogue only.
- **No new color tokens.** Use the palette from plan 01.
- **No PDF generation, no print stylesheet for the ebook itself.** The PDFs live on the publisher's platform.
- **No "instant download after purchase" flow on this site.** The publisher handles delivery — the page only states the format ("Digital · PDF, instant delivery") for buyer reassurance.

If a future requirement contradicts any item above, it must come back through the master plan (§7) and update Decision 1 first — not be patched into this section.
