# Phase 2 — Layout Shell

## 1. Goal

Wire the persistent app skeleton: root `app/layout.tsx` (fonts, base metadata, html/body shell), a sticky scroll-condensing `<Nav>`, a 4-column editorial `<Footer>`, the single-source-of-truth `content/site.ts`, all 18 SEO-continuity 308 redirects, `robots.ts`, `sitemap.ts`, on-brand loading/error UI, and the optimized wordmark SVG. After this phase, every future page renders inside the finished chrome and every old WordPress URL resolves to the new path.

## 2. Pre-requisites

- **Phase 0 — Setup** complete: Next.js 15 app router scaffold, TypeScript strict, Tailwind v4, pnpm, ESLint + Prettier, Husky.
- **Phase 1 — Design system** complete and exporting the following from the codebase already:
  - `app/globals.css` with the token CSS variables (`--cream`, `--cream-deep`, `--shell`, `--ink`, `--ink-soft`, `--mauve`, `--mauve-deep`, `--moss`, `--paper`).
  - `tailwind.config.ts` mapping those tokens to utilities (`bg-cream`, `text-ink-soft`, `text-mauve`, `font-sans` → Inter var, `font-display` → Epilogue var, etc.).
  - `next/font` instances exported from `app/fonts.ts` (`inter`, `epilogue`) with `--font-inter` and `--font-epilogue` CSS variables.
  - shadcn primitives `Sheet`, `Button` (already added in Phase 1).
  - `Container`, `Eyebrow` primitives.
- A clean `git status` on `main` before starting this phase.

## 3. Dependencies

All already installed by Phase 0/1 except where noted. Add only what is missing:

```bash
pnpm add motion@^11
pnpm add lucide-react
pnpm add clsx tailwind-merge
pnpm add -D svgo
```

Verify already present from Phase 1 (do not re-add):

- `next@15`, `react@19`, `react-dom@19`, `typescript`
- `tailwindcss@4`, `@tailwindcss/postcss`
- shadcn-installed `@radix-ui/react-dialog` (the `Sheet` primitive depends on it)
- `class-variance-authority` (already added with shadcn)

`motion` (formerly `framer-motion`) v11 is the package that exposes the React-Server-Component-friendly `motion/react` entrypoint and the `useScroll` hook used by `<Nav>`.

`svgo` is a one-off dev-time tool to minify the wordmark; it is not a runtime dependency.

## 4. Files to create/modify

Full paths, full code. Each file is intended to be pasted verbatim.

### 4.1 `content/site.ts`

The single source of truth. Every Nav/Footer/SEO consumer imports from here.

```ts
// content/site.ts

export type NavItem = {
  label: string;
  href: string;
  /** When true, the link is rendered as the CTA pill rather than a text link. */
  cta?: boolean;
};

export type FooterColumn = {
  heading: string;
  items: { label: string; href: string; external?: boolean }[];
};

export const site = {
  name: "Healthy You By Ruhma",
  shortName: "Healthy You",
  practitioner: "Dr. Ruhma",
  tagline: "Nourishing You Inside Out For Healthy You Throughout",
  description:
    "Editorial nutrition practice with Dr. Ruhma — clinical dietitian based in Lahore. Programs, focus areas, and guidebooks for hormonal health, weight management, and considered eating.",
  locale: "en",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_ENV === "production"
      ? "https://dietitianruhma.com"
      : "http://localhost:3000"),
  contact: {
    email: "hello@dietitianruhma.com",
    whatsapp: "+923000000000", // E.164. Replace at content cutover.
    whatsappDisplay: "+92 300 000 0000",
    instagram: "dietitian.ruhma",
    instagramUrl: "https://instagram.com/dietitian.ruhma",
  },
  nav: [
    { label: "Programs", href: "/services" },
    { label: "Focus", href: "/focus/hormonal-health" },
    { label: "Library", href: "/library" },
    { label: "Journal", href: "/journal" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact", cta: true },
  ] satisfies NavItem[],
  footerColumns: [
    {
      heading: "Practice",
      items: [
        { label: "About Dr. Ruhma", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" },
        { label: "Journal", href: "/journal" },
      ],
    },
    {
      heading: "Programs",
      items: [
        { label: "Diet Planning", href: "/programs/diet-planning" },
        { label: "Coaching", href: "/programs/coaching" },
        { label: "Consultation Call", href: "/programs/consultation" },
      ],
    },
    {
      heading: "Resources",
      items: [
        { label: "The Library", href: "/library" },
        { label: "Hormonal Health", href: "/focus/hormonal-health" },
        { label: "Weight Management", href: "/focus/weight-management" },
      ],
    },
    {
      heading: "Legal",
      items: [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Refunds", href: "/legal/refunds" },
      ],
    },
  ] satisfies FooterColumn[],
} as const;

export type Site = typeof site;
```

### 4.2 `app/layout.tsx`

The root layout. Wires fonts, sets html/body classes, applies metadata, theme color, viewport. Per-page metadata happens in plan 13.

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { inter, epilogue } from "@/app/fonts";
import { site } from "@/content/site";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.practitioner }],
  creator: site.practitioner,
  publisher: site.name,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    url: site.url,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    creator: `@${site.contact.instagram}`,
  },
  alternates: { canonical: site.url },
  robots: {
    index: process.env.VERCEL_ENV === "production",
    follow: process.env.VERCEL_ENV === "production",
    googleBot: {
      index: process.env.VERCEL_ENV === "production",
      follow: process.env.VERCEL_ENV === "production",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F0EE" },
    { media: "(prefers-color-scheme: dark)", color: "#F4F0EE" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${epilogue.variable}`} suppressHydrationWarning>
      <body className="bg-cream text-ink-soft flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#main"
          className="focus:bg-paper focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

### 4.3 `components/layout/nav.tsx`

Sticky, scroll-condensing nav. Wordmark left + links right. Mobile: hamburger → Sheet. Mauve underline on active route. Uses `useScroll` from motion v11.

```tsx
// components/layout/nav.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

const CONDENSE_THRESHOLD = 64;

/** Returns true if `pathname` is inside `href`'s namespace.
 *  Exact match for "/", prefix match for nested routes,
 *  but only when `href` itself is at least one segment deep
 *  (so "/about" doesn't accidentally match "/" only). */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  // Strip trailing slash, then prefix-match on a segment boundary.
  const clean = href.replace(/\/$/, "");
  return pathname === clean || pathname.startsWith(clean + "/");
}

/** Group nav slugs that share a "section" so the underline highlights
 *  e.g. /focus/weight-management when the nav item is /focus/hormonal-health. */
function isActiveSection(pathname: string, href: string): boolean {
  if (href.startsWith("/focus")) return pathname.startsWith("/focus");
  if (href.startsWith("/programs") || href === "/services")
    return pathname.startsWith("/programs") || pathname === "/services";
  if (href.startsWith("/library")) return pathname.startsWith("/library");
  if (href.startsWith("/journal")) return pathname.startsWith("/journal");
  return isActive(pathname, href);
}

export function Nav() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCondensed(latest > CONDENSE_THRESHOLD);
  });

  // Close the sheet on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: condensed ? 10 : 22,
        paddingBottom: condensed ? 10 : 22,
        backgroundColor: condensed ? "rgba(244, 240, 238, 0.85)" : "rgba(244, 240, 238, 0)",
        backdropFilter: condensed ? "blur(10px)" : "blur(0px)",
        borderBottomColor: condensed ? "rgba(26, 26, 26, 0.08)" : "rgba(26, 26, 26, 0)",
      }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b"
      data-condensed={condensed}
    >
      <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 lg:px-10">
        <Link href="/" aria-label={`${site.name} — home`} className="flex items-center gap-2">
          <Image
            src="/wordmark.svg"
            alt={site.name}
            width={168}
            height={28}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => {
            const active = isActiveSection(pathname, item.href);
            if (item.cta) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-ink/15 bg-ink text-cream rounded-full border px-4 py-2 text-sm font-medium transition",
                    "hover:bg-mauve-deep hover:border-mauve-deep",
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-ink/80 hover:text-ink relative text-sm tracking-wide transition",
                  "after:bg-mauve after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:transition-transform",
                  "hover:after:scale-x-100",
                  active && "text-ink after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="text-ink rounded-md p-2 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-ink/10 bg-cream w-[88vw] max-w-sm border-l p-0"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <SheetTitle className="font-display text-ink text-lg">Menu</SheetTitle>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-ink rounded-md p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col px-6 pb-10">
              {site.nav.map((item) => {
                const active = isActiveSection(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-ink/10 font-display text-ink/80 border-b py-4 text-2xl tracking-tight transition",
                      active && "text-ink",
                      item.cta &&
                        "bg-ink text-cream mt-6 rounded-full border-0 py-3 text-center text-base",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
```

### 4.4 `components/layout/footer.tsx`

Four columns + newsletter (placeholder action) + socials + tagline at Epilogue 32px.

```tsx
// components/layout/footer.tsx
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { site } from "@/content/site";

function NewsletterForm() {
  // Real action wires up in Phase 6 (Buttondown / Resend Audiences).
  // For now: graceful no-op that posts to a placeholder route which 204s.
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="flex w-full max-w-sm items-center gap-2"
      aria-label="Newsletter signup"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@inbox.com"
        className="border-ink/30 text-ink placeholder:text-ink/40 focus:border-mauve flex-1 rounded-none border-0 border-b bg-transparent px-0 py-2 text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="text-mauve hover:text-mauve-deep text-sm font-medium tracking-wide underline-offset-4 hover:underline"
      >
        Subscribe →
      </button>
    </form>
  );
}

export function Footer() {
  return (
    <footer className="border-ink/10 bg-cream mt-32 border-t">
      <div className="mx-auto w-full max-w-[88rem] px-6 py-20 lg:px-10">
        {/* Tagline */}
        <p className="font-display text-ink text-[28px] leading-tight tracking-tight md:text-[32px]">
          {site.tagline}
        </p>

        <div className="mt-16 grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-8">
          {site.footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-ink/60 text-[11px] font-medium tracking-[0.16em] uppercase">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-ink-soft hover:text-mauve text-sm transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter occupies the 5th column on lg+, full width below */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-ink/60 text-[11px] font-medium tracking-[0.16em] uppercase">
              Newsletter
            </h3>
            <p className="text-ink-soft mt-5 text-sm">
              Quiet, occasional dispatches on hormones, food, and the body.
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-ink/10 mt-16 flex flex-col gap-6 border-t pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-ink-soft text-xs">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <ul className="flex items-center gap-5">
            <li>
              <a
                href={site.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram — @${site.contact.instagram}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                aria-label={`Email — ${site.contact.email}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <Mail className="h-4 w-4" />
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${site.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp — ${site.contact.whatsappDisplay}`}
                className="text-ink-soft hover:text-mauve transition"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
```

### 4.5 `app/api/newsletter/route.ts`

Placeholder so the form action does not 404 in dev. Real implementation in Phase 6.

```ts
// app/api/newsletter/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: true, message: "Subscription pending — wiring scheduled for Phase 6." },
    { status: 202 },
  );
}
```

### 4.6 `lib/utils.ts`

If Phase 1 has not already produced this from shadcn, create it.

```ts
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4.7 `next.config.js`

Full 18-redirect set per master §6 plus image config baseline.

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [400, 800, 1200, 1600, 2400],
  },
  async redirects() {
    // All entries are 308 (permanent: true). Every old WP slug has a home.
    return [
      // Top-level renames
      { source: "/about-me", destination: "/about", permanent: true },
      { source: "/contact-me", destination: "/contact", permanent: true },

      // Programs (with WP typos corrected)
      {
        source: "/diet-plannig-program",
        destination: "/programs/diet-planning",
        permanent: true,
      },
      {
        source: "/coaching-program",
        destination: "/programs/coaching",
        permanent: true,
      },
      {
        source: "/conultation-call",
        destination: "/programs/consultation",
        permanent: true,
      },

      // Focus areas
      {
        source: "/hormonal-health",
        destination: "/focus/hormonal-health",
        permanent: true,
      },
      {
        source: "/weight-management",
        destination: "/focus/weight-management",
        permanent: true,
      },

      // Shop → Library
      { source: "/shop", destination: "/library", permanent: true },
      {
        source: "/shop/diabetes-essentials",
        destination: "/library/diabetes-essentials",
        permanent: true,
      },
      {
        source: "/shop/pcos-guidebook",
        destination: "/library/pcos-guidebook",
        permanent: true,
      },
      {
        source: "/shop/skin-secrets",
        destination: "/library/skin-secrets",
        permanent: true,
      },

      // Dropped commerce flows — point at /library
      { source: "/cart", destination: "/library", permanent: true },
      { source: "/checkout", destination: "/library", permanent: true },
      { source: "/my-account", destination: "/library", permanent: true },

      // Legal
      {
        source: "/refund_returns",
        destination: "/legal/refunds",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/legal/terms",
        permanent: true,
      },

      // Trailing-slash variant of /shop because WP's permalinks served both.
      // Next handles trailing-slash collapsing site-wide via default config; this
      // is only here as belt-and-braces in case Search Console queues the slashed form.
      { source: "/shop/", destination: "/library", permanent: true },
    ];
  },
};

module.exports = nextConfig;
```

### 4.8 `app/robots.ts`

Production-only indexing; preview deploys (`VERCEL_ENV !== 'production'`) disallow all.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: isProd ? [{ userAgent: "*", allow: "/" }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: isProd ? `${site.url}/sitemap.xml` : undefined,
    host: isProd ? site.url : undefined,
  };
}
```

### 4.9 `app/sitemap.ts`

Static-route list + future glob of `content/journal/*.mdx`. Glob is wrapped in `try/catch` so the build does not break if the directory is empty during early phases.

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { site } from "@/content/site";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/about", priority: 0.9, changeFrequency: "yearly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/programs/diet-planning", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs/coaching", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs/consultation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/focus/hormonal-health", priority: 0.7, changeFrequency: "monthly" },
  { path: "/focus/weight-management", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library", priority: 0.8, changeFrequency: "monthly" },
  { path: "/library/diabetes-essentials", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library/pcos-guidebook", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library/skin-secrets", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/refunds", priority: 0.2, changeFrequency: "yearly" },
];

function listJournalSlugs(): string[] {
  try {
    const dir = path.join(process.cwd(), "content", "journal");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = STATIC_ROUTES.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const journal = listJournalSlugs().map((slug) => ({
    url: `${site.url}/journal/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...base, ...journal];
}
```

### 4.10 `app/loading.tsx`

Minimal, on-brand skeleton. No spinner; subtle pulse on a typographic placeholder so it feels editorial rather than utilitarian.

```tsx
// app/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <div className="bg-ink/10 h-3 w-24 animate-pulse rounded-full" />
      <div className="bg-ink/10 mt-6 h-12 w-3/4 max-w-2xl animate-pulse rounded-md" />
      <div className="bg-ink/10 mt-4 h-12 w-1/2 max-w-xl animate-pulse rounded-md" />
      <div className="bg-ink/10 mt-10 h-4 w-2/3 max-w-lg animate-pulse rounded" />
      <div className="bg-ink/10 mt-2 h-4 w-1/2 max-w-md animate-pulse rounded" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
```

### 4.11 `app/error.tsx`

Client error boundary. On-brand, single CTA back to home, optional "try again".

```tsx
// app/error.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with real telemetry hook (Sentry / Vercel) in Phase 6.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <p className="text-mauve text-[11px] font-medium tracking-[0.16em] uppercase">
        Something went sideways
      </p>
      <h1 className="font-display text-ink mt-4 text-[clamp(40px,6vw,96px)] leading-[0.95] font-medium tracking-tight">
        A small interruption.
      </h1>
      <p className="text-ink-soft mt-6 max-w-xl text-base">
        The page hit an unexpected error. We've logged it. You can try again, or head back to the
        home page.
      </p>
      <div className="mt-10 flex items-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="bg-ink text-cream hover:bg-mauve-deep rounded-full px-5 py-2.5 text-sm font-medium transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-mauve text-sm tracking-wide underline-offset-4 hover:underline"
        >
          Return home →
        </Link>
      </div>
      {error.digest ? (
        <p className="text-ink-soft/60 mt-12 text-xs">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      ) : null}
    </section>
  );
}
```

### 4.12 `app/not-found.tsx` (bonus, ships free with this phase)

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-[88rem] flex-col items-start justify-center px-6 lg:px-10">
      <p className="text-mauve text-[11px] font-medium tracking-[0.16em] uppercase">404</p>
      <h1 className="font-display text-ink mt-4 text-[clamp(40px,6vw,96px)] leading-[0.95] font-medium tracking-tight">
        Not on the menu.
      </h1>
      <p className="text-ink-soft mt-6 max-w-xl text-base">
        That page doesn't exist — or moved when we rebuilt the site. Try the navigation, or start at
        the beginning.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="bg-ink text-cream hover:bg-mauve-deep rounded-full px-5 py-2.5 text-sm font-medium transition"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
```

### 4.13 `public/wordmark.svg`

Generated by optimizing the existing WP-era logo. Build step in §5.7.

### 4.14 `components/ui/sheet.tsx`

Already present from shadcn install in Phase 1. If absent, run `pnpm dlx shadcn@latest add sheet` before starting.

## 5. Step-by-step tasks (executable verbatim)

Run from the repo root unless noted. Each step is independent enough to commit individually if desired.

### 5.1 Install dependencies

```bash
pnpm add motion@^11 lucide-react clsx tailwind-merge
pnpm add -D svgo
pnpm dlx shadcn@latest add sheet     # only if Phase 1 didn't add it
```

### 5.2 Author the source-of-truth file

```bash
mkdir -p content
$EDITOR content/site.ts          # paste §4.1
```

### 5.3 Build the layout components

```bash
mkdir -p components/layout
$EDITOR components/layout/nav.tsx       # paste §4.3
$EDITOR components/layout/footer.tsx    # paste §4.4
```

### 5.4 Wire the root layout and minor app files

```bash
$EDITOR app/layout.tsx                  # paste §4.2 (overwrite the scaffold version)
$EDITOR app/loading.tsx                 # paste §4.10
$EDITOR app/error.tsx                   # paste §4.11
$EDITOR app/not-found.tsx               # paste §4.12
mkdir -p app/api/newsletter
$EDITOR app/api/newsletter/route.ts     # paste §4.5
```

### 5.5 Add redirects, robots, sitemap

```bash
$EDITOR next.config.js          # paste §4.7 (replace scaffold's empty config)
$EDITOR app/robots.ts           # paste §4.8
$EDITOR app/sitemap.ts          # paste §4.9
```

### 5.6 Add `lib/utils.ts` if missing

```bash
mkdir -p lib
test -f lib/utils.ts || $EDITOR lib/utils.ts    # paste §4.6
```

### 5.7 Generate the optimized wordmark SVG

The source lives outside the repo at `/home/duh/Documents/website backup (1)/uploads/2024/06/Artboard-4.svg`. Copy it in, then optimize.

```bash
mkdir -p public
cp "/home/duh/Documents/website backup (1)/uploads/2024/06/Artboard-4.svg" public/wordmark.svg
pnpm exec svgo public/wordmark.svg \
  --multipass \
  --pretty=false \
  --config='{"plugins":[{"name":"preset-default","params":{"overrides":{"removeViewBox":false,"cleanupIds":{"minify":true}}}},"removeDimensions","removeMetadata","removeTitle","removeDesc","removeComments"]}'
```

After SVGO, hand-verify the file:

```bash
head -c 200 public/wordmark.svg ; echo
# Expect: <svg ... viewBox="..."> with no <metadata>, no <title>, no inline width/height.
```

If the source SVG has `fill="#000"` or a hard-coded color we want to inherit from CSS, run a one-liner to switch the primary fill to `currentColor` so the wordmark can be themed by parent `text-ink` later:

```bash
sed -i 's/fill="#1a1a1a"/fill="currentColor"/Ig; s/fill="#000000"/fill="currentColor"/Ig; s/fill="#000"/fill="currentColor"/Ig' public/wordmark.svg
```

(Leave this commented out if the wordmark intentionally uses a brand color; verify visually at `/` after `pnpm dev`.)

### 5.8 Confirm font wiring

`app/fonts.ts` from Phase 1 must export `inter` and `epilogue` `next/font` instances with `variable: '--font-inter'` and `variable: '--font-epilogue'`. If Phase 1 used different variable names, update the className concat in §4.2 to match.

```bash
grep -E "variable:" app/fonts.ts
```

### 5.9 Typecheck, lint, build

```bash
pnpm typecheck         # tsc --noEmit
pnpm lint
pnpm build
```

Build must complete with zero errors and zero warnings.

### 5.10 Manual verification (dev server)

```bash
pnpm dev
```

Then walk through the checklist in §6.

### 5.11 Commit

```bash
git add -A
git commit -m "phase 2: layout shell — nav, footer, redirects, robots, sitemap, wordmark"
```

## 6. Acceptance criteria

A reviewer can mechanically verify each:

1. **Old URL parity** — `curl -sI http://localhost:3000/about-me` returns `308` with `location: /about`. Repeat for all 18 entries in §4.7. Every old WP URL hits a 308 to its new path. A single shell loop is sufficient:
   ```bash
   for src in /about-me /contact-me /diet-plannig-program /coaching-program /conultation-call /hormonal-health /weight-management /shop /shop/diabetes-essentials /shop/pcos-guidebook /shop/skin-secrets /cart /checkout /my-account /refund_returns /privacy-policy /terms-and-conditions /shop/; do
     printf '%-35s -> ' "$src"
     curl -sI "http://localhost:3000$src" | awk 'tolower($1)=="location:" || /^HTTP/{print}' | tr '\n' ' '
     echo
   done
   ```
   Every line must show `308` and a `location:` matching the destination column.
2. **Nav condenses on scroll past 64 px** — open `/`, open DevTools, scroll past 64 px. The header's `data-condensed` attribute flips to `"true"`, vertical padding shrinks (22 → 10), and a 10 px backdrop blur with translucent cream applies. Scrolling back above 64 px reverses the state.
3. **Active route underline** — visit `/about`. The "About" link in the desktop nav has a full-width mauve underline (`scale-x-100`). Visit `/focus/weight-management` — the "Focus" link is underlined (the section grouping in `isActiveSection` covers the namespace).
4. **Mobile sheet** — at viewport ≤ 768 px, the hamburger button is visible, links are not. Clicking opens a right-aligned sheet whose entries are Epilogue 24 px. Selecting a link closes the sheet (the `useEffect` on pathname does this) and navigates.
5. **Footer copy correctness** — tagline reads exactly "Nourishing You Inside Out For Healthy You Throughout" rendered in `font-display` (Epilogue) at the 32 px breakpoint on `md+`. Four columns are present: Practice / Programs / Resources / Legal. Newsletter form has a single email input, posts to `/api/newsletter`, and the placeholder route returns a 202.
6. **Social icons** — IG, mail, WhatsApp icons in the footer bottom row. Each link has a non-empty `aria-label`. WhatsApp `href` is `https://wa.me/<digits-only>` derived from `site.contact.whatsapp`.
7. **`robots.txt`** — `curl -s http://localhost:3000/robots.txt`. In dev (`VERCEL_ENV` unset) it disallows everything; on a production deploy it allows `/` and lists the sitemap.
8. **`sitemap.xml`** — `curl -s http://localhost:3000/sitemap.xml | grep -c '<url>'` returns at least 17 (the static route count). When `content/journal/*.mdx` exists, the count grows by one per file.
9. **Skip link** — Tab from a fresh page load. The first focusable element is the "Skip to content" link, becomes visible on focus, jumps focus to `<main id="main">` on activation.
10. **Wordmark** — `public/wordmark.svg` exists, is < 4 KB after SVGO, has no `<title>`, `<desc>`, or `<metadata>` children, retains its `viewBox`, renders crisp at 28 px height in the nav.
11. **Layout metadata** — view source on `/`. `<html lang="en">` is present. `<body>` carries the classes `bg-cream text-ink-soft font-sans antialiased`. `<meta name="theme-color">` resolves to `#F4F0EE`. `<meta name="viewport">` includes `width=device-width, initial-scale=1, viewport-fit=cover`. `<meta property="og:site_name">` equals "Healthy You By Ruhma". A `<meta name="twitter:card" content="summary_large_image">` is present.
12. **Loading state** — block the network in DevTools and navigate to a non-trivial route; the editorial skeleton (`app/loading.tsx`) renders with the pulse animation and an SR-only "Loading…".
13. **Error state** — temporarily throw inside a server component and reload; `app/error.tsx` shows the editorial error page with a working "Try again" button and "Return home" link.
14. **404** — visit `/this-route-does-not-exist`; `app/not-found.tsx` renders with the on-brand "Not on the menu." treatment.
15. **Reduced motion** — set OS-level reduced-motion preference. The Nav still condenses (the change is layout, not pure animation), but the duration shortens or completes synchronously without distracting transitions. (Motion v11 respects `prefers-reduced-motion` by default; verify no janky spring is left running.)
16. **Build green** — `pnpm typecheck && pnpm lint && pnpm build` exits 0 with no warnings.
17. **Single source of truth** — `grep -RIn "Programs" components/layout` finds zero hard-coded nav labels in `nav.tsx`/`footer.tsx`. All labels and hrefs come from `content/site.ts`.

## 7. Out of scope

Explicitly NOT done in this phase. Other plan files cover them:

- **Per-page metadata** (titles, descriptions, OG images) — plan 13 (SEO).
- **Dynamic OG image generation** via `@vercel/og` — plan 13.
- **Real content** (page copy, MDX) — plans 4–9.
- **Real newsletter integration** (Buttondown / Resend Audiences) — plan 14 (forms / integrations).
- **Real contact form server action** wiring to Resend — plan 14.
- **Booking widget** for `/programs/consultation` — plan 7.
- **Botanical SVG illustration set** — Phase 1 (already done) or Phase 6 polish.
- **Motion primitives** `<FadeUp>`, `<ImageReveal>`, `<LetterStagger>` — Phase 1.
- **Image/media migration** from `/uploads/` (320 MB → ~25 MB optimized) — plan 12 (media pipeline).
- **JSON-LD / schema-dts** structured data — plan 13.
- **Analytics** (Vercel + Plausible) — plan 15 (deploy / cutover).
- **Dark mode** — explicitly not a goal of the redesign; light only.
- **i18n / RTL** — out of scope for v1.
- **A11y auditing pass** with axe-core — Phase 6 polish (this phase delivers the structural primitives that pass will lean on).
