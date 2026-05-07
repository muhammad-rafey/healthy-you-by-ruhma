# 07 — Programs (Diet Planning, Coaching, Consultation)

This plan implements the three Program pages — `/programs/diet-planning`, `/programs/coaching`, `/programs/consultation` — under a single dynamic route, sharing a template but each ending on a distinct, on-brand signature section. Programs are the core conversion surface of the site; they are the only place price, scope and "book" intent meet on the page. Treat this plan as opinionated: where the master plan said "scrollable card" or "vertical timeline", the JSX in §4 is the canonical implementation.

---

## 1. Goal

Ship three production-ready program pages that:

1. **Convert.** Each page has a clear hero, an unambiguous price, and one primary CTA repeated at top, mid-page (in the Pricing card) and in the footer CTA band.
2. **Earn editorial dignity.** The 19k / 23k / 13k chars of legacy WP copy are restructured — not pasted — into a section schema that mirrors the Aesop / Cup of Jo / NYT Cooking restraint described in master §1.
3. **Differentiate by signature.** Diet Planning carries a "sample week" scroll-snap card. Coaching carries a vertical 8-week timeline with mauve milestones. Consultation carries an inline Cal.com booking widget skinned to brand colors. Each is the page's reason to exist beyond the shared template.
4. **Stay one route, three MDX files.** All program-specific copy, pricing, FAQ and section data live in `content/programs/{slug}.mdx` frontmatter + MDX body. The dynamic route reads, type-validates and renders.
5. **Ship correct SEO.** Each page emits a `Service` JSON-LD with `provider`, `areaServed`, `offers.priceCurrency: "PKR"` and `offers.price`, plus standard `<title>` / `<meta>` / OG image.
6. **Be reusable.** The Program template (`<ProgramHero>`, `<Included>`, `<HowItWorks>`, `<PricingCard>`, `<ProgramTestimonials>`, `<ProgramFAQ>`) is shared verbatim; only the signature slot (`<SampleWeek>` | `<CoachingTimeline>` | `<BookingWidget>`) varies.

---

## 2. Pre-requisites

Implement only after these plans have landed on `main`:

- **01 — Design System.** Tokens (`--cream`, `--cream-deep`, `--shell`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`), Inter + Epilogue via `next/font`, the type scale (Display XL → Caption), and the three motion utilities `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`. Also: `<Button>`, `<Eyebrow>`, `<Heading>`, `<Container>` primitives and the shared `<Section>` wrapper.
- **02 — Layout shell.** `app/layout.tsx`, `<Nav>`, `<Footer>`, redirects in `next.config.js` (in particular `/diet-plannig-program → /programs/diet-planning`, `/coaching-program → /programs/coaching`, `/conultation-call → /programs/consultation`).
- **03 — Content & media migration.** All program photography, ingredient/botanical SVGs and section images already optimized into `public/media/programs/{diet-planning,coaching,consultation}/…` and `public/illustrations/`. The migration script must have produced AVIF + WEBP at sizes [400, 800, 1200, 1600, 2400].
- **06 — Services overview.** `/services` exists and link-targets each program page; `app/services/page.tsx` already imports a shared `ProgramCard` summary component. The cards on `/services` and the hero of each program must not contradict each other (price, eyebrow, CTA label).

If any of these are missing, **stop and surface the gap** rather than stubbing them inside this plan.

---

## 3. Dependencies

Add (to `package.json`):

```jsonc
{
  "dependencies": {
    "@calcom/embed-react": "^1.5.3"   // Consultation booking widget. See alternatives below.
  }
}
```

### Booking widget choice

The master plan (§3.6 and §7) defers the final pick to Dr. Ruhma. We implement against **Cal.com** by default because:

- Brand-flexible: `@calcom/embed-react` exposes a `theme` prop and a `cssVarsPerTheme` config that lets us inject `--cal-brand`, `--cal-brand-emphasis`, `--cal-bg-emphasis` mapped to our `--mauve`, `--mauve-deep`, `--cream-deep`. Calendly's branding is comparatively locked.
- Open-source and self-hostable later if the practice grows.
- Free tier covers the expected 1:1 consultation volume.

**Drop-in alternatives** (swap one component, not the page):

| Option | Package | Component change |
|---|---|---|
| **Calendly** | `react-calendly` | Replace `<BookingWidget>` body with `<InlineWidget url="…" styles={{ height: 720 }} />`. Branding limited to a single accent color via Calendly settings. |
| **Plain link-out** (zero-dep fallback) | n/a | Replace `<BookingWidget>` body with a `<Button>` linking to `https://cal.com/ruhma/15min` in a new tab. Keeps the page shippable if the embed fails review. |

If Dr. Ruhma picks Calendly, swap the dep, change one component file, and update the `BookingWidget` JSX (~15 lines) — no changes elsewhere.

### Other dependencies (already added by earlier plans)

- `next-mdx-remote` v5 + `gray-matter` — used here to read `content/programs/*.mdx` frontmatter and body.
- `motion` v11 — already present from the design system; used for fade-up reveals and the timeline dot-pulse on entry.
- `schema-dts` — already present from the SEO plan; used for the `Service` JSON-LD.
- `zod` — for frontmatter validation in `lib/programs.ts`.

No client-state library is needed (no carts, no filters); the sample-week scroll uses native CSS scroll-snap and the timeline is purely declarative.

---

## 4. Files to create / modify

### 4.1 Files to create

```
app/programs/[slug]/page.tsx
app/programs/[slug]/opengraph-image.tsx        # optional — only if 06-services didn't already centralize OG
content/programs/diet-planning.mdx
content/programs/coaching.mdx
content/programs/consultation.mdx
components/marketing/programs/ProgramHero.tsx
components/marketing/programs/Included.tsx
components/marketing/programs/HowItWorks.tsx
components/marketing/programs/SampleWeek.tsx
components/marketing/programs/CoachingTimeline.tsx
components/marketing/programs/BookingWidget.tsx
components/marketing/programs/PricingCard.tsx
components/marketing/programs/ProgramTestimonials.tsx
components/marketing/programs/ProgramFAQ.tsx
components/marketing/programs/CTABand.tsx       # only if not provided by 02-layout-shell
lib/programs.ts                                 # frontmatter loader + zod schema + slug list
```

### 4.2 Files to modify

```
next.config.js     # confirm the three /programs redirects from §2 are present
app/sitemap.ts     # add the three /programs/<slug> URLs
package.json       # add @calcom/embed-react
```

### 4.3 Frontmatter contract

Every `content/programs/*.mdx` file MUST validate against this zod schema (in `lib/programs.ts`):

```ts
// lib/programs.ts
import { z } from "zod";

export const ProgramFrontmatterSchema = z.object({
  title: z.string().min(2),
  eyebrow: z.string().min(2),                        // e.g. "Program 01"
  slug: z.enum(["diet-planning", "coaching", "consultation"]),
  priceFrom: z.number().int().positive(),            // PKR, integer rupees
  currency: z.literal("PKR"),
  heroImage: z.string().startsWith("/media/"),
  heroImageAlt: z.string().min(4),
  ctaLabel: z.string().min(2),                       // "Book a consultation" / "Reserve your slot"
  ctaHref: z.string().min(1),                        // "#pricing" or external booking URL
  description: z.string().min(40),                   // <meta name="description"> + JSON-LD
  ogImage: z.string().startsWith("/media/").optional(),
  // Section data below — kept in frontmatter so MDX body stays prose-only.
  included: z.array(z.object({
    icon: z.string(),                                // matches a key in lib/illustrations
    title: z.string(),
    body: z.string(),
  })).length(6),
  howItWorks: z.array(z.object({
    n: z.number().int().min(1).max(4),
    title: z.string(),
    body: z.string(),
  })).length(4),
  testimonials: z.array(z.object({
    quote: z.string().min(60),
    name: z.string(),
    context: z.string().optional(),                  // e.g. "PCOS, 9 months"
  })).length(2),
  pricing: z.object({
    headline: z.string(),                            // "PKR 25,000 / month"
    bullets: z.array(z.string()).min(3).max(8),
    note: z.string().optional(),                     // "Cancel anytime."
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(4).max(8),
  // Per-signature data (only the matching slug uses its own field).
  sampleWeek: z.array(z.object({
    day: z.string(),                                 // "Monday"
    meals: z.object({
      breakfast: z.string(),
      lunch: z.string(),
      snack: z.string(),
      dinner: z.string(),
    }),
  })).length(7).optional(),
  timeline: z.array(z.object({
    week: z.number().int().min(1).max(8),
    title: z.string(),
    body: z.string(),
    milestone: z.boolean().optional(),               // true → larger dot, italic title
  })).length(8).optional(),
  booking: z.object({
    provider: z.enum(["cal", "calendly", "link"]),
    calLink: z.string().optional(),                  // "ruhma/consultation-15min"
    calendlyUrl: z.string().url().optional(),
    fallbackUrl: z.string().url().optional(),
  }).optional(),
});

export type ProgramFrontmatter = z.infer<typeof ProgramFrontmatterSchema>;

export const PROGRAM_SLUGS = ["diet-planning", "coaching", "consultation"] as const;
```

The loader:

```ts
// lib/programs.ts (continued)
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PROGRAMS_DIR = path.join(process.cwd(), "content", "programs");

export async function loadProgram(slug: string) {
  if (!PROGRAM_SLUGS.includes(slug as (typeof PROGRAM_SLUGS)[number])) return null;
  const file = await fs.readFile(path.join(PROGRAMS_DIR, `${slug}.mdx`), "utf8");
  const { data, content } = matter(file);
  const frontmatter = ProgramFrontmatterSchema.parse(data);
  // Per-signature cross-validation: each slug must carry its own data block.
  if (frontmatter.slug === "diet-planning" && !frontmatter.sampleWeek) {
    throw new Error("diet-planning.mdx must define sampleWeek (7 days)");
  }
  if (frontmatter.slug === "coaching" && !frontmatter.timeline) {
    throw new Error("coaching.mdx must define timeline (8 weeks)");
  }
  if (frontmatter.slug === "consultation" && !frontmatter.booking) {
    throw new Error("consultation.mdx must define booking config");
  }
  return { frontmatter, body: content };
}

export async function loadAllPrograms() {
  return Promise.all(PROGRAM_SLUGS.map((s) => loadProgram(s).then((r) => r!)));
}
```

### 4.4 Dynamic route — `app/programs/[slug]/page.tsx`

```tsx
// app/programs/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { MDXRemote } from "next-mdx-remote/rsc";
import { loadProgram, PROGRAM_SLUGS } from "@/lib/programs";
import { ProgramHero } from "@/components/marketing/programs/ProgramHero";
import { Included } from "@/components/marketing/programs/Included";
import { HowItWorks } from "@/components/marketing/programs/HowItWorks";
import { SampleWeek } from "@/components/marketing/programs/SampleWeek";
import { CoachingTimeline } from "@/components/marketing/programs/CoachingTimeline";
import { BookingWidget } from "@/components/marketing/programs/BookingWidget";
import { PricingCard } from "@/components/marketing/programs/PricingCard";
import { ProgramTestimonials } from "@/components/marketing/programs/ProgramTestimonials";
import { ProgramFAQ } from "@/components/marketing/programs/ProgramFAQ";
import { CTABand } from "@/components/marketing/CTABand";
import { siteUrl } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  return PROGRAM_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const program = await loadProgram(slug);
  if (!program) return {};
  const { title, description, ogImage, heroImage } = program.frontmatter;
  return {
    title: `${title} — Healthy You By Ruhma`,
    description,
    alternates: { canonical: `/programs/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/programs/${slug}`,
      images: [{ url: ogImage ?? heroImage }],
      type: "website",
    },
  };
}

export default async function ProgramPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const program = await loadProgram(slug);
  if (!program) notFound();
  const { frontmatter: fm, body } = program;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: fm.title,
    description: fm.description,
    provider: {
      "@type": "Person",
      name: "Dr. Ruhma",
      url: `${siteUrl}/about`,
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    serviceType: fm.eyebrow,
    offers: {
      "@type": "Offer",
      price: fm.priceFrom,
      priceCurrency: fm.currency,
      url: `${siteUrl}/programs/${fm.slug}`,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <Script
        id={`jsonld-program-${fm.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProgramHero fm={fm} />
      <Included items={fm.included} />
      <HowItWorks steps={fm.howItWorks} />

      {/* Signature slot — exactly one renders per slug */}
      {fm.slug === "diet-planning" && fm.sampleWeek && (
        <SampleWeek week={fm.sampleWeek} />
      )}
      {fm.slug === "coaching" && fm.timeline && (
        <CoachingTimeline weeks={fm.timeline} />
      )}
      {fm.slug === "consultation" && fm.booking && (
        <BookingWidget booking={fm.booking} />
      )}

      {/* Optional MDX body — long-form prose between signature and testimonials */}
      {body.trim().length > 0 && (
        <section className="bg-cream-deep">
          <div className="container max-w-[680px] py-24 prose prose-editorial">
            <MDXRemote source={body} />
          </div>
        </section>
      )}

      <ProgramTestimonials items={fm.testimonials} />
      <PricingCard pricing={fm.pricing} priceFrom={fm.priceFrom} currency={fm.currency} />
      <ProgramFAQ faq={fm.faq} />
      <CTABand
        line="Ready when you are."
        ctaLabel={fm.ctaLabel}
        ctaHref={fm.ctaHref}
      />
    </>
  );
}
```

Note `dynamicParams = false` — only the three known slugs render; anything else 404s, including any leftover crawler hits to the old WP URLs (which the redirects in `next.config.js` should catch first).

### 4.5 Shared template components

#### 4.5.1 `<ProgramHero>`

Split layout — title block left, image right. On mobile, image stacks below title.

```tsx
// components/marketing/programs/ProgramHero.tsx
import Image from "next/image";
import { Eyebrow, Heading, Container, Button } from "@/components/ui";
import { ImageReveal, LetterStagger, FadeUp } from "@/components/motion";
import type { ProgramFrontmatter } from "@/lib/programs";

export function ProgramHero({ fm }: { fm: ProgramFrontmatter }) {
  return (
    <section className="bg-cream pt-24 pb-20 md:pt-32 md:pb-28">
      <Container className="grid gap-12 md:grid-cols-12 md:gap-16 items-center">
        <div className="md:col-span-6">
          <Eyebrow>{fm.eyebrow}</Eyebrow>
          <LetterStagger>
            <Heading as="h1" size="display" className="mt-4 text-ink">
              {fm.title}
            </Heading>
          </LetterStagger>
          <FadeUp delay={0.1}>
            <p className="mt-6 max-w-prose text-[17px] leading-[1.6] text-ink-soft">
              {fm.description}
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="mt-10 flex items-center gap-6">
              <Button href={fm.ctaHref} variant="primary" size="lg">
                {fm.ctaLabel}
              </Button>
              <span className="text-sm text-ink-soft">
                <span className="text-mauve">From</span>{" "}
                <span className="font-medium text-ink">
                  {fm.currency} {fm.priceFrom.toLocaleString("en-PK")}
                </span>
              </span>
            </div>
          </FadeUp>
        </div>
        <div className="md:col-span-6">
          <ImageReveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image
                src={fm.heroImage}
                alt={fm.heroImageAlt}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </ImageReveal>
        </div>
      </Container>
    </section>
  );
}
```

#### 4.5.2 `<Included>`

6-tile editorial grid, generous whitespace, botanical SVG per tile.

```tsx
// components/marketing/programs/Included.tsx
import { Eyebrow, Heading, Container } from "@/components/ui";
import { FadeUp } from "@/components/motion";
import { Botanical } from "@/components/illustrations";

type Item = { icon: string; title: string; body: string };

export function Included({ items }: { items: Item[] }) {
  return (
    <section className="bg-cream py-24 md:py-32">
      <Container>
        <Eyebrow>What's included</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3 max-w-[14ch]">
          Everything you need, nothing you don't.
        </Heading>
        <ul className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <FadeUp key={it.title} delay={i * 0.05}>
              <li className="flex flex-col">
                <Botanical name={it.icon} className="h-12 w-12 text-ink" />
                <h3 className="mt-6 font-display text-[22px] leading-tight text-ink">
                  {it.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
                  {it.body}
                </p>
              </li>
            </FadeUp>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

#### 4.5.3 `<HowItWorks>`

4 steps. Desktop: horizontal scroll-snap row (`overflow-x-auto snap-x snap-mandatory`). Mobile: vertical stack. Snap behavior is preserved via Tailwind `snap-x snap-mandatory snap-always` on the rail and `snap-start` on each step.

```tsx
// components/marketing/programs/HowItWorks.tsx
import { Eyebrow, Heading, Container } from "@/components/ui";
import { FadeUp } from "@/components/motion";

type Step = { n: number; title: string; body: string };

export function HowItWorks({ steps }: { steps: Step[] }) {
  return (
    <section className="bg-cream-deep py-24 md:py-32">
      <Container>
        <Eyebrow>How it works</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3 max-w-[16ch]">
          Four steps from inquiry to result.
        </Heading>
      </Container>
      <div
        className="mt-16 flex snap-x snap-mandatory gap-8 overflow-x-auto px-6 pb-8 md:px-12
                   md:flex-row flex-col md:overflow-x-auto overflow-x-visible"
        role="list"
      >
        {steps.map((s, i) => (
          <FadeUp key={s.n} delay={i * 0.05}>
            <article
              role="listitem"
              className="snap-start shrink-0 basis-[80%] md:basis-[360px] bg-paper px-8 py-10
                         border-l-2 border-mauve/30"
            >
              <span className="font-display text-[64px] leading-none text-mauve">
                0{s.n}
              </span>
              <h3 className="mt-6 font-display text-[26px] leading-tight text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
                {s.body}
              </p>
            </article>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
```

#### 4.5.4 `<PricingCard>`

Single card, large headline price, bullet list, primary CTA. Anchored to `#pricing` so hero CTAs (`ctaHref: "#pricing"`) jump here.

```tsx
// components/marketing/programs/PricingCard.tsx
import { Container, Eyebrow, Heading, Button } from "@/components/ui";
import { FadeUp } from "@/components/motion";

type Pricing = {
  headline: string;
  bullets: string[];
  note?: string;
  ctaLabel: string;
  ctaHref: string;
};

export function PricingCard({
  pricing,
  priceFrom,
  currency,
}: {
  pricing: Pricing;
  priceFrom: number;
  currency: "PKR";
}) {
  return (
    <section id="pricing" className="bg-cream py-24 md:py-32">
      <Container className="max-w-[820px]">
        <Eyebrow>Pricing</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3">
          {pricing.headline}
        </Heading>
        <FadeUp>
          <div className="mt-10 bg-paper border border-ink/10 px-8 py-10 md:px-12 md:py-14">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[80px] leading-none text-ink">
                {priceFrom.toLocaleString("en-PK")}
              </span>
              <span className="text-[18px] uppercase tracking-[0.16em] text-mauve">
                {currency}
              </span>
            </div>
            <ul className="mt-10 space-y-3 text-[16px] leading-[1.6] text-ink-soft">
              {pricing.bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span aria-hidden className="mt-[10px] h-px w-4 bg-mauve" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
              <Button href={pricing.ctaHref} variant="primary" size="lg">
                {pricing.ctaLabel}
              </Button>
              {pricing.note && (
                <span className="text-[13px] tracking-[0.04em] text-ink-soft">
                  {pricing.note}
                </span>
              )}
            </div>
          </div>
        </FadeUp>
      </Container>
    </section>
  );
}
```

#### 4.5.5 `<ProgramTestimonials>`

Two long-form pull-quotes set in Epilogue 36–40px. No avatars. Attribution in caption style. Mauve em-dash divider.

```tsx
// components/marketing/programs/ProgramTestimonials.tsx
import { Container, Eyebrow } from "@/components/ui";
import { FadeUp } from "@/components/motion";

type T = { quote: string; name: string; context?: string };

export function ProgramTestimonials({ items }: { items: T[] }) {
  return (
    <section className="bg-shell py-24 md:py-32">
      <Container>
        <Eyebrow>From the practice</Eyebrow>
        <div className="mt-12 grid gap-16 md:grid-cols-2 md:gap-20">
          {items.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.1}>
              <blockquote>
                <p className="font-display text-[clamp(28px,3vw,40px)] leading-[1.2] text-ink -tracking-[0.01em]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="mt-6 text-[13px] uppercase tracking-[0.16em] text-mauve">
                  &mdash; {t.name}
                  {t.context && <span className="text-ink-soft normal-case tracking-normal"> · {t.context}</span>}
                </footer>
              </blockquote>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

#### 4.5.6 `<ProgramFAQ>`

Native `<details>`/`<summary>` accordion. No JS. Mauve underline grows on hover via a pseudo-element. Each summary toggles a `<plus>`/`<minus>` SVG via the `[open]` selector.

```tsx
// components/marketing/programs/ProgramFAQ.tsx
import { Container, Eyebrow, Heading } from "@/components/ui";

type Q = { q: string; a: string };

export function ProgramFAQ({ faq }: { faq: Q[] }) {
  return (
    <section className="bg-cream py-24 md:py-32">
      <Container className="max-w-[820px]">
        <Eyebrow>Questions</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3">
          Frequently asked.
        </Heading>
        <ul className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
          {faq.map(({ q, a }) => (
            <li key={q}>
              <details className="group py-6">
                <summary className="flex cursor-pointer items-baseline justify-between gap-6 list-none">
                  <span className="font-display text-[22px] leading-snug text-ink
                                   group-hover:text-mauve transition-colors">
                    {q}
                  </span>
                  <span aria-hidden
                        className="font-display text-[24px] text-mauve transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.6] text-ink-soft">
                  {a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

### 4.6 Signature components — full implementations

#### 4.6.1 `<SampleWeek>` (Diet Planning)

A horizontally scrollable week. 7 day-cards in a snap rail. Each card has a top "day" header in Epilogue, then four rows of meal — breakfast / lunch / snack / dinner — separated by hairline mauve rules. On desktop 3 cards visible; on mobile 1 card per snap. Sticky weekday label. Caption beneath: "Sample only. Real plans are tailored to you."

```tsx
// components/marketing/programs/SampleWeek.tsx
import { Container, Eyebrow, Heading } from "@/components/ui";
import { FadeUp } from "@/components/motion";

type Day = {
  day: string;
  meals: { breakfast: string; lunch: string; snack: string; dinner: string };
};

const ROW_LABELS = [
  ["breakfast", "Breakfast"],
  ["lunch", "Lunch"],
  ["snack", "Snack"],
  ["dinner", "Dinner"],
] as const;

export function SampleWeek({ week }: { week: Day[] }) {
  return (
    <section className="bg-cream-deep py-24 md:py-32">
      <Container>
        <Eyebrow>A sample week</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3 max-w-[18ch]">
          Real food. Seven days. Built around you.
        </Heading>
        <p className="mt-4 max-w-prose text-[15px] leading-[1.6] text-ink-soft">
          What follows is a representative week — not a prescription. Your plan is
          built around your routine, kitchen, preferences and clinical picture.
        </p>
      </Container>

      <FadeUp>
        <div
          className="mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 pb-10
                     md:scroll-px-12 md:px-12"
          role="list"
          aria-label="Seven-day sample meal plan"
        >
          {week.map((d) => (
            <article
              key={d.day}
              role="listitem"
              className="snap-start shrink-0 basis-[88%] sm:basis-[400px] md:basis-[340px]
                         bg-paper border border-ink/10 px-7 py-8 flex flex-col"
            >
              <header className="flex items-baseline justify-between border-b border-mauve/30 pb-4">
                <span className="font-display text-[28px] leading-none text-ink -tracking-[0.02em]">
                  {d.day}
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-mauve">
                  Day
                </span>
              </header>
              <dl className="mt-6 divide-y divide-ink/10">
                {ROW_LABELS.map(([key, label]) => (
                  <div key={key} className="grid grid-cols-[88px_1fr] items-baseline gap-4 py-4">
                    <dt className="text-[11px] uppercase tracking-[0.16em] text-ink-soft">
                      {label}
                    </dt>
                    <dd className="font-body text-[15px] leading-[1.5] text-ink">
                      {d.meals[key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </FadeUp>

      <Container>
        <p className="mt-2 text-[13px] tracking-[0.04em] text-ink-soft italic">
          &mdash; Sample only. Final plan is calibrated to your blood work, schedule and pantry.
        </p>
      </Container>
    </section>
  );
}
```

Implementation notes:

- Snap rail uses native scroll — keyboard `←`/`→` works, no JS scroll-jacking.
- Cards have a soft hairline (`border-ink/10`) and a single mauve accent on the day-header bottom rule. No drop shadows; the master plan rules out flashy treatments.
- The `dl/dt/dd` markup is correct: each card is a definition list of meal-type → meal-name. Screen readers announce "Breakfast: oats with seasonal fruit" etc.
- The 88px column for meal labels keeps the meal-name column visually aligned across days.
- Add a single `aria-label` on the rail and let cards be `role="listitem"`. We don't need an arrow-button affordance — the visible scrollbar + snap behavior is the affordance.

#### 4.6.2 `<CoachingTimeline>` (Coaching)

Vertical 8-week timeline. Continuous mauve connector line down the left. Per-week dot — small circle by default, bigger filled circle on `milestone: true`. Title in Epilogue, body in Inter. Numbers ("Week 01" → "Week 08") in Epilogue 64px lowercase. Mobile: same vertical layout, full-width text. Desktop: ~2-column — number on the left, text on the right of the connector.

```tsx
// components/marketing/programs/CoachingTimeline.tsx
import { Container, Eyebrow, Heading } from "@/components/ui";
import { FadeUp } from "@/components/motion";

type Week = { week: number; title: string; body: string; milestone?: boolean };

export function CoachingTimeline({ weeks }: { weeks: Week[] }) {
  return (
    <section className="bg-cream py-24 md:py-32">
      <Container className="max-w-[920px]">
        <Eyebrow>What 8 weeks looks like</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3 max-w-[18ch]">
          From first call to lasting change.
        </Heading>
        <p className="mt-4 max-w-prose text-[15px] leading-[1.6] text-ink-soft">
          The arc is consistent — the specifics are yours. Milestones marked with a
          filled dot are the ones that matter most for the outcomes most clients
          care about.
        </p>

        <ol className="relative mt-16 pl-10 md:pl-16" role="list">
          {/* Connector line */}
          <span
            aria-hidden
            className="absolute left-[7px] md:left-[11px] top-2 bottom-2 w-px bg-mauve/40"
          />
          {weeks.map((w, i) => (
            <FadeUp key={w.week} delay={i * 0.04}>
              <li className="relative pb-14 last:pb-0">
                {/* Dot */}
                <span
                  aria-hidden
                  className={[
                    "absolute -left-10 md:-left-16 top-[10px] block rounded-full",
                    w.milestone
                      ? "h-[18px] w-[18px] bg-mauve ring-4 ring-cream"
                      : "h-3 w-3 bg-cream border border-mauve",
                  ].join(" ")}
                />
                <div className="grid gap-2 md:grid-cols-[120px_1fr] md:gap-8 items-baseline">
                  <span className="font-display text-[44px] md:text-[56px] leading-none text-mauve -tracking-[0.02em]">
                    {`Week ${String(w.week).padStart(2, "0")}`}
                  </span>
                  <div>
                    <h3
                      className={[
                        "font-display leading-tight text-ink",
                        w.milestone
                          ? "text-[26px] md:text-[30px] italic -tracking-[0.01em]"
                          : "text-[22px] md:text-[24px]",
                      ].join(" ")}
                    >
                      {w.title}
                    </h3>
                    <p className="mt-3 max-w-[58ch] text-[16px] leading-[1.6] text-ink-soft">
                      {w.body}
                    </p>
                  </div>
                </div>
              </li>
            </FadeUp>
          ))}
        </ol>
      </Container>
    </section>
  );
}
```

Implementation notes:

- The connector line is a single absolutely-positioned `<span>`, not 7 individual segments — simpler markup, no risk of breaks between dots.
- Milestone dots are visually heavier *and* italicize the title — two coordinated cues, both subtle.
- Padded `<ol>` with negative-positioned dots; the `ring-4 ring-cream` on milestone dots punches a clean hole through the connector line so the dot reads as on top of the line, not pierced by it.
- `FadeUp` per week with a 40ms stagger gives the timeline a "writing itself" feel on first scroll-into-view without crossing into showy territory.
- The numbered axis is `Week 01` … `Week 08` — zero-padded for typographic regularity (Aesop's product index does the same).

#### 4.6.3 `<BookingWidget>` (Consultation)

Cal.com inline embed wrapped in a brand-skinned container. The wrapper sets CSS variables Cal.com reads (`--cal-brand`, `--cal-brand-emphasis`, `--cal-bg`, `--cal-bg-emphasis`) so the embed inherits cream backgrounds and mauve accents. The component renders client-side (`@calcom/embed-react` requires a browser) and gracefully degrades to a "Open booking page" link if JS fails or `provider === "link"`.

```tsx
// components/marketing/programs/BookingWidget.tsx
"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { Container, Eyebrow, Heading, Button } from "@/components/ui";

type Booking =
  | { provider: "cal"; calLink: string; fallbackUrl?: string }
  | { provider: "calendly"; calendlyUrl: string; fallbackUrl?: string }
  | { provider: "link"; fallbackUrl: string };

export function BookingWidget({ booking }: { booking: Booking }) {
  useEffect(() => {
    if (booking.provider !== "cal") return;
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: "consultation" });
      if (cancelled) return;
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#895575",            // --mauve
            "cal-brand-emphasis": "#6E3F5C",   // --mauve-deep
            "cal-bg": "#F4F0EE",               // --cream
            "cal-bg-emphasis": "#E8E1D8",      // --cream-deep
            "cal-text": "#1A1A1A",             // --ink
            "cal-text-emphasis": "#1A1A1A",
            "cal-border": "rgba(26,26,26,0.10)",
            "cal-border-subtle": "rgba(26,26,26,0.06)",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [booking.provider]);

  return (
    <section id="book" className="bg-cream-deep py-24 md:py-32">
      <Container className="max-w-[1080px]">
        <Eyebrow>Book your call</Eyebrow>
        <Heading as="h2" size="h1" className="mt-3 max-w-[18ch]">
          Pick a time that works for you.
        </Heading>
        <p className="mt-4 max-w-prose text-[15px] leading-[1.6] text-ink-soft">
          A 15-minute introductory call by video. We'll cover what you're working
          on, whether the practice is a fit, and the next step if it is.
        </p>

        <div
          className="mt-12 bg-paper border border-ink/10 p-2 md:p-4"
          /* Container styling is intentionally minimal — Cal.com paints itself
             cream-on-cream once cssVarsPerTheme has been applied. */
        >
          {booking.provider === "cal" && (
            <Cal
              namespace="consultation"
              calLink={booking.calLink}
              style={{ width: "100%", height: "720px", overflow: "hidden" }}
              config={{ layout: "month_view" }}
            />
          )}

          {booking.provider === "calendly" && (
            // Lazy-loaded only if Dr. Ruhma swaps to Calendly. Component import
            // would change to `react-calendly` — see §3 alternatives.
            <iframe
              src={booking.calendlyUrl}
              title="Schedule a consultation"
              className="block w-full h-[720px] border-0"
              loading="lazy"
            />
          )}

          {booking.provider === "link" && (
            <div className="px-6 py-12 text-center">
              <p className="font-body text-[16px] text-ink-soft">
                Booking opens in a new tab.
              </p>
              <div className="mt-6">
                <Button href={booking.fallbackUrl} target="_blank" rel="noopener" variant="primary" size="lg">
                  Open booking page
                </Button>
              </div>
            </div>
          )}
        </div>

        {booking.provider !== "link" && booking.fallbackUrl && (
          <p className="mt-4 text-[13px] tracking-[0.04em] text-ink-soft">
            Embed not loading?{" "}
            <a
              href={booking.fallbackUrl}
              target="_blank"
              rel="noopener"
              className="text-mauve underline decoration-mauve/40 underline-offset-4 hover:decoration-mauve"
            >
              Open the booking page in a new tab.
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
```

Implementation notes:

- `"use client"` because `@calcom/embed-react` registers DOM listeners. Wrapped in a section that is otherwise server-rendered for the page header — only this card hydrates.
- `cssVarsPerTheme.light` maps Cal.com's design tokens to ours. The result: the booking card inherits cream backgrounds, mauve buttons and ink text — visually continuous with the page.
- The fallback link is always visible if a `fallbackUrl` is provided. Embeds get blocked in restrictive browsers (Brave shields, third-party-cookie blockers, some corporate networks) and a one-line escape hatch is the difference between losing a lead and converting one.
- `height: 720px` is a safe default for the month-view layout. If the calendar's DOM grows taller, Cal's internal scroll handles it — we deliberately don't dynamically resize via postMessage to avoid layout-shift jitter.
- `namespace: "consultation"` isolates this embed's config from any other Cal embed we might place later (e.g. a footer "Book" pill).

### 4.7 MDX content sourcing — restructure summary

Each program's existing WP page is a long Elementor stack. We're not pasting; we're restructuring into the schema in §4.3. One paragraph per program describing the mapping:

**Diet Planning (`diet-planning.mdx`)** — The legacy 19,637-char page is a wall of "Why diet planning?", "What you get", "How it works", "Sample plan", three testimonials, a price block and a long FAQ. The new page keeps the order roughly intact but compresses each into the contracted shape: the opening "Why" two paragraphs become the hero `description`; the "What you get" bullet wall maps 1:1 onto the six `included` tiles (food list, grocery guide, recipe pack, weekly check-in, WhatsApp access, plan revisions); the existing "How it works" 5-step list collapses to four canonical steps (Inquire → Intake & lab review → Plan delivered → Revise & sustain); the legacy "sample plan" section becomes the `sampleWeek` array — we lift the actual meal names from the old page (oats with banana, grilled chicken with brown rice + salad, dahi-and-fruit snack, etc.) and reformat into Mon–Sun rows; the two strongest existing testimonials become the two pull-quotes; pricing matches the legacy card; the FAQ is pruned to 6 questions (delivery format, plan duration, revisions, dietary preferences, payment method, what happens after).

**Coaching (`coaching.mdx`)** — The 23,462-char page is the heaviest. Its strongest existing structure is the implicit week-by-week narrative ("first we'll review your labs", "by week three", "by the time eight weeks are up") buried in prose; we surface this as the `timeline` array. The hero blurb is taken from the page's opening promise ("a structured 8-week journey…"); `included` is six tiles (intake call, custom plan, weekly 1:1, weekly check-in, WhatsApp access, post-program transition); `howItWorks` distills the four-phase arc (Onboarding → Reset → Build → Sustain). The 8-week `timeline` items have been lifted from the legacy page's interspersed week-by-week mentions and reordered into a clean sequence with milestones at weeks 1 (Intake), 4 (Mid-program review) and 8 (Transition plan). Two long-form testimonials — preserve the existing voice. Pricing card mirrors the legacy block. FAQ trimmed to 6 questions.

**Consultation (`consultation.mdx`)** — The 13,249-char page is closer to the new schema already. Hero blurb maps from the existing intro ("a 15-minute introductory call…"). `included` tiles: clarity on goals, brief health overview, candid fit assessment, recommended next step, written summary, no obligation. `howItWorks` is exactly the page's existing 3-step prep flow re-written to four (Book → Prepare → Call → Recommendation). The `booking` object holds the Cal.com link (`ruhma/consultation-15min` placeholder until Dr. Ruhma's account is finalized). One existing pull-quote is reused; we ask Dr. Ruhma for a second. Pricing is straightforward (`PKR 2,500` placeholder — confirm against legacy page during migration). FAQ pruned to 5 questions (Is this a refund-able fee? Do you take international clients? Will you diagnose? What happens after? Can I bring my labs?).

For all three, **MDX body** stays mostly empty — long-form prose lives in the structured frontmatter so the layout stays predictable. The body slot is reserved for the rare case Dr. Ruhma wants to insert a personal note ("A word from Ruhma…") between the signature section and testimonials.

### 4.8 MDX skeletons (frontmatter only)

Each MDX file's body may be empty; the renderer handles it.

```mdx
---
title: Diet Planning Program
eyebrow: Program 01
slug: diet-planning
priceFrom: 15000
currency: PKR
heroImage: /media/programs/diet-planning/hero.avif
heroImageAlt: Plates of seasonal whole-food meals on a cream tablecloth
ctaLabel: Reserve your slot
ctaHref: "#pricing"
description: A custom, sustainable food plan built around your life — your kitchen, your routine, your clinical picture. Delivered as a four-week plan with weekly check-ins and unlimited revisions.
included:
  - { icon: leaf,    title: "Custom meal plan",   body: "Built from your blood work, preferences, allergies and pantry." }
  - { icon: basket,  title: "Grocery guide",      body: "Per-week shopping list, organized by section, in PKR." }
  - { icon: bowl,    title: "Recipe pack",        body: "20+ tested recipes calibrated to your plan." }
  - { icon: phone,   title: "WhatsApp access",    body: "Same-day answers Mon–Fri during the program window." }
  - { icon: pencil,  title: "Plan revisions",     body: "Unlimited tweaks during your active month." }
  - { icon: notes,   title: "Weekly check-in",    body: "A 20-minute call to keep the plan honest." }
howItWorks:
  - { n: 1, title: "Inquire",       body: "Tell me what you're working on." }
  - { n: 2, title: "Intake & labs", body: "We review your blood work, history and routine." }
  - { n: 3, title: "Plan delivered", body: "A four-week plan in your inbox within five days." }
  - { n: 4, title: "Revise & sustain", body: "Weekly check-ins, plan tweaks, sustainable handoff." }
sampleWeek:
  - { day: "Monday",    meals: { breakfast: "Oats with banana, walnuts, cinnamon", lunch: "Grilled chicken, brown rice, garden salad", snack: "Dahi with seasonal fruit", dinner: "Daal, roti, sautéed spinach" } }
  - { day: "Tuesday",   meals: { breakfast: "Vegetable omelette, sourdough toast", lunch: "Chickpea pulao, raita, cucumber", snack: "A handful of almonds, an apple", dinner: "Grilled fish, lemon-roasted vegetables" } }
  - { day: "Wednesday", meals: { breakfast: "Greek yogurt parfait with seeds", lunch: "Chicken karahi, roti, salad", snack: "Boiled egg, mint chai", dinner: "Lentil soup, whole-grain bread" } }
  - { day: "Thursday",  meals: { breakfast: "Smoothie: spinach, banana, peanut butter, milk", lunch: "Beef seekh, salad, raita, one roti", snack: "Roasted chana, lemon water", dinner: "Stuffed bell peppers with quinoa" } }
  - { day: "Friday",    meals: { breakfast: "Egg paratha (whole-wheat) with mint chutney", lunch: "Daal chawal, kachumber salad", snack: "Fruit chaat, no sugar added", dinner: "Grilled chicken kabab, hummus, salad" } }
  - { day: "Saturday",  meals: { breakfast: "Overnight oats with chia and berries", lunch: "Vegetable biryani, raita", snack: "Carrot sticks with hummus", dinner: "Tandoori fish, sautéed greens" } }
  - { day: "Sunday",    meals: { breakfast: "Halwa puri (small portion) — flex day", lunch: "Roast chicken, mash, gravy, vegetables", snack: "Dates with milk", dinner: "Light soup and salad" } }
testimonials:
  - { quote: "I thought I knew how to eat. After the four weeks I knew how to eat for me — bloating gone, energy steady, my labs in range.", name: "S. A.", context: "Lahore, four-month follow-up" }
  - { quote: "The plan finally felt like food I'd actually cook on a Tuesday. That's why I stuck with it.", name: "H. M.", context: "PCOS, six months in" }
pricing:
  headline: "PKR 15,000 / month"
  bullets:
    - "Custom four-week plan tailored to your labs and routine"
    - "20+ recipes and a per-week grocery guide"
    - "Weekly 20-minute check-in"
    - "Unlimited plan revisions during your month"
    - "WhatsApp access Mon–Fri"
  note: "Cancel anytime."
  ctaLabel: "Reserve your slot"
  ctaHref: "/contact?topic=diet-planning"
faq:
  - { q: "How is the plan delivered?", a: "A PDF in your inbox plus a shared Google Doc you can revise with me through the month." }
  - { q: "Do you accommodate vegetarian / halal / allergies?", a: "Yes — these are inputs to the plan, not constraints to work around." }
  - { q: "Can I extend after a month?", a: "Yes — month-by-month, no commitment beyond the active window." }
  - { q: "What if I travel during the program?", a: "We build a travel-week template into your plan." }
  - { q: "How do I pay?", a: "Bank transfer or Easypaisa, in PKR." }
  - { q: "What happens after the program?", a: "You keep the plan, the recipes and the grocery template. Most clients return for a check-in plan two months later." }
---
```

(Coaching and Consultation MDX skeletons follow the same shape with their respective `timeline` / `booking` blocks instead of `sampleWeek`.)

---

## 5. Step-by-step tasks

Order matters; each step is the smallest commit.

1. **Branch & scaffold.** Cut `feat/07-programs` off `main`. Run `pnpm add @calcom/embed-react`. Create the directory tree under `components/marketing/programs/` and `content/programs/`.
2. **Loader & schema.** Implement `lib/programs.ts` (zod schema, `loadProgram`, `loadAllPrograms`, `PROGRAM_SLUGS`). Add a unit test (vitest) that loads each MDX and asserts schema parse passes — this catches frontmatter drift on every CI run.
3. **MDX skeletons.** Create the three MDX files with placeholder copy (real copy lands in step 8). Each must validate against the schema.
4. **Shared template components** (in this order so the page composes top-down):
   - `<ProgramHero>` (4.5.1)
   - `<Included>` (4.5.2)
   - `<HowItWorks>` (4.5.3)
   - `<PricingCard>` (4.5.4)
   - `<ProgramTestimonials>` (4.5.5)
   - `<ProgramFAQ>` (4.5.6)
5. **Signature components.**
   - `<SampleWeek>` (4.6.1) — verify scroll-snap on Chrome/Firefox/Safari iOS, keyboard arrow navigation, screen-reader announcement of "Seven-day sample meal plan, listitem 1 of 7".
   - `<CoachingTimeline>` (4.6.2) — verify connector line stays continuous on resize, milestone dots align with the line, italic on milestone titles renders in Epilogue 500.
   - `<BookingWidget>` (4.6.3) — verify `cssVarsPerTheme` actually paints mauve buttons (Cal.com sometimes caches old themes; clear localStorage during dev). Verify the fallback link is always present and works.
6. **Dynamic route.** Implement `app/programs/[slug]/page.tsx` exactly as in §4.4 — `generateStaticParams`, `generateMetadata`, JSON-LD, `notFound()` on miss.
7. **Sitemap.** Add the three URLs in `app/sitemap.ts`.
8. **Real content migration.** Pull the legacy page bodies via `wp post get` (see CLAUDE.md), restructure each into the schema as summarized in §4.7. Hand-edit the typos (`harmone → hormone`, `manue → menu`, `plannig → planning`). Commit each MDX in a separate commit so the diff stays reviewable.
9. **Image migration.** For each program, identify the hero image from the existing media library (Diet Planning: a meal-prep / plate shot; Coaching: a portrait or counseling shot; Consultation: a phone-call / desk shot) and run through the optimization script. Place under `public/media/programs/<slug>/hero.avif` etc.
10. **Cal.com setup.** With Dr. Ruhma, register `cal.com/ruhma`, create the `consultation-15min` event type, set the brand color to `#895575`, and put the resulting `calLink` into `consultation.mdx`'s `booking.calLink`. Test the embed in a private window.
11. **A11y pass.**
    - Tab through each page top-to-bottom — every CTA reachable, no traps.
    - axe-core scan on each page — 0 violations.
    - Verify `prefers-reduced-motion: reduce` disables `<FadeUp>` reveals (the design-system motion utilities should already honor this).
    - Color contrast: mauve-on-cream for body links — confirm ≥ 4.5:1.
12. **Lighthouse pass.** LCP < 2.0s on each program page on a throttled run. The hero `<Image priority>` plus AVIF should land this comfortably.
13. **Cross-program linking.** Every program page's CTA band links to `/contact?topic=<slug>` (or to `#book` for consultation). The Pricing card's CTA does the same. Update `/services` cards (06-services) if their CTA labels drift from these.
14. **Open PR.** Title: `feat(programs): three program pages with shared template + sample-week / timeline / booking signatures`. Self-review against §6 acceptance criteria before requesting review.

---

## 6. Acceptance criteria

A reviewer can mark this work done when **all** of the following hold:

**Routing & rendering**

- [ ] `/programs/diet-planning`, `/programs/coaching`, `/programs/consultation` all render statically (`output: "static"` / `dynamicParams: false`).
- [ ] Any other slug under `/programs/` returns 404, not a soft-render.
- [ ] Old WP slugs (`/diet-plannig-program`, `/coaching-program`, `/conultation-call`) 301 to the new URLs.
- [ ] Each page's `<title>`, `<meta description>` and OG image come from frontmatter and are unique.

**Template fidelity**

- [ ] Every page renders, in this exact order: Hero · Included (6 tiles) · HowItWorks (4 steps) · Signature · (optional MDX body) · Testimonials (2) · PricingCard · FAQ · CTABand.
- [ ] All three pages share the same component instances — `<ProgramHero>` etc. — no per-program forks of the shared components.

**Signatures**

- [ ] Diet Planning: `<SampleWeek>` shows 7 day-cards in a horizontal snap rail, each with breakfast/lunch/snack/dinner as a `<dl>`. Cards scroll with the keyboard arrow keys when focused.
- [ ] Coaching: `<CoachingTimeline>` shows 8 weeks vertically, each with a dot on a continuous mauve connector. Milestone weeks (1, 4, 8 by default) render with a heavier dot and italic title.
- [ ] Consultation: `<BookingWidget>` renders a Cal.com inline embed visually skinned with `--mauve` / `--cream` / `--ink`. A fallback "Open booking page" link is always visible. The embed mounts only when the section is in the DOM (no booking JS on the other two program pages).

**Data discipline**

- [ ] `lib/programs.ts` zod schema parse runs at build time on every MDX. Any missing/invalid field fails the build with a clear error.
- [ ] Per-signature data (`sampleWeek` / `timeline` / `booking`) is required only for its corresponding slug; cross-validation is enforced.

**SEO**

- [ ] Each page emits a `Service` JSON-LD with `provider` (Person: Dr. Ruhma), `areaServed` (Pakistan), `offers.priceCurrency: "PKR"`, `offers.price: <priceFrom>`, and `offers.url`.
- [ ] `app/sitemap.ts` includes all three program URLs with `<lastmod>`.

**Accessibility**

- [ ] axe-core scan on each program page reports 0 violations.
- [ ] All CTAs reachable by keyboard; visible focus rings on every interactive element.
- [ ] `prefers-reduced-motion: reduce` disables the fade-up and reveal animations.
- [ ] Mauve text on cream meets WCAG AA (≥ 4.5:1 for body, ≥ 3:1 for ≥ 24px text). Mauve-on-shell does the same.
- [ ] FAQ accordion toggles with native `<details>` — keyboard `Enter`/`Space` opens; works without JS.

**Performance**

- [ ] LCP < 2.0s on each program page (3G throttled simulated run).
- [ ] CLS < 0.05 — image reserved aspect ratios, no font swap shift (next/font handles this).
- [ ] No client JS on Diet Planning or Coaching beyond the design-system motion bundle. Consultation is the only one to ship the Cal embed.

---

## 7. Out of scope

Explicitly **not** part of this plan — defer or hand to another plan:

- **On-site checkout / paid program purchase.** Programs are inquiry-driven; the CTA goes to `/contact` (pre-filled topic) or, for consultation, to the booking widget. No Stripe/Gumroad integration here.
- **Account dashboards / "my plan" portals.** No client login, no progress tracker.
- **Push notifications, reminders, calendar sync** beyond what Cal.com offers natively.
- **The `/services` overview page** itself — owned by 06-services. This plan only consumes its component contract for cross-linking.
- **Newsletter signup placement.** Not on program pages; this plan keeps the conversion focus single (book / inquire). Newsletter lives on `/journal` and the footer.
- **A/B testing infrastructure.** Treat the launch copy as v1; iteration plan is post-launch.
- **Translation / Urdu localization.** English only at v1 — content already mixes Urdu food terms naturally (e.g. "daal", "dahi", "karahi") which is on-brand for a Lahore practice.
- **Editing legacy WP content in place.** The local WP stack is read-only for content extraction. No edits to `/home/duh/Documents/website backup (1)/` outside of running `wp post get` queries.
- **Custom Calendly skin** if Calendly is chosen later. The fallback in §3 is intentionally unstyled — Calendly's free tier limits theming, and we don't fight it.
- **Rich animation on the timeline** beyond the staggered fade-in. No SVG path-drawing on the connector, no parallax. The master plan's three-motions rule binds this plan too.
- **Video testimonials, reels, TikTok embeds.** The brand is editorial, not influencer; pull-quotes only.
