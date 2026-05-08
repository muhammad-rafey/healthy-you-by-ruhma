# Plan 06 — Services Page (`/services`)

## 1. Goal

Build the **Services overview page** at `/services` per master plan §3.3. The page is the high-level menu of all paid offerings and routes to the three program detail pages (built later in plan 07). It must:

- Read as an **editorial spread**, not a generic three-tile service grid. Each of the three offerings (Diet Planning, Coaching, Consultation) gets a magazine-feature-style card: hero image, eyebrow ("Program 01"…), Epilogue title, two-line description, price-from chip, "Explore →" link.
- Open with a typographic page header (eyebrow "Services" / H1 in Epilogue).
- Carry a 5–7 question FAQ accordion using the Radix Accordion primitive added in plan 01, with mauve underline-on-hover trigger styling.
- Close with the shared CTA band ("Ready when you are.").
- Ship with proper metadata, JSON-LD (one `Service` schema per program, three total), and the three motion primitives applied (fade-up reveals, image hover scale on cards, no extra novel motion).

The signature move is **the editorial numbered cards themselves**: oversized images, generous whitespace between cards, eyebrow numbering, no equal-grid feel. The three cards stack alternating left/right on desktop (image left/text right, then image right/text left, then image left/text right) — closer to a magazine feature flow than a service tile grid.

## 2. Pre-requisites

This plan assumes the following are merged and stable on `main` before work starts:

- **Plan 01 — Design system** — provides:
  - CSS tokens in `app/globals.css` (`--cream`, `--cream-deep`, `--shell`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`).
  - Tailwind config exposing those tokens as `bg-cream`, `text-ink`, `text-mauve`, etc.
  - `next/font` Inter + Epilogue with CSS variable bindings (`--font-inter`, `--font-epilogue`).
  - Type primitives: `<Eyebrow>`, `<Heading level="1|2|3" display?>`, `<Container>` in `components/ui/`.
  - Motion primitives in `components/motion/`: `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`.
  - **shadcn Accordion** (`components/ui/accordion.tsx`) — Radix-backed. Plan 06 just consumes it; it must already exist.
  - Botanical SVG set under `public/illustrations/`.
- **Plan 02 — Layout shell** — provides `app/layout.tsx`, the sticky `<Nav>` with condensing-on-scroll, the `<Footer>`, and the shared `<CtaBand>` component (used at the foot of nearly every marketing page). If `<CtaBand>` is not in plan 02, it lives in plan 04 (Home) and we re-use the same component path.
- **Plan 03 — Content & media migration** — the three hero images for the Services cards must already be optimized (AVIF + WEBP, multiple sizes) under `public/media/services/` with this naming:
  - `public/media/services/diet-planning-hero.{avif,webp,jpg}` (sourced from the existing `uploads/2024/02/coach-1-1024x1024.png` family — the lifestyle/nutrition shot)
  - `public/media/services/coaching-hero.{avif,webp,jpg}` (sourced from `uploads/2024/02/coach-1024x1024.png`)
  - `public/media/services/consultation-hero.{avif,webp,jpg}` (sourced from `uploads/2024/02/call1-1-1024x1024.png`)
  - Each generated at widths `[400, 800, 1200, 1600, 2400]` for `next/image` `srcSet`.
  - If the migration plan picks different filenames, the constants in `content/services.ts` (below) are the only thing that needs updating.

If any pre-req is missing at execution time, **stop and surface the gap** rather than improvising — these contracts are load-bearing across all 15 plans.

## 3. Dependencies

Already installed from earlier plans:

- `next` (15.x), `react`, `react-dom`, `typescript`
- `tailwindcss` v4 + the Prettier Tailwind plugin
- `@radix-ui/react-accordion` (via shadcn `accordion`)
- `motion` v11 (used by the motion primitives — not directly imported here)
- `schema-dts` for typed JSON-LD
- `clsx` + `tailwind-merge` (via `cn()` helper from shadcn)

**No new dependencies are added by this plan.**

## 4. Files to create / modify

### 4.1 `content/services.ts` — single source of truth

```ts
// content/services.ts
import type { StaticImageData } from "next/image";

export type Service = {
  /** URL slug used by the program detail page (plan 07) */
  slug: "diet-planning" | "coaching" | "consultation";
  /** Editorial number, displayed as eyebrow */
  eyebrow: `Program 0${1 | 2 | 3}`;
  /** Epilogue display title */
  title: string;
  /** Exactly 2 lines on desktop at card width — copy is tuned for this */
  description: string;
  /** "From PKR X,XXX" chip text. Source of truth for pricing on this page only;
   *  detail pages may show fuller pricing tables. */
  priceFrom: string;
  /** Public URL to the hero image (already converted to AVIF + WEBP in plan 03) */
  image: {
    src: string;
    /** Aspect ratio for the card image; all three are 4:5 portrait by design */
    width: number;
    height: number;
    alt: string;
  };
  /** Internal link to the program detail page */
  href: `/programs/${"diet-planning" | "coaching" | "consultation"}`;
};

export const SERVICES: readonly Service[] = [
  {
    slug: "diet-planning",
    eyebrow: "Program 01",
    title: "Diet Planning Program",
    description:
      "A personalised nutrition plan built around your body, your routine, and the goals you actually have. Built to be lived with — not survived.",
    priceFrom: "From PKR 8,000",
    image: {
      src: "/media/services/diet-planning-hero.jpg",
      width: 1200,
      height: 1500,
      alt: "Fresh seasonal produce arranged on a linen surface",
    },
    href: "/programs/diet-planning",
  },
  {
    slug: "coaching",
    eyebrow: "Program 02",
    title: "Coaching Program",
    description:
      "Eight weeks of one-to-one guidance — weekly check-ins, plan adjustments, and accountability. For when food is one piece of a bigger picture.",
    priceFrom: "From PKR 25,000",
    image: {
      src: "/media/services/coaching-hero.jpg",
      width: 1200,
      height: 1500,
      alt: "Dr. Ruhma in consultation with a client",
    },
    href: "/programs/coaching",
  },
  {
    slug: "consultation",
    eyebrow: "Program 03",
    title: "Consultation Call",
    description:
      "A focused 45-minute call to understand where you are and map a clear next step. Often the right place to start.",
    priceFrom: "From PKR 3,500",
    image: {
      src: "/media/services/consultation-hero.jpg",
      width: 1200,
      height: 1500,
      alt: "A notebook, a glass of water, and a phone — the consultation setup",
    },
    href: "/programs/consultation",
  },
] as const;
```

Rationale: keeping the service array in `content/` (next to MDX) instead of co-located in the page component lets the homepage three-pillars block (plan 04) and the nav mega-menu (plan 02 follow-up) consume the same data without duplicating titles or prices. **Prices appear in exactly one place in the codebase.**

### 4.2 `content/services-faq.ts`

```ts
// content/services-faq.ts

export type FaqItem = { q: string; a: string };

/** 6 FAQs tuned to the brand voice: warm, plain, specific. Answers are in
 *  the second person ("you"), avoid clinical jargon, and never make medical
 *  claims. Currency stays PKR throughout — the practice is Lahore-based. */
export const SERVICES_FAQ: readonly FaqItem[] = [
  {
    q: "How does a consultation work?",
    a: "We meet on a 45-minute video call. Before the call you fill in a short health and lifestyle form so we don't spend the session on basics. On the call we talk through what's actually happening — symptoms, routine, what you've already tried — and end with a clear next step, whether that's a one-off plan, the coaching program, or simply some advice you can act on yourself.",
  },
  {
    q: "What's the difference between Diet Planning and the Coaching Program?",
    a: "Diet Planning is a written plan built for you — meals, portions, timing, swaps — delivered after one consultation. The Coaching Program is eight weeks of working together: weekly check-ins, plan adjustments, accountability, and the harder behavioural side of change. Choose Diet Planning if you mostly need a clear plan; choose Coaching if you've tried plans before and the gap is the follow-through.",
  },
  {
    q: "Do you offer follow-ups?",
    a: "Yes. Every program includes one complimentary follow-up two weeks in to course-correct. After that, follow-up sessions are available on their own at PKR 2,500 each — most clients book one a month for the first quarter, then less often.",
  },
  {
    q: "Is this remote, or do I need to come in person?",
    a: "Everything runs online — Zoom or WhatsApp video for sessions, email or WhatsApp for plans and check-ins. Clients work with me from across Pakistan and from abroad. There's no in-person clinic right now.",
  },
  {
    q: "What about hormonal cases like PCOS or thyroid issues?",
    a: "These are core areas of the practice. The PCOS Guidebook in the library covers the foundations and is a good starting point if you'd like to read first. For active cases — irregular cycles, insulin resistance, thyroid management alongside an endocrinologist — the Coaching Program is the right fit because hormonal work needs adjustment over time, not a one-off plan.",
  },
  {
    q: "What's the refund policy?",
    a: "Consultation calls are refundable up to 24 hours before the scheduled time. The Diet Planning Program is refundable before the plan is delivered; once it's been sent, it's non-refundable. The Coaching Program is refundable within the first week, prorated after that. Full terms live on the refund policy page.",
  },
];
```

Six items hits the 5–7 sweet spot from the master plan. Currency / payment options is intentionally **omitted** here — payment happens externally on each program page (Stripe payment link / bank transfer / Wise depending on Dr. Ruhma's setup), and bundling a "how do I pay?" FAQ on the overview implies an on-site checkout we're explicitly not building.

### 4.3 `components/marketing/services/ServiceHeader.tsx`

```tsx
// components/marketing/services/ServiceHeader.tsx
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";

export function ServiceHeader() {
  return (
    <header className="bg-cream pt-32 pb-20 md:pt-40 md:pb-28">
      <Container>
        <FadeUp>
          <Eyebrow className="text-mauve">Services</Eyebrow>
        </FadeUp>
        <Heading level={1} display className="mt-6 max-w-[14ch]">
          <LetterStagger text="Three ways to work together." />
        </Heading>
        <FadeUp delay={0.2}>
          <p className="text-ink-soft mt-8 max-w-[52ch] text-[17px] leading-[1.6]">
            From a one-time consultation to an eight-week coaching engagement, each program is built
            around one idea: nutrition that fits the life you actually live.
          </p>
        </FadeUp>
      </Container>
    </header>
  );
}
```

Notes:

- `<LetterStagger>` is the per-letter opacity 0→1 stagger from plan 01 (one of the three motions). The H1 here is one of the rare places it's used — once per page max.
- `max-w-[14ch]` keeps the title ragging across two lines on the design (~ "Three ways to / work together.").
- The eyebrow uses `text-mauve` to anchor the page to the accent color before any image lands.

### 4.4 `components/marketing/services/ServiceCard.tsx`

This is the core editorial card. **Important**: it is NOT a tile. It alternates left/right on desktop, full-bleed image on mobile, and gives the image roughly 55% of the desktop width — closer to a magazine feature spread than a uniform service grid item.

```tsx
// components/marketing/services/ServiceCard.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { Service } from "@/content/services";

type ServiceCardProps = {
  service: Service;
  /** Card index (0-based). Determines left/right alternation on desktop. */
  index: number;
};

export function ServiceCard({ service, index }: ServiceCardProps) {
  // Even indices (0, 2): image left, text right.
  // Odd indices (1):     image right, text left.
  const imageOnLeft = index % 2 === 0;

  return (
    <FadeUp>
      <article
        className={cn(
          "group relative grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12 lg:gap-16",
          // The card breathes: substantial vertical rhythm between cards.
          "py-12 md:py-20",
        )}
      >
        {/* IMAGE — 7 cols on desktop, ordered by alternation */}
        <Link
          href={service.href}
          aria-label={`Explore ${service.title}`}
          className={cn(
            "relative block overflow-hidden md:col-span-7",
            imageOnLeft ? "md:order-1" : "md:order-2",
          )}
        >
          <div className="bg-cream-deep relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={service.image.src}
              alt={service.image.alt}
              fill
              sizes="(min-width: 1024px) 58vw, (min-width: 768px) 58vw, 100vw"
              className={cn(
                "object-cover",
                // Subtle, slow scale on hover — 1.02 over 600ms.
                "transition-transform duration-[600ms] ease-out",
                "group-hover:scale-[1.02]",
              )}
              priority={index === 0}
            />
          </div>
        </Link>

        {/* TEXT — 5 cols on desktop, vertically centered against the image */}
        <div
          className={cn(
            "flex flex-col justify-center md:col-span-5",
            imageOnLeft ? "md:order-2" : "md:order-1",
          )}
        >
          <Eyebrow className="text-mauve">{service.eyebrow}</Eyebrow>

          <Heading level={2} display className="mt-4">
            <Link
              href={service.href}
              className={cn(
                "relative inline",
                // Mauve underline appears on group hover/focus — the title
                // itself remains ink, the underline does the work.
                "bg-[linear-gradient(to_right,theme(colors.mauve.DEFAULT),theme(colors.mauve.DEFAULT))]",
                "bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat",
                "transition-[background-size] duration-300 ease-out",
                "group-hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]",
              )}
            >
              {service.title}
            </Link>
          </Heading>

          <p className="text-ink-soft mt-5 max-w-[40ch] text-[17px] leading-[1.6]">
            {service.description}
          </p>

          {/* Price-from chip — small, restrained, mauve text on shell background */}
          <div className="mt-6">
            <span
              className={cn(
                "inline-flex items-center rounded-full",
                "bg-shell px-4 py-1.5",
                "text-mauve-deep text-[12px] font-medium tracking-[0.16em] uppercase",
              )}
            >
              {service.priceFrom}
            </span>
          </div>

          {/* Explore link — the second clickable target on the card. */}
          <Link
            href={service.href}
            className={cn(
              "mt-8 inline-flex items-center gap-2 self-start",
              "text-ink text-[14px] font-medium",
              "border-b border-transparent pb-1",
              "transition-colors duration-300 ease-out",
              "hover:border-mauve hover:text-mauve-deep",
              "focus-visible:border-mauve focus-visible:text-mauve-deep focus-visible:outline-none",
            )}
          >
            Explore
            <ArrowRight
              aria-hidden
              className={cn(
                "h-4 w-4 transition-transform duration-300 ease-out",
                "group-hover:translate-x-1",
              )}
            />
          </Link>
        </div>
      </article>
    </FadeUp>
  );
}
```

Design notes that implementers should not negotiate away:

- The **whole card is a `group`**; both the image link and the title link share hover state with the explore arrow. Hovering anywhere on the card animates the image scale, draws the title underline, and slides the arrow right.
- **The mauve underline on the title is implemented via `bg-[length]` animation, not `text-decoration`** — it animates from 0% → 100% width left-to-right, which `text-decoration` cannot do smoothly. The same trick is used on the FAQ trigger.
- **Two separate `<Link>` elements** (image + title both link to the same href) is intentional. Screen readers announce the title link; the image link is labelled with `aria-label`. We accept the duplicate `<a>` because it gives keyboard users two natural focus stops and matches the editorial pattern (the photo and the headline are equally clickable).
- Image is `priority` on the first card only (above-the-fold LCP candidate).
- `aspect-[4/5]` portrait — hero images for all three cards must be cropped to 4:5 in plan 03's media optimization step. If they aren't, Image still works but the page rhythm breaks.

### 4.5 `components/marketing/services/FAQ.tsx`

```tsx
// components/marketing/services/FAQ.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import { cn } from "@/lib/utils";
import { SERVICES_FAQ } from "@/content/services-faq";

export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="services-faq-heading"
      className="bg-cream-deep py-24 md:py-32"
    >
      <Container className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        {/* Left rail — title sticks while the user scrolls the questions */}
        <div className="md:col-span-4">
          <FadeUp>
            <Eyebrow className="text-mauve">Common questions</Eyebrow>
            <Heading level={2} id="services-faq-heading" className="mt-4 max-w-[14ch]">
              Before you book.
            </Heading>
            <p className="text-ink-soft mt-6 max-w-[36ch] text-[17px] leading-[1.6]">
              The questions that come up most. If yours isn't here,{" "}
              <a href="/contact" className="text-mauve underline-offset-4 hover:underline">
                send a note
              </a>
              .
            </p>
          </FadeUp>
        </div>

        {/* Right rail — accordion */}
        <div className="md:col-span-8">
          <FadeUp delay={0.15}>
            <Accordion type="single" collapsible className="border-ink/10 border-t">
              {SERVICES_FAQ.map(({ q, a }, i) => (
                <AccordionItem key={q} value={`item-${i}`} className="border-ink/10 border-b">
                  <AccordionTrigger
                    className={cn(
                      "group/trigger w-full py-6 text-left",
                      "text-ink text-[20px] leading-snug font-medium",
                      "transition-colors duration-300 ease-out",
                      "hover:text-mauve-deep",
                      // Mauve underline-on-hover, matching the ServiceCard title trick.
                      "[&>span]:relative",
                      "[&>span]:bg-[linear-gradient(to_right,theme(colors.mauve.DEFAULT),theme(colors.mauve.DEFAULT))]",
                      "[&>span]:bg-[length:0%_1px]",
                      "[&>span]:bg-[position:0_100%]",
                      "[&>span]:bg-no-repeat",
                      "[&>span]:transition-[background-size]",
                      "[&>span]:duration-300",
                      "[&>span]:ease-out",
                      "hover:[&>span]:bg-[length:100%_1px]",
                      "focus-visible:[&>span]:bg-[length:100%_1px]",
                    )}
                  >
                    <span>{q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-ink-soft pr-8 pb-6 text-[17px] leading-[1.6]">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeUp>
        </div>
      </Container>
    </section>
  );
}
```

Notes:

- **Sticky two-column layout** (4-cols heading + 8-cols accordion on desktop). The heading does NOT need `position: sticky` — the section is short enough that it reads as a single editorial unit.
- The mauve-underline-on-hover works on the inner `<span>` because shadcn's `AccordionTrigger` wraps the trigger contents in a flex row that already contains the chevron icon. Underlining the whole trigger would also underline the chevron — we don't want that. Wrapping the question text in a `<span>` and targeting it via `[&>span]` is the cleanest way to scope the underline to the words.
- The accordion is `type="single" collapsible` — only one open at a time, and clicking the open item closes it. This is the right default for FAQs (vs. `type="multiple"`, which would let users open all six and then read them as a wall of text).
- Border between items uses `border-ink/10` (10% opacity ink), softer than a hard hairline, more editorial.

### 4.6 `app/services/page.tsx`

```tsx
// app/services/page.tsx
import type { Metadata } from "next";
import type { Service as SchemaService, WithContext } from "schema-dts";

import { ServiceHeader } from "@/components/marketing/services/ServiceHeader";
import { ServiceCard } from "@/components/marketing/services/ServiceCard";
import { FAQ } from "@/components/marketing/services/FAQ";
import { CtaBand } from "@/components/marketing/cta-band";
import { Container } from "@/components/ui/container";
import { SERVICES } from "@/content/services";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Services — Diet Planning, Coaching, Consultation",
  description:
    "Three ways to work with Dr. Ruhma: a personalised diet plan, an eight-week coaching engagement, or a focused consultation call. Lahore-based, online worldwide.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — Healthy You By Ruhma",
    description: "Three ways to work together: Diet Planning, Coaching, and Consultation.",
    url: `${siteConfig.url}/services`,
    type: "website",
  },
};

export default function ServicesPage() {
  // One Service JSON-LD per program. Embedded inline for simplicity; for
  // pages with many entities we'd factor this into lib/seo.ts.
  const serviceSchemas: WithContext<SchemaService>[] = SERVICES.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    url: `${siteConfig.url}${service.href}`,
    provider: {
      "@type": "Person",
      name: "Dr. Ruhma",
      url: `${siteConfig.url}/about`,
    },
    areaServed: { "@type": "Country", name: "Pakistan" },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      // priceFrom is "From PKR 8,000" — strip everything but digits for the
      // schema. Floor price; detail pages carry the full pricing schema.
      price: service.priceFrom.replace(/[^\d]/g, ""),
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}${service.href}`,
    },
  }));

  return (
    <>
      <ServiceHeader />

      <section aria-label="Our programs" className="bg-cream pb-12 md:pb-20">
        <Container>
          {/* Divider above the first card — gives the cards a sense of
              starting after the header rather than continuing it. */}
          <div className="border-ink/10 border-t" />
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </Container>
      </section>

      <FAQ />

      <CtaBand
        eyebrow="Ready when you are"
        title="Let's start with a conversation."
        ctaLabel="Book a consultation"
        ctaHref="/programs/consultation"
      />

      {/* JSON-LD: one Service entity per program */}
      {serviceSchemas.map((schema, i) => (
        <script
          key={SERVICES[i].slug}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
```

Notes:

- The page is a Server Component (no `"use client"`). Motion primitives mark themselves client-side internally; the page composition stays on the server, so JSON-LD is rendered statically and indexable on first byte.
- `siteConfig.url` is the canonical site URL (e.g. `https://dietitianruhma.com`), defined in `content/site.ts` from plan 02.
- `<CtaBand>` props are the contract from plan 02/04. If plan 02 names the props differently, conform to that — don't introduce a new prop shape.

## 5. Step-by-step tasks

Execute in order. Each task is sized to be a single PR-ready commit, with a verification check before moving on. Don't skip the verifications — they catch the design-drift kind of mistake that's hard to fix later.

1. **Pull pre-reqs.** Confirm plans 01, 02, and 03 are merged. Specifically check:
   - `components/ui/accordion.tsx` exists and exports `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
   - `components/motion/fade-up.tsx` and `letter-stagger.tsx` exist.
   - `components/ui/{container,eyebrow,heading}.tsx` exist with the prop shapes used above.
   - `components/marketing/cta-band.tsx` exists with the prop contract above. If the prop names differ, update §4.6 to match — do not invent.
   - The three hero images exist at `public/media/services/{diet-planning,coaching,consultation}-hero.jpg` (and AVIF/WEBP variants). If they don't, raise it with the plan 03 owner; do not improvise placeholders.
2. **Add `content/services.ts`** exactly as in §4.1. Run `pnpm typecheck` — the `as const` assertion + literal-typed slugs catch typos at compile time.
3. **Add `content/services-faq.ts`** exactly as in §4.2.
4. **Build `ServiceHeader`** per §4.3. Render it in isolation on a scratch route (`app/_kit/services-header/page.tsx` if the kit page convention from plan 01 is in place) and visually verify:
   - Eyebrow, H1, subhead all render with correct fonts.
   - LetterStagger animates on mount, fade-up on the subhead delays correctly.
   - On `prefers-reduced-motion`, both motions degrade to a static render.
5. **Build `ServiceCard`** per §4.4. Verify all of:
   - Hover anywhere on the card: image scales to 1.02 over 600ms, title underline grows mauve, arrow translates 4px right. All three triggered by the `group` class.
   - Keyboard tab order: image link → title link → explore link. (Three focus stops by design — the visual deduplication is acceptable for keyboard users because the focus rings clearly indicate which link is active.)
   - Mobile (< 768px): image stacks above text, full width, no alternation.
   - Desktop (≥ 768px): image takes 7 of 12 cols, text takes 5; alternation by index works (index 0 → image left; index 1 → image right; index 2 → image left).
6. **Build `FAQ`** per §4.5. Verify:
   - Six items render. Only one can be open at a time.
   - Hover on a question shows the mauve underline growing left-to-right under the question text only — NOT under the chevron.
   - Keyboard navigation: arrow keys cycle through triggers (Radix default); Enter / Space toggles.
   - `prefers-reduced-motion` collapses the underline animation to instant — the existing Tailwind `motion-reduce:` utility handles this if added; if not, add `motion-reduce:transition-none` to the relevant classes.
7. **Compose `app/services/page.tsx`** per §4.6. Verify:
   - View source on the rendered page contains three `<script type="application/ld+json">` blocks.
   - Each JSON-LD validates at https://validator.schema.org (do this by pasting each block — don't crawl in CI, the URL won't be reachable).
   - Page metadata: tab title, OG preview, canonical link all correct.
   - Lighthouse run: Performance ≥ 95, Accessibility ≥ 95, SEO 100 on a desktop emulation. If LCP > 2.0s, the diet-planning hero image probably wasn't `priority` — fix that, don't add motion.
8. **A11y audit.** Run `axe-core` (via the browser extension) on the rendered page. Zero violations is the bar. Common failures to watch for:
   - Color contrast: `text-mauve` (#895575) on `bg-cream` (#F4F0EE) sits at ~4.6:1 — passes AA for body text. `text-mauve` on `bg-cream-deep` sits lower; verify the FAQ section's mauve link contrast specifically.
   - Heading order: header H1, card titles H2, FAQ rail H2 — there should be no H3 above an H2 anywhere.
9. **Cross-check master plan §3.3.** Read the four bullets again and confirm each maps to a delivered piece of UI. Specifically the "feels like a magazine feature, NOT a generic service grid" line — if the cards look like a 3-up tile grid in your browser, the alternation broke. Fix it before merging.

## 6. Acceptance criteria

A reviewer should be able to walk through this list and tick every box.

- [ ] `app/services/page.tsx` renders without console errors or warnings (including hydration warnings).
- [ ] Page header: eyebrow "Services" in mauve, H1 in Epilogue display weight, subhead body copy. LetterStagger animates the H1 on mount.
- [ ] Three editorial cards render in the order Diet Planning → Coaching → Consultation, alternating image-left / image-right / image-left on desktop, stacked on mobile.
- [ ] Each card shows: hero image (4:5), eyebrow ("Program 0X"), Epilogue title, 2-line description, price-from chip, "Explore →" link.
- [ ] Hover on any card: image scales to 1.02 over 600ms ease-out; title underline grows mauve left-to-right; arrow translates right 4px. All from one `group` hover trigger.
- [ ] First card's image uses `priority` on `next/image`; others lazy-load.
- [ ] FAQ section shows 6 items; single-open Radix Accordion; mauve underline on trigger hover scoped to the question text only.
- [ ] CTA band renders at the bottom and links to `/programs/consultation`.
- [ ] Three `<script type="application/ld+json">` Service schemas in the document, one per program, each with valid `name`, `description`, `provider`, `areaServed`, `offers.price`, `offers.priceCurrency: "PKR"`.
- [ ] Page-level `metadata` export sets title, description, canonical, and OG fields.
- [ ] No new dependencies added in `package.json` vs. plans 01–05.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass clean.
- [ ] Lighthouse on `/services` (desktop): Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- [ ] axe-core: 0 violations.
- [ ] `prefers-reduced-motion`: LetterStagger, FadeUp, image hover scale, and underline grow all respect the preference (either no transition, or instant snap to end state). Verify in DevTools rendering tab → "Emulate CSS prefers-reduced-motion: reduce".
- [ ] Currency strings on the page read "PKR" (not "Rs", "₨", or "$") and prices match `content/services.ts` exactly.
- [ ] Both keyboard tab and screen-reader (VoiceOver / NVDA quick test) reach every interactive element with a sensible label. The duplicate image+title links per card are acceptable; the image link uses `aria-label="Explore {Title}"`.

## 7. Out of scope

Things that are **explicitly NOT part of this plan**, even though they're adjacent:

- **The three program detail pages** (`/programs/diet-planning`, `/programs/coaching`, `/programs/consultation`). Those are plan 07. This page links to them via the `href` field on each `Service`; if those routes 404 during plan 06 implementation, that's fine — they'll exist by the time plan 07 lands.
- **A booking widget** (Calendly / Cal.com). The Consultation card here just links to the program detail page. The booking embed lives on the program detail page per master §3.6.
- **Live pricing fetched from anywhere** (Stripe, Gumroad, etc.). Prices are hardcoded in `content/services.ts`. Updates ship via PR. This is the same "MDX in repo" content philosophy applied to structured data.
- **A separate `/services/[slug]` route.** There isn't one. The Services page is an overview that funnels to `/programs/[slug]`. Don't add a `/services/[slug]` redirect either — there's no old URL to preserve.
- **Searchable / filterable FAQ.** Six items don't need search. If the FAQ grows past ~12 items in future, revisit.
- **Changes to the global Nav, Footer, or CtaBand.** Those are owned by plan 02. If a copy tweak is needed in CtaBand for this page, pass it via props (the contract supports `eyebrow`, `title`, `ctaLabel`, `ctaHref`); don't fork the component.
- **Image optimization tooling.** Plan 03 owns the `sharp` pipeline. This plan only consumes the optimized output.
- **Internationalization.** The site is English-only at launch. No `next-intl` wiring here.
- **Analytics events on card clicks.** Plan 12 (Polish) wires Plausible custom events globally; we don't sprinkle event handlers in this page.

---

End of plan 06.
