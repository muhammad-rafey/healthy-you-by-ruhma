# 01 — Design System

## 1. Goal

Establish the foundational design system for the Next.js redesign per master plan §1 and §8 Phase 1: design tokens (colors, typography), font loading, type scale utilities, base primitives (`<Eyebrow>`, `<Heading>`, `<Container>`, `<Prose>`), the three motion components (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`), botanical SVG set, and a `/_kit` visual QA page. This is the foundation every subsequent phase consumes — by the end of this phase, no marketing page yet exists, but every visual atom needed to compose them does.

## 2. Pre-requisites

- **`00-setup.md` must be complete**: a working Next.js 15 (App Router, RSC, TypeScript strict) scaffold exists at `/home/duh/Projects/healthy-you-by-ruhma`, Tailwind v4 is installed, ESLint + Prettier (with `prettier-plugin-tailwindcss`) are configured, Husky + lint-staged are wired, and the repo has been pushed to `muhammad-rafey/healthy-you-by-ruhma` (private) on GitHub.
- The `app/` directory exists with a baseline `layout.tsx` and `page.tsx` from the scaffold. We will be replacing/expanding both.
- `pnpm` is the package manager (per master plan §5 Tooling). All install commands below use `pnpm`.
- Node ≥ 20, since Next.js 15 + Tailwind v4 require it.

## 3. Dependencies

Install in this single batch (don't run shadcn `init` yet — it has its own step):

```bash
pnpm add motion clsx tailwind-merge class-variance-authority lucide-react
pnpm add -D @types/node
```

Rationale per package:

- **`motion`** (v11+, formerly Framer Motion) — drives the three motion primitives in master §1 (Fade-up, Image reveal, Letter stagger). RSC-compatible client island usage. Master §4 Tech stack mandates this exact choice.
- **`clsx`** — conditional className composition for variants in primitives.
- **`tailwind-merge`** — merges conflicting Tailwind classes intelligently (e.g., consumer overrides `text-ink` with `text-mauve`); pairs with `clsx` in the `cn()` helper shadcn uses.
- **`class-variance-authority`** (`cva`) — variant API for `<Heading>`, `<Container>`, future `<Button>`. shadcn's standard pattern.
- **`lucide-react`** — icon set used by shadcn primitives (Sheet's close X, Accordion's chevron). Not used directly in our primitives; pulled in by shadcn-generated components.
- **`@types/node`** — already present from scaffold typically; ensures `process.env` types in tsconfig strict mode.

shadcn/ui itself is not an npm dep — its CLI generates source files into `components/ui/`. Run via `pnpm dlx shadcn@latest …`.

We deliberately do NOT add: `@next/font` (built into Next 15 as `next/font`), `framer-motion` (replaced by `motion`), `react-icons` (Lucide is enough), Radix packages directly (shadcn pulls them per-primitive).

## 4. Files to create/modify

All paths are absolute from the project root `/home/duh/Projects/healthy-you-by-ruhma/`.

### 4.1 `app/globals.css` — tokens, base, type scale

This is the single source of truth for design tokens (master §1). Tailwind v4's `@theme` directive at the top maps CSS variables into the utility namespace so `bg-cream`, `text-ink`, `border-mauve` work out of the box. No `tailwind.config.ts` is needed for tokens in v4 — `@theme` replaces it. We keep a stub `tailwind.config.ts` only for content-path safety and IDE plugins.

Replace the scaffold-generated `app/globals.css` entirely with:

```css
@import "tailwindcss";

/* ---------------------------------------------------------------
   Design tokens — master plan §1
   Single source of truth. Edit here, every utility updates.
--------------------------------------------------------------- */

@theme {
  /* Color tokens (master §1 Design tokens table) */
  --color-cream: #f4f0ee;
  --color-cream-deep: #e8e1d8;
  --color-shell: #e7d3cc;
  --color-ink: #1a1a1a;
  --color-ink-soft: #3e3e3e;
  --color-mauve: #895575;
  --color-mauve-deep: #6e3f5c;
  --color-moss: #5d6b4e;
  --color-paper: #ffffff;

  /* Font families — wired in app/layout.tsx via next/font CSS variables */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-display: var(--font-epilogue), ui-serif, Georgia, serif;

  /* Editorial spacing scale — used by <Container> and section primitives */
  --spacing-section: clamp(4rem, 8vw, 8rem);
  --spacing-section-tight: clamp(3rem, 6vw, 5rem);

  /* Motion durations — keep aligned with motion components */
  --duration-fade: 600ms;
  --duration-reveal: 1200ms;
  --duration-stagger: 800ms;
  --ease-editorial: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-reveal: cubic-bezier(0.77, 0, 0.175, 1);
}

/* ---------------------------------------------------------------
   Base — root, body, selection, focus
--------------------------------------------------------------- */

@layer base {
  :root {
    color-scheme: light;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  html {
    background: var(--color-cream);
    color: var(--color-ink);
  }

  body {
    font-family: var(--font-sans);
    font-size: 17px; /* master §1 Body */
    line-height: 1.6;
    color: var(--color-ink-soft);
    background: var(--color-cream);
  }

  ::selection {
    background: var(--color-shell);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-mauve);
    outline-offset: 3px;
    border-radius: 2px;
  }

  /* Headings use display family by default; primitives override per-variant */
  h1, h2, h3, h4 {
    font-family: var(--font-display);
    color: var(--color-ink);
    font-feature-settings: "ss01", "ss02";
  }

  /* Honour reduced-motion globally — motion components also short-circuit */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* ---------------------------------------------------------------
   Type scale utilities — master §1 type table
   Fluid clamps. Each utility owns size, weight, tracking, family.
   Consumers compose via <Heading variant="…"> or these classes directly.
--------------------------------------------------------------- */

@layer components {
  .type-display-xl {
    font-family: var(--font-display);
    font-size: clamp(64px, 12vw, 220px);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 0.92;
    color: var(--color-ink);
  }

  .type-display {
    font-family: var(--font-display);
    font-size: clamp(40px, 6vw, 96px);
    font-weight: 500;
    letter-spacing: -0.03em;
    line-height: 1.02;
    color: var(--color-ink);
  }

  .type-h1 {
    font-family: var(--font-display);
    font-size: clamp(32px, 4vw, 56px);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.08;
    color: var(--color-ink);
  }

  .type-h2 {
    font-family: var(--font-sans);
    font-size: clamp(24px, 2.5vw, 36px);
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: var(--color-ink);
  }

  .type-eyebrow {
    font-family: var(--font-sans);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    line-height: 1;
    color: var(--color-mauve);
  }

  .type-body {
    font-family: var(--font-sans);
    font-size: 17px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--color-ink-soft);
  }

  .type-small {
    font-family: var(--font-sans);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    color: var(--color-ink-soft);
  }

  .type-caption {
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.04em;
    line-height: 1.4;
    color: var(--color-ink-soft);
    font-style: italic;
  }
}

/* ---------------------------------------------------------------
   Prose — used by <Prose> for MDX rendering (focus pages, journal)
   Editorial body with drop-caps option, pull-quote treatment.
--------------------------------------------------------------- */

@layer components {
  .prose-editorial {
    max-width: 68ch;
    color: var(--color-ink-soft);
    font-family: var(--font-sans);
    font-size: 17px;
    line-height: 1.65;
  }

  .prose-editorial > * + * {
    margin-top: 1.5em;
  }

  .prose-editorial h2 {
    font-family: var(--font-display);
    font-size: clamp(28px, 3vw, 40px);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--color-ink);
    margin-top: 2.5em;
  }

  .prose-editorial h3 {
    font-family: var(--font-display);
    font-size: clamp(22px, 2vw, 28px);
    font-weight: 500;
    letter-spacing: -0.015em;
    color: var(--color-ink);
    margin-top: 2em;
  }

  .prose-editorial blockquote {
    font-family: var(--font-display);
    font-size: clamp(24px, 2.5vw, 36px);
    font-weight: 400;
    line-height: 1.25;
    letter-spacing: -0.015em;
    color: var(--color-ink);
    border-left: 2px solid var(--color-mauve);
    padding-left: 1.25rem;
    margin: 2em 0;
    font-style: italic;
  }

  .prose-editorial a {
    color: var(--color-mauve);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    transition: color 150ms var(--ease-editorial);
  }

  .prose-editorial a:hover {
    color: var(--color-mauve-deep);
  }

  .prose-editorial strong {
    color: var(--color-ink);
    font-weight: 600;
  }

  .prose-editorial ul,
  .prose-editorial ol {
    padding-left: 1.5rem;
  }

  .prose-editorial ul li::marker {
    color: var(--color-mauve);
  }

  /* Drop-cap variant — opt-in via .prose-editorial.has-dropcap */
  .prose-editorial.has-dropcap > p:first-of-type::first-letter {
    font-family: var(--font-display);
    float: left;
    font-size: 5em;
    line-height: 0.9;
    font-weight: 500;
    padding: 0.05em 0.08em 0 0;
    color: var(--color-ink);
  }

  .prose-editorial figure figcaption {
    font-family: var(--font-sans);
    font-size: 13px;
    font-style: italic;
    color: var(--color-ink-soft);
    margin-top: 0.5em;
  }
}
```

### 4.2 `tailwind.config.ts` — minimal v4 stub

Tailwind v4 reads tokens from `@theme` in CSS, not from this file. We keep it only for editor tooling and for the `content` array (still respected for purge in v4 alpha/beta hybrid setups, harmless in pure v4).

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
};

export default config;
```

### 4.3 `app/layout.tsx` — load fonts via next/font

Replace the scaffolded `app/layout.tsx` with the snippet below. La Belle Aurore is dropped per master §1.

```tsx
import type { Metadata } from "next";
import { Inter, Epilogue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  axes: ["opsz"],
});

const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  display: "swap",
  weight: "variable",
});

export const metadata: Metadata = {
  title: {
    default: "Healthy You By Ruhma",
    template: "%s · Healthy You By Ruhma",
  },
  description:
    "Nourishing you inside out for healthy you throughout. Clinical dietitian Dr. Ruhma — Lahore, Pakistan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${epilogue.variable}`}>
      <body className="bg-cream text-ink-soft antialiased">{children}</body>
    </html>
  );
}
```

Notes:

- `next/font/google` self-hosts both fonts; zero CLS (master §4).
- Inter is requested with `axes: ["opsz"]` so the variable optical-size axis is available — used implicitly via `font-feature-settings`.
- Epilogue is requested with `weight: "variable"` — full 100–900 range available.
- The `--font-inter` and `--font-epilogue` CSS variables get bound to the `<html>` element; `globals.css` consumes them via `--font-sans` / `--font-display` in `@theme`.
- Body classes `bg-cream text-ink-soft` work because `@theme` exposed those tokens to Tailwind.

### 4.4 `lib/cn.ts` — class-name helper

Standard shadcn helper. Master plan §5 puts shared utilities in `lib/`.

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4.5 `components/ui/eyebrow.tsx` — small label primitive

```tsx
import { cn } from "@/lib/cn";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "p" | "div";
}

export function Eyebrow({
  as: Tag = "span",
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <Tag className={cn("type-eyebrow", className)} {...rest}>
      {children}
    </Tag>
  );
}
```

### 4.6 `components/ui/heading.tsx` — typed heading primitive

The single most-used primitive. Drives every editorial type moment.

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const headingVariants = cva("", {
  variants: {
    variant: {
      "display-xl": "type-display-xl",
      display: "type-display",
      h1: "type-h1",
      h2: "type-h2",
    },
    tone: {
      ink: "text-ink",
      mauve: "text-mauve",
      "mauve-deep": "text-mauve-deep",
      moss: "text-moss",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "h1",
    tone: "ink",
    align: "left",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

const variantToTag: Record<NonNullable<HeadingProps["variant"]>, HeadingTag> = {
  "display-xl": "h1",
  display: "h1",
  h1: "h1",
  h2: "h2",
};

export function Heading({
  as,
  variant,
  tone,
  align,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = (as ?? variantToTag[variant ?? "h1"]) as HeadingTag;
  return (
    <Tag
      className={cn(headingVariants({ variant, tone, align }), className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
```

Usage:

```tsx
<Heading variant="display-xl" tone="ink" as="h1">nourish</Heading>
<Heading variant="display">Get transformed into your dream version</Heading>
<Heading variant="h2" as="h2">What's included</Heading>
```

### 4.7 `components/ui/container.tsx` — width + padding primitive

Three widths cover all editorial layouts. Master plan repeatedly references max-widths of 720 (longread), 1200 (default), full-bleed.

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const containerVariants = cva(
  "mx-auto w-full px-6 sm:px-8 lg:px-12",
  {
    variants: {
      width: {
        narrow: "max-w-[720px]",        // longread / legal / about mission
        default: "max-w-[1200px]",      // standard sections
        wide: "max-w-[1440px]",         // hero, library editorial spreads
        full: "max-w-none px-0 sm:px-0 lg:px-0", // image full-bleed
      },
    },
    defaultVariants: {
      width: "default",
    },
  }
);

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  as?: "div" | "section" | "article" | "main";
}

export function Container({
  as: Tag = "div",
  width,
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag className={cn(containerVariants({ width }), className)} {...rest}>
      {children}
    </Tag>
  );
}
```

### 4.8 `components/ui/prose.tsx` — MDX wrapper

Used to render compiled MDX (focus pages, journal posts, legal). Wraps children with `.prose-editorial` and an opt-in drop-cap.

```tsx
import { cn } from "@/lib/cn";

interface ProseProps extends React.HTMLAttributes<HTMLDivElement> {
  dropcap?: boolean;
  as?: "div" | "article";
}

export function Prose({
  dropcap = false,
  as: Tag = "div",
  className,
  children,
  ...rest
}: ProseProps) {
  return (
    <Tag
      className={cn(
        "prose-editorial",
        dropcap && "has-dropcap",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
```

### 4.9 `components/motion/fade-up.tsx` — motion #1

Master §1 motion 1: 16px fade-up on scroll-into-view, 600ms, ease-out, disabled under `prefers-reduced-motion`. Marked `"use client"` — server children are passed through as JSX.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  delay?: number;        // seconds
  className?: string;
  as?: "div" | "section" | "article" | "li";
  amount?: number;       // viewport intersection threshold 0..1
  once?: boolean;
}

export function FadeUp({
  children,
  delay = 0,
  className,
  as = "div",
  amount = 0.2,
  once = true,
}: FadeUpProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  if (reduce) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}
```

### 4.10 `components/motion/image-reveal.tsx` — motion #2

Master §1 motion 2: clip-path wipe over 1.2s on initial mount. One per page hero. Wraps a child image (consumer passes `<Image>` or `<img>`).

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

const clipFor: Record<NonNullable<ImageRevealProps["direction"]>, {
  initial: string;
  animate: string;
}> = {
  up:    { initial: "inset(100% 0% 0% 0%)", animate: "inset(0% 0% 0% 0%)" },
  down:  { initial: "inset(0% 0% 100% 0%)", animate: "inset(0% 0% 0% 0%)" },
  left:  { initial: "inset(0% 0% 0% 100%)", animate: "inset(0% 0% 0% 0%)" },
  right: { initial: "inset(0% 100% 0% 0%)", animate: "inset(0% 0% 0% 0%)" },
};

export function ImageReveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: ImageRevealProps) {
  const reduce = useReducedMotion();
  const clip = clipFor[direction];

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      initial={{ clipPath: clip.initial }}
      animate={{ clipPath: clip.animate }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.77, 0, 0.175, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 4.11 `components/motion/letter-stagger.tsx` — motion #3

Master §1 motion 3: stagger letter opacity 0→1 over 800ms on mount. Used once per page on the display "moment". Splits the child string into spans — preserves spaces.

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";

interface LetterStaggerProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span" | "div";
  delay?: number;
}

export function LetterStagger({
  text,
  className,
  as = "span",
  delay = 0,
}: LetterStaggerProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    return <Tag className={className} aria-label={text}>{text}</Tag>;
  }

  // Spread by Unicode codepoint to handle composed characters safely.
  const letters = Array.from(text);
  const totalLetters = letters.filter((c) => c !== " ").length;
  // Distribute 800ms across all visible letters.
  const perLetter = totalLetters > 0 ? 0.8 / totalLetters : 0;

  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: perLetter,
          },
        },
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: "0.2em" },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </Tag>
  );
}
```

### 4.12 `public/illustrations/` — botanical SVG set

Per master §1 Photography & art direction: "5–8 simple botanical/ingredient line-art SVGs (fennel, mint, citrus rind) used at 80px max as section anchors. Hand-drawn feel, single line, --ink color."

**Files to commit (placeholders during this phase, finals during polish):**

```
public/illustrations/fennel.svg
public/illustrations/mint.svg
public/illustrations/citrus.svg
public/illustrations/leaf.svg
public/illustrations/root.svg
public/illustrations/sprig.svg
public/illustrations/seed.svg     (optional 7th)
public/illustrations/pestle.svg   (optional 8th)
```

**Design constraints (apply to all):**

- ViewBox `0 0 80 80`, no fixed width/height in the file itself (consumer sets via Tailwind `w-20 h-20`).
- `stroke="currentColor"` so they inherit `text-ink` / `text-mauve` from parent.
- `stroke-width="1"` for hand-drawn feel; `fill="none"`.
- `stroke-linecap="round"`, `stroke-linejoin="round"`.
- Single continuous-feel path where possible (botanical line-art aesthetic).
- No gradients, no filters, no `<style>` blocks, no text.
- Each file < 2 KB.

**Sourcing approach (in order of preference):**

1. **Commission via Fiverr** (~$150–250 for the full set of 6–8) — search "botanical line art SVG" or "minimalist herb illustration"; provide the constraints above as a brief and the master plan §1 visual direction. **Recommended** — fastest path to consistent quality.
2. **Noun Project Pro** (~$40/year) — license existing botanical line-art icons, edit in Figma to match stroke-width and viewBox, export as SVG. Acceptable if budget-tight.
3. **DIY in Figma / Illustrator** (1 afternoon) — trace from real photographs; Pen tool only, single stroke, no fills. Acceptable if developer enjoys it.

**Placeholder during this phase:** ship trivial placeholders so `/_kit` can render slots. Example for `fennel.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"
     stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
  <path d="M40 70 V30 M40 30 C 30 25 25 18 26 10 M40 30 C 50 25 55 18 54 10
           M40 42 C 32 38 28 32 30 26 M40 42 C 48 38 52 32 50 26"/>
  <circle cx="26" cy="10" r="1.2"/>
  <circle cx="54" cy="10" r="1.2"/>
  <circle cx="30" cy="26" r="1"/>
  <circle cx="50" cy="26" r="1"/>
</svg>
```

(Variations of the above pattern for each file. Final art replaces these in Phase 6 polish.)

### 4.13 `app/_kit/page.tsx` — visual QA route

The single scrollable page that exercises every token, type style, primitive, and motion. The leading underscore in `_kit` means Next.js does NOT treat it as a route segment for build-time discovery checks — but App Router DOES route it (`/_kit` works in dev and prod). We exclude it from the sitemap and `robots.txt` in later phases. For now it's accessible to anyone who knows the URL — fine for QA.

```tsx
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Prose } from "@/components/ui/prose";
import { FadeUp } from "@/components/motion/fade-up";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";
import Image from "next/image";

const TOKENS = [
  { name: "cream", value: "#F4F0EE", className: "bg-cream" },
  { name: "cream-deep", value: "#E8E1D8", className: "bg-cream-deep" },
  { name: "shell", value: "#E7D3CC", className: "bg-shell" },
  { name: "ink", value: "#1A1A1A", className: "bg-ink" },
  { name: "ink-soft", value: "#3E3E3E", className: "bg-ink-soft" },
  { name: "mauve", value: "#895575", className: "bg-mauve" },
  { name: "mauve-deep", value: "#6E3F5C", className: "bg-mauve-deep" },
  { name: "moss", value: "#5D6B4E", className: "bg-moss" },
  { name: "paper", value: "#FFFFFF", className: "bg-paper" },
];

const ILLUSTRATIONS = [
  "fennel", "mint", "citrus", "leaf", "root", "sprig", "seed", "pestle",
];

export default function KitPage() {
  return (
    <main className="min-h-screen bg-cream text-ink-soft pb-32">
      <Container width="default" className="py-16 space-y-24">
        {/* Page header */}
        <header className="space-y-4 border-b border-ink/10 pb-10">
          <Eyebrow>Internal · Visual QA</Eyebrow>
          <Heading variant="display" as="h1">Design system kit</Heading>
          <p className="type-body max-w-[60ch]">
            Every token, type style, primitive, and motion in one scrollable
            page. If something here looks wrong, the whole site looks wrong.
          </p>
        </header>

        {/* 1. Color tokens */}
        <section className="space-y-6">
          <Eyebrow>01 — Color tokens</Eyebrow>
          <Heading variant="h2" as="h2">Palette</Heading>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {TOKENS.map((t) => (
              <div key={t.name} className="space-y-2">
                <div
                  className={`${t.className} h-24 w-full rounded-sm border border-ink/10`}
                />
                <div className="space-y-0.5">
                  <p className="type-small font-medium text-ink">{t.name}</p>
                  <p className="type-caption">{t.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Type scale */}
        <section className="space-y-8">
          <Eyebrow>02 — Type scale</Eyebrow>
          <Heading variant="h2" as="h2">Editorial typography</Heading>

          <div className="space-y-10">
            <div className="space-y-2">
              <Eyebrow>Display XL · Epilogue · 600 · -0.04em</Eyebrow>
              <p className="type-display-xl">nourish</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Display · Epilogue · 500 · -0.03em</Eyebrow>
              <p className="type-display">Get transformed into your dream version</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>H1 · Epilogue · 500 · -0.02em</Eyebrow>
              <p className="type-h1">My mission is to make you shine from inside.</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>H2 · Inter · 500 · -0.01em</Eyebrow>
              <p className="type-h2">What's included in the program</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Eyebrow · Inter · 500 · 0.16em uppercase</Eyebrow>
              <p className="type-eyebrow">Section label</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Body · Inter · 400 · 1.6 line-height · 17px</Eyebrow>
              <p className="type-body max-w-[60ch]">
                Nourishing you inside out for healthy you throughout. The body
                copy reads at 17px with generous line-height — editorial weight
                for long-form content like the focus pages and journal posts.
              </p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Small · Inter · 400 · 14px</Eyebrow>
              <p className="type-small">Secondary metadata, form helper text, breadcrumbs.</p>
            </div>

            <div className="space-y-2">
              <Eyebrow>Caption · Inter · italic · 13px · 0.04em</Eyebrow>
              <p className="type-caption">Photograph: Dr. Ruhma at the practice, Lahore, 2024.</p>
            </div>
          </div>
        </section>

        {/* 3. Primitives */}
        <section className="space-y-8">
          <Eyebrow>03 — Primitives</Eyebrow>
          <Heading variant="h2" as="h2">Composable building blocks</Heading>

          <div className="space-y-6">
            <div className="space-y-2">
              <Eyebrow>&lt;Heading&gt; variants</Eyebrow>
              <Heading variant="display-xl">moment</Heading>
              <Heading variant="display">Page title</Heading>
              <Heading variant="h1">Section heading</Heading>
              <Heading variant="h2">Subsection</Heading>
              <Heading variant="h1" tone="mauve">Mauve tone</Heading>
              <Heading variant="h1" tone="moss">Moss tone</Heading>
            </div>

            <div className="space-y-2 border-t border-ink/10 pt-6">
              <Eyebrow>&lt;Container&gt; widths</Eyebrow>
              <div className="bg-cream-deep p-4">
                <Container width="narrow" className="bg-paper p-4">narrow (720)</Container>
              </div>
              <div className="bg-cream-deep p-4">
                <Container width="default" className="bg-paper p-4">default (1200)</Container>
              </div>
              <div className="bg-cream-deep p-4">
                <Container width="wide" className="bg-paper p-4">wide (1440)</Container>
              </div>
            </div>

            <div className="space-y-2 border-t border-ink/10 pt-6">
              <Eyebrow>&lt;Prose&gt; with drop-cap</Eyebrow>
              <Prose dropcap>
                <p>
                  Hormonal health is not one switch. The body runs on a network
                  of signals — cortisol when stressed, insulin after a meal,
                  estrogen and progesterone on a monthly rhythm — and each one
                  affects the others. When clients tell me "my hormones are off,"
                  the work is to figure out <em>which one, when, and why</em>.
                </p>
                <h2>Where this shows up</h2>
                <p>
                  In practice, hormonal imbalance arrives wearing three masks.
                  Sometimes it's PCOS. Sometimes it's thyroid. Sometimes it's
                  cortisol you didn't realise was running the show.
                </p>
                <blockquote>
                  The body is patient. It will wait years for you to listen
                  before it raises its voice.
                </blockquote>
                <p>
                  <a href="#">Read more on the journal →</a>
                </p>
              </Prose>
            </div>
          </div>
        </section>

        {/* 4. Motion */}
        <section className="space-y-8">
          <Eyebrow>04 — Motion (3 only)</Eyebrow>
          <Heading variant="h2" as="h2">Master §1 motion components</Heading>

          <div className="space-y-12">
            <div className="space-y-3">
              <Eyebrow>&lt;FadeUp&gt; · 600ms · ease-out · on scroll</Eyebrow>
              {[0, 1, 2].map((i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="bg-paper p-6 border border-ink/10 type-body">
                    Block {i + 1} fades up when scrolled into view (16px → 0).
                  </div>
                </FadeUp>
              ))}
            </div>

            <div className="space-y-3 border-t border-ink/10 pt-8">
              <Eyebrow>&lt;ImageReveal&gt; · 1.2s · clip-path wipe · on mount</Eyebrow>
              <ImageReveal direction="up" className="aspect-[4/3] w-full max-w-2xl">
                <div className="h-full w-full bg-shell flex items-center justify-center">
                  <span className="type-display text-mauve-deep">photo</span>
                </div>
              </ImageReveal>
            </div>

            <div className="space-y-3 border-t border-ink/10 pt-8">
              <Eyebrow>&lt;LetterStagger&gt; · 800ms · on mount</Eyebrow>
              <LetterStagger
                text="nourish"
                as="h1"
                className="type-display-xl"
              />
            </div>
          </div>
        </section>

        {/* 5. Botanical illustrations */}
        <section className="space-y-6">
          <Eyebrow>05 — Botanical SVG set</Eyebrow>
          <Heading variant="h2" as="h2">Section anchors</Heading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {ILLUSTRATIONS.map((name) => (
              <figure key={name} className="space-y-2">
                <div className="aspect-square bg-paper border border-ink/10 flex items-center justify-center text-ink">
                  <Image
                    src={`/illustrations/${name}.svg`}
                    alt=""
                    width={80}
                    height={80}
                    className="w-20 h-20"
                    aria-hidden
                  />
                </div>
                <figcaption className="type-caption">{name}.svg</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 6. Reduced motion check */}
        <section className="space-y-4 border-t border-ink/10 pt-10">
          <Eyebrow>06 — Reduced motion</Eyebrow>
          <p className="type-body max-w-[60ch]">
            Toggle <code className="bg-cream-deep px-1">prefers-reduced-motion: reduce</code>
            in DevTools (Rendering tab → Emulate CSS media feature). All three
            motion components above should render their final state with no
            animation. The global CSS rule also kills any stray transitions.
          </p>
        </section>
      </Container>
    </main>
  );
}
```

### 4.14 shadcn/ui — initialise + add three primitives only

Master §1 says we want shadcn primitives but only three are needed for Phase 1's downstream work: **Button** (used everywhere), **Sheet** (mobile nav drawer in Phase 2), **Accordion** (FAQ blocks in Phase 3). We deliberately do NOT add every primitive at once — the design system stays small and we add primitives as pages need them.

After running `pnpm dlx shadcn@latest init` (the command writes `components.json`), patch `components.json` to align with our token names:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/cn",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Note `"utils": "@/lib/cn"` — shadcn's generated primitives import `cn` from this path, matching our 4.4 helper.

Then:

```bash
pnpm dlx shadcn@latest add button sheet accordion
```

That writes `components/ui/button.tsx`, `components/ui/sheet.tsx`, `components/ui/accordion.tsx` and pulls the Radix runtime deps (`@radix-ui/react-dialog`, `@radix-ui/react-accordion`, `@radix-ui/react-slot`). After install:

- **Patch `components/ui/button.tsx`** so its variants use our tokens. Replace the generated `cva()` call with:

```ts
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mauve focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-cream hover:bg-ink/90",
        mauve:
          "bg-mauve text-cream hover:bg-mauve-deep",
        outline:
          "border border-ink/20 bg-transparent text-ink hover:bg-ink/5",
        ghost:
          "bg-transparent text-ink hover:bg-ink/5",
        link:
          "text-mauve underline-offset-4 hover:underline hover:text-mauve-deep",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-[14px]",
        lg: "h-12 px-8 text-[16px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

- **Sheet and Accordion** are kept as-generated for now; their colors will be inherited from our base tokens because shadcn's templates use CSS variables that we override via `@theme` (the new-york style respects token swaps).

## 5. Step-by-step tasks

Execute in this exact order. Each step is independently committable.

1. **Install runtime deps**

   ```bash
   pnpm add motion clsx tailwind-merge class-variance-authority lucide-react
   ```

   Verify `package.json` lists each. Commit: `chore(deps): add motion, cva, cn helpers`.

2. **Replace `app/globals.css`** with the contents in §4.1.

   Verify by running `pnpm dev` and visiting `/` — body background should now be `#F4F0EE` (cream). Inspect: `body { background: rgb(244, 240, 238); }`. Commit: `feat(design): tokens, type scale, prose styles`.

3. **Stub `tailwind.config.ts`** with the contents in §4.2.

4. **Create `lib/cn.ts`** per §4.4. Run `pnpm tsc --noEmit` to confirm TS clean.

5. **Wire fonts** by replacing `app/layout.tsx` with §4.3. Restart `pnpm dev`. Inspect — `<html>` should have classes `__variable_xxxxx` containing `--font-inter` and `--font-epilogue`. Body should render in Inter; any `<h1>` in Epilogue.

   Commit: `feat(design): load Inter + Epilogue via next/font, drop La Belle Aurore`.

6. **Create primitives** in this order (each is small):

   - `components/ui/eyebrow.tsx` (§4.5)
   - `components/ui/heading.tsx` (§4.6)
   - `components/ui/container.tsx` (§4.7)
   - `components/ui/prose.tsx` (§4.8)

   Run `pnpm tsc --noEmit` after each. Commit batch: `feat(ui): Eyebrow, Heading, Container, Prose primitives`.

7. **Create motion components**:

   - `components/motion/fade-up.tsx` (§4.9)
   - `components/motion/image-reveal.tsx` (§4.10)
   - `components/motion/letter-stagger.tsx` (§4.11)

   Each is `"use client"`. Commit: `feat(motion): FadeUp, ImageReveal, LetterStagger with reduced-motion guard`.

8. **Add botanical SVG placeholders** to `public/illustrations/`. Six files minimum (fennel, mint, citrus, leaf, root, sprig). Each ≤ 2 KB, viewBox 0 0 80 80, currentColor, stroke-width 1. Commit: `feat(assets): botanical illustration placeholders`.

   **Brief out the finals to Fiverr** at this point — final art lands during Phase 6 polish per master §8. Track in `MIGRATION_NOTES.md` (created later).

9. **Initialize shadcn**:

   ```bash
   pnpm dlx shadcn@latest init
   ```

   When prompted, choose: TypeScript yes, style "New York", base color "Neutral", CSS variables yes, components alias `@/components`, utils alias `@/lib/cn`. Then patch `components.json` to match §4.14 exactly (the prompt-driven output may differ — overwrite to match).

10. **Add the three primitives**:

    ```bash
    pnpm dlx shadcn@latest add button sheet accordion
    ```

    Patch `components/ui/button.tsx` per §4.14 (mauve / cream variants). Leave `sheet.tsx` and `accordion.tsx` unmodified for now — they'll be styled in Phase 2 (Sheet) and Phase 3 (Accordion) where they're first consumed.

    Commit: `feat(ui): shadcn init + Button (tokens), Sheet, Accordion`.

11. **Build `/_kit`** at `app/_kit/page.tsx` per §4.13. Run `pnpm dev`, visit `http://localhost:3000/_kit`, scroll the entire page.

12. **Visual QA pass on `/_kit`**:
    - All 9 color tokens render with correct hex labels.
    - All 8 type scale rows render with correct weights and clamps (resize browser 320 → 1920 to confirm fluidity).
    - `<Heading>` tone variants (mauve, moss) render correctly.
    - `<Container>` widths visibly differ (narrow / default / wide).
    - `<Prose>` drop-cap renders on first paragraph; blockquote uses Epilogue mauve border-left.
    - `<FadeUp>` blocks animate in on scroll (refresh, scroll down).
    - `<ImageReveal>` clip-path wipes on mount.
    - `<LetterStagger>` "nourish" letters cascade in over ~800ms.
    - All 6+ botanical SVGs render (placeholder art OK).
    - Toggle DevTools "Emulate CSS media feature prefers-reduced-motion: reduce" — re-load page; all three motion sections render their final state instantly with no animation.

13. **Run lint + typecheck + build**:

    ```bash
    pnpm lint && pnpm tsc --noEmit && pnpm build
    ```

    All three must pass. The production build also serves as a smoke test that `/_kit` is server-renderable (RSC + client-island boundaries are correct).

14. **Commit `/_kit`** as the closing commit of Phase 1: `feat(design): /_kit visual QA route covering tokens, type, primitives, motion`.

## 6. Acceptance criteria

Phase 1 is done when **all** of these hold:

- [ ] `pnpm dev` runs cleanly with no console warnings or font-loading errors.
- [ ] `/` (the scaffold homepage) renders against `bg-cream` with body in Inter and headings in Epilogue. (The page itself stays the scaffold default — Phase 3 replaces it.)
- [ ] `/_kit` loads at `http://localhost:3000/_kit` and shows, in order: page header → 9 color swatches with hex labels → 8 type scale rows → primitives showcase (Heading variants, Container widths, Prose with drop-cap) → 3 motion demos → 6+ botanical SVGs → reduced-motion explainer.
- [ ] Resizing the browser from 320px to 1920px shows all `clamp()` type values scaling fluidly with no jumps.
- [ ] All Tailwind utilities `bg-cream`, `bg-cream-deep`, `bg-shell`, `bg-paper`, `text-ink`, `text-ink-soft`, `text-mauve`, `text-mauve-deep`, `text-moss`, `border-mauve`, `bg-ink`, `bg-mauve` resolve to the master §1 hex values in DevTools.
- [ ] `<FadeUp>` triggers on scroll-into-view with 16px translation, ~600ms duration.
- [ ] `<ImageReveal>` plays a 1.2s clip-path wipe on initial mount.
- [ ] `<LetterStagger>` cascades letters of "nourish" over ~800ms total.
- [ ] DevTools emulating `prefers-reduced-motion: reduce` renders all three motion sections in their final state instantly — no animations.
- [ ] `<Heading variant="display-xl">` renders Epilogue at clamp(64, 12vw, 220) with -0.04em tracking.
- [ ] `<Prose dropcap>` renders a full Epilogue drop-cap on the first paragraph; blockquote uses 2px mauve left border with Epilogue italic.
- [ ] shadcn `<Button variant="default">` renders ink-on-cream; `variant="mauve"` renders mauve-on-cream and hovers to mauve-deep.
- [ ] `pnpm tsc --noEmit` exits 0 (strict mode, no `any` introduced).
- [ ] `pnpm lint` exits 0.
- [ ] `pnpm build` exits 0 and the build output lists `/_kit` as a route.
- [ ] `public/illustrations/` contains at least 6 SVGs (fennel, mint, citrus, leaf, root, sprig) — placeholders acceptable.
- [ ] The mauve-on-cream contrast is visually verified on `/_kit` to read clearly at 17px body and 12px eyebrow. (Formal AA contrast audit happens in Phase 6 polish per master §9.)

## 7. Out of scope

Explicitly deferred to later phases — do not start in Phase 1:

- **Marketing pages** (Home, About, Services, Programs, Focus, Library, Journal, Contact, Legal). All of Phase 3 onward — master §3 / §8.
- **Layout shell** (Nav, Footer, redirects in `next.config.js`, robots, sitemap) — Phase 2 / `02-layout-shell.md`.
- **MDX pipeline** (`next-mdx-remote`, `gray-matter`, frontmatter contract, `content/` directory population) — wired during Phase 3 when the first MDX-driven page is built.
- **shadcn primitives beyond Button/Sheet/Accordion** (Dialog, Form, Input, Select, etc.) — added on demand in their consuming phase. Form primitives land in Phase 5 with the contact form.
- **Final botanical illustrations** — the Fiverr commission lands during Phase 6 polish. Phase 1 ships placeholders.
- **Image migration** (the 320 MB → ~25 MB optimization pass via `sharp`) — master §6 / Phase 6 polish.
- **Real photography integration** (practitioner portraits, hero shots) — Phase 3 when the home/about heroes are built.
- **`<Button>` in mauve as primary CTA vs ink as primary** — design call deferred until the home hero is composed in Phase 3 against real content. For now both variants exist; Phase 3 picks.
- **Dark mode** — out of scope entirely. The brand is warm cream + ink; no dark variant planned.
- **Internationalization / RTL** — out of scope. Site is English-only despite the practitioner being Pakistani (master §2, §3 imply EN audience).
- **Analytics, OG image generator, JSON-LD, sitemap** — Phase 6 polish.
- **Newsletter form, contact form server action** — Phase 5.
- **CLS / LCP / Lighthouse perf budgets** — measured in Phase 6 against the verification criteria in master §9.
- **axe-core accessibility audit** — formally run in Phase 6. Phase 1 only commits to keyboard-visible focus rings (already in `globals.css`) and `prefers-reduced-motion` honour.

When Phase 1 closes, the next agent (Phase 2 — Layout shell) inherits a project where every visual atom needed for any subsequent page already exists and is exercised on `/_kit`. They should never have to add a token, type style, or motion component — only compose what's here.
