// lib/library-data.ts
//
// Helpers and shared data for the Library section. Phase 09.
//
// Contains:
//  - formatPKR()              — comma-thousands rendering
//  - computeSavings()         — sale-price → "Save PKR X (Y%)" chip
//  - derivePlatformLabel()    — buy URL host → "Buy on Gumroad" label
//  - isPlaceholderBuyUrl()    — detects placeholder URLs so the Buy CTA can
//                               render as a disabled-style "Coming soon"
//                               instead of pointing at example.com
//  - LIBRARY_FAQ              — shared FAQ items rendered on every detail page
//  - AUTHOR_BIO               — 2-paragraph excerpt for the AuthorCard

export function formatPKR(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function computeSavings(args: {
  price: number;
  salePrice?: number;
}): { saved: number; pct: number; label: string } | null {
  if (!args.salePrice || args.salePrice >= args.price) return null;
  const saved = args.price - args.salePrice;
  const pct = Math.round((saved / args.price) * 100);
  return { saved, pct, label: `Save ${formatPKR(saved)} (${pct}%)` };
}

const PLATFORM_LABELS: Record<string, string> = {
  "wa.me": "WhatsApp",
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
    if (PLATFORM_LABELS[host]) return `Buy on ${PLATFORM_LABELS[host]}`;
    for (const known of Object.keys(PLATFORM_LABELS)) {
      if (host.endsWith(known)) return `Buy on ${PLATFORM_LABELS[known]}`;
    }
    return "Buy now";
  } catch {
    return "Buy now";
  }
}

/**
 * Returns true when buyUrl is a known-placeholder value. Per Phase 03 the
 * three MDX files ship with `https://example.com/buy/<slug>` until Dr. Ruhma
 * provides real publisher URLs. We render "Coming soon" UI for placeholders
 * rather than letting users click through to a dead link.
 */
export function isPlaceholderBuyUrl(buyUrl: string): boolean {
  if (!buyUrl) return true;
  const trimmed = buyUrl.trim();
  if (
    trimmed === "" ||
    trimmed === "#" ||
    trimmed === "TODO_FILL_LATER" ||
    trimmed.toUpperCase().includes("TODO")
  ) {
    return true;
  }
  try {
    const host = new URL(trimmed).hostname.replace(/^www\./, "");
    return host === "example.com" || host.endsWith(".example.com");
  } catch {
    return true;
  }
}

export type LibraryFaqItem = { q: string; a: string };

export const LIBRARY_FAQ: readonly LibraryFaqItem[] = [
  {
    q: "How will I receive the ebook?",
    a: "Once your purchase clears on the publisher's site, the PDF lands in your inbox within minutes. There's nothing to install — open it on a phone, tablet, or laptop and read at your own pace.",
  },
  {
    q: "What format is it in?",
    a: "A clean, designed PDF. Around sixty pages, optimised for reading on a screen but laid out so it prints to A4 if you prefer paper.",
  },
  {
    q: "Can I get a refund?",
    a: "Refund policy is set by the publisher you buy from and detailed at checkout. Because the ebook is delivered immediately and read-once, refunds are usually limited — please check before you pay.",
  },
  {
    q: "Is this suitable for my condition?",
    a: "The guidebooks are educational, not prescriptive. They are written to sit alongside, not replace, the care of your doctor or dietitian. If you're managing a specific condition and want a plan tailored to your blood work and routine, a 1:1 consultation is the right next step.",
  },
  {
    q: "Do you offer 1:1 follow-up after I read it?",
    a: "Yes. A consultation call with Dr. Ruhma is the most common follow-up — bring the chapters you have questions on and we'll build a plan from there. The Coaching Program is the right next step when you want a longer partnership.",
  },
] as const;

/**
 * Two-paragraph excerpt from `content/about.mdx`, condensed for the
 * AuthorCard on each detail page. Kept here (rather than parsed at render
 * time) so the bio voice stays consistent across all three ebooks without
 * coupling the Library section to about-page edits.
 */
export const AUTHOR_BIO: readonly string[] = [
  "Dr. Ruhma is a clinical dietitian based in Faisalabad, working with women across Pakistan and the diaspora on hormonal health, PCOS, gut health, and weight management. Her practice began with a question that wouldn't leave her — could the food on a plate be a precise enough lever to change how a body behaves? Five hundred clients later, the answer is a quiet, evidence-backed yes.",
  "Her writing is the distilled version of conversations she's had with hundreds of clients. No fad diets, no shaming, no fast-fixes — just practical, regionally-relevant guidance for women who want answers, not another set of rules. Each guidebook in the Library is built the same way she builds her plans: clinical at the core, kind in the delivery, and designed for the kitchens her readers actually cook in.",
] as const;

export const AUTHOR_PORTRAIT = {
  src: "/media/about/portrait-secondary-800.webp",
  alt: "Dr. Ruhma, clinical dietitian, on a consultation call.",
} as const;
