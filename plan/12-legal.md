# 12 — Legal Pages (`/legal/privacy`, `/legal/terms`, `/legal/refunds`)

> Plan #12 of 15. Implements the three legal pages per master §3.13.
> These are the simplest pages on the site: plain typographic, no images,
> no JSON-LD, no motion, no marketing flourishes. The bar is "looks like
> a well-set book page, loads instantly, is easy to amend."

---

## 1. Goal

Ship `/legal/privacy`, `/legal/terms`, `/legal/refunds` as a single dynamic
route (`app/legal/[slug]/page.tsx`) backed by three MDX files
(`content/legal/{privacy,terms,refunds}.mdx`).

Constraints from master §3.13:
- Inter 17px body, 1.6 line-height, max-width **720px**, single column.
- Eyebrow ("Legal") + title (Display style) + last-updated caption + body.
- No images, no botanical SVGs, no pull quotes, no motion.
- Last-updated date in caption style ("Caption" — Inter 13px, 0.04em tracking,
  per master typography table).

Functional requirements:
- Each page statically generated at build via `generateStaticParams`.
- Reuses the `<Prose>` typographic wrapper defined in plan 08 (Focus pages)
  — no duplicate body styling.
- Per-page `<title>` and meta description; pages are **indexable** (no
  `noindex`) — legal pages are trust signals and should appear in branded
  search results.
- No JSON-LD (Article/LegalNotice schema is unnecessary noise here).
- The old WP slug `/refund_returns` redirects to `/legal/refunds` per
  master §6 — that's plan 02's responsibility, not this one.

Non-goals (stated explicitly in §7): cookie banner, GDPR consent flows,
DPA inventory, audit-log of edits.

---

## 2. Pre-requisites

Must be merged before this plan runs:

| # | Plan | Why we need it |
|---|---|---|
| 01 | `01-design-system.md` | Tokens (`--cream`, `--ink`, `--ink-soft`, `--mauve`), Inter via `next/font`, Eyebrow primitive, type scale (Display, Caption). |
| 02 | `02-layout-shell.md` | `app/layout.tsx`, Nav, Footer (legal links target `/legal/*` from the footer's "Legal" column), 301 redirect `/refund_returns → /legal/refunds`, `/privacy-policy → /legal/privacy`, `/terms-and-conditions → /legal/terms`. |
| 03 | `03-content-media-migration.md` | The MDX loader pipeline (`next-mdx-remote` v5 + `gray-matter`), the `content/` directory convention, the helper that reads frontmatter + compiles MDX. |
| 08 | `08-focus.md` | Defines `<Prose>` — the typographic body wrapper (handles `h2/h3/p/ul/ol/blockquote` rhythm at 17px Inter, max-w 720px). We **import**, not redefine. |

If 08 is not yet merged when this plan executes, fall back to inlining a
minimal Prose shim here — but note that as tech debt and unify on first
follow-up. Don't fork the styling.

---

## 3. Dependencies

None beyond what plans 01–08 already pull in. No new npm packages.

---

## 4. Files to create / modify

### Created

```
app/legal/[slug]/page.tsx
components/marketing/legal/LegalPage.tsx
content/legal/privacy.mdx
content/legal/terms.mdx
content/legal/refunds.mdx
```

### Modified

- `app/sitemap.ts` — append `/legal/privacy`, `/legal/terms`, `/legal/refunds`
  to the static URL list (priority 0.3, changefreq `yearly`). Owned by
  plan 02 / sitemap helper but this plan adds the entries.
- `components/layout/Footer.tsx` — verify the "Legal" column links resolve.
  Owned by plan 02; if the column is already wired to `/legal/*`, no change.

### Concrete code

#### `components/marketing/legal/LegalPage.tsx`

```tsx
import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Prose } from "@/components/marketing/focus/Prose"; // from plan 08

type LegalPageProps = {
  title: string;
  lastUpdated: string; // ISO 8601, e.g. "2025-11-04"
  children: ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  const formatted = dateFormatter.format(new Date(lastUpdated));

  return (
    <article className="bg-cream text-ink-soft">
      <header className="mx-auto max-w-[720px] px-6 pt-24 pb-10 md:pt-32">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display mt-6 text-[clamp(40px,6vw,96px)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h1>
        <p className="mt-6 text-[13px] tracking-[0.04em] text-ink-soft/70">
          Last updated <time dateTime={lastUpdated}>{formatted}</time>
        </p>
      </header>

      <div className="mx-auto max-w-[720px] px-6 pb-32">
        <Prose>{children}</Prose>
      </div>
    </article>
  );
}
```

Notes:
- No motion components. These pages render statically and are fully visible
  on first paint.
- Date formatter uses `en-GB` so the format reads "4 November 2025" — fits
  the editorial tone better than "November 4, 2025" and matches Pakistani
  English convention.
- The `<time>` element is semantic; the human-readable string is the visible
  text, the machine-readable `datetime` is the ISO frontmatter value.

#### `app/legal/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { LegalPage } from "@/components/marketing/legal/LegalPage";
import { mdxComponents } from "@/lib/mdx-components"; // from plan 03

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

type Frontmatter = {
  title: string;
  slug: string;
  lastUpdated: string; // ISO date
  description?: string;
};

const VALID_SLUGS = ["privacy", "terms", "refunds"] as const;
type LegalSlug = (typeof VALID_SLUGS)[number];

async function loadLegal(slug: string) {
  if (!VALID_SLUGS.includes(slug as LegalSlug)) return null;
  const file = path.join(LEGAL_DIR, `${slug}.mdx`);
  const raw = await fs.readFile(file, "utf8");
  const { data, content } = matter(raw);
  return { frontmatter: data as Frontmatter, source: content };
}

export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadLegal(slug);
  if (!data) return {};
  const { title, description } = data.frontmatter;
  const fallback = `${title} for Healthy You By Ruhma — clinical dietetics practice based in Lahore.`;
  return {
    title,
    description: description ?? fallback,
    // Indexable — do NOT add robots: { index: false }.
    openGraph: { title, description: description ?? fallback, type: "article" },
  };
}

export default async function LegalRoute(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await loadLegal(slug);
  if (!data) notFound();

  const { content } = await compileMDX({
    source: data.source,
    components: mdxComponents,
    options: { parseFrontmatter: false },
  });

  return (
    <LegalPage
      title={data.frontmatter.title}
      lastUpdated={data.frontmatter.lastUpdated}
    >
      {content}
    </LegalPage>
  );
}

export const dynamicParams = false;
```

Notes:
- `dynamicParams = false` → unknown slugs 404 at build, not at request time.
- `generateMetadata` signature uses the Next 15 Promise-based params API.
- `mdxComponents` is the shared map from plan 03 (typed `h2`, `ul`, etc.,
  to consistent rhythm). We do not introduce legal-specific MDX components.

#### `content/legal/privacy.mdx` (skeleton)

```mdx
---
title: Privacy Policy
slug: privacy
lastUpdated: "2025-11-04"
description: How Healthy You By Ruhma collects, uses, and safeguards your personal information.
---

## Who we are

Healthy You By Ruhma (operated by Dr. Ruhma) is a clinical dietetics practice
based in Lahore, Pakistan. This policy describes what information we collect
when you use this website or our services, how we use it, and your rights.

## What we collect

…  {/* Body migrated from WP page id 1156. See §5 "extract content" below. */}

## How we use your information

…

## Sharing

…

## Your rights

…

## Contact

If you have questions about this policy, email
[hello@dietitianruhma.com](mailto:hello@dietitianruhma.com).
```

#### `content/legal/terms.mdx` (skeleton)

```mdx
---
title: Terms of Service
slug: terms
lastUpdated: "2025-11-04"
description: The terms governing your use of the Healthy You By Ruhma website and services.
---

## Acceptance of terms

…  {/* Body migrated from WP page id 1409. */}

## Services

…

## Intellectual property

…

## Disclaimer

The content on this site is for informational purposes only and is not a
substitute for personalised medical or nutritional advice from a qualified
clinician. Always consult your healthcare provider for diagnosis and
treatment.

## Limitation of liability

…

## Changes to these terms

…
```

#### `content/legal/refunds.mdx` (skeleton)

```mdx
---
title: Refund Policy
slug: refunds
lastUpdated: "2025-11-04"
description: Refund and cancellation terms for Healthy You By Ruhma programmes and digital guidebooks.
---

## Programmes and consultations

…  {/* Body migrated from WP page id 938. */}

## Digital guidebooks

Our guidebooks are sold through external platforms (such as Gumroad). Refunds
for digital guidebook purchases are governed by the platform's own refund
policy at the time of purchase — please refer to your order receipt for the
applicable terms.

## Contact

…
```

---

## 5. Step-by-step tasks

Order matters; check the box at the end of each step.

### 5.1 Extract source copy from the running WP container

Prerequisite: the local Docker stack from `_local/` is up
(`sudo docker compose up -d` from `/home/duh/Documents/website backup (1)/_local/`).

Run from the host (output is HTML — convert to MDX in step 5.2):

```bash
mkdir -p /tmp/legal-extract

sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
  wp --path=/var/www/html post get 1156 --field=post_content \
  > /tmp/legal-extract/privacy.html

sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
  wp --path=/var/www/html post get 1409 --field=post_content \
  > /tmp/legal-extract/terms.html

sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
  wp --path=/var/www/html post get 938 --field=post_content \
  > /tmp/legal-extract/refunds.html
```

Also capture the post titles and slugs as a sanity check:

```bash
for id in 1156 1409 938; do
  sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post get $id \
    --fields=ID,post_title,post_name,post_modified
done
```

The expected slugs from the WP site are:
- 1156 → `privacy-policy`
- 1409 → `terms-and-conditions`
- 938 → `refund_returns`  ← this is the underscore-form that 301s to `/legal/refunds` per master §6.

### 5.2 Convert HTML → MDX manually

Elementor pages are wrapped in nested `<div data-elementor-…>` shortcodes.
The plain prose lives inside `<p>`, `<h2>`, `<h3>`, `<ul>`, `<ol>` tags
embedded in those shells. For each file:

1. Open in an editor; strip every Elementor wrapper and shortcode (anything
   starting with `[elementor-` or `[/vc_…]`).
2. Convert headings: keep H2/H3 as `##` / `###`. Demote any H1 in the body
   to `##` — the page H1 is the page title, owned by `LegalPage`.
3. Convert `<p>` → blank-line-separated paragraphs.
4. Convert `<ul>/<li>` → `- item` lists. Same for `<ol>` → `1. item`.
5. Inline links → `[text](url)`. Strip `target="_blank"` etc. — let MDX
   defaults take over (plan 03's `mdxComponents` should handle external
   link styling globally).
6. Strip any inline `style=""`, `class=""`, `<span>`, `<font>` — Elementor
   inserts these; we want clean Markdown.
7. Drop any "Powered by …", "Last updated 2021/04/14" footer lines from
   the WP body — `lastUpdated` lives in frontmatter now.
8. Save into the corresponding `content/legal/*.mdx` skeleton above,
   replacing the `…` placeholders.

### 5.3 Manual cleanup pass — flag stale clauses

While converting, **flag any of the following inline as `{/* TODO: review */}`
MDX comments** (do not delete; legal copy needs human sign-off):

- **PKR-only payment language**. The new site has no on-site checkout
  (master §7.1) — guidebooks link out to Gumroad / Lemon Squeezy / Amazon
  KDP. Any clause that says "we accept PKR via PayFast / bank transfer /
  Easypaisa for ebook orders" is now incorrect for ebooks. Flag it. The
  new accurate framing is in `refunds.mdx` skeleton above ("guidebooks are
  sold through external platforms… refunds governed by the platform").
- **References to a cart, checkout, or my-account page**. These pages no
  longer exist on the new site (master §6 redirects them all to `/library`).
- **References to WooCommerce / WordPress** as the platform, or to specific
  plugins (CartFlows, MailPoet) — drop or generalise.
- **References to a physical office address** unless Dr. Ruhma confirms one.
  The current WP copy may have placeholder addresses.
- **GDPR-specific clauses** (right to erasure, DPO contact, EU representative)
  — Pakistan-based practice; these are aspirational unless real EU users
  are targeted. Flag for review, don't auto-delete.
- **References to PECA / Pakistan Electronic Crimes Act** — keep if present
  and accurate.
- **"Last updated 2021"** lines in the body — supersede with `lastUpdated`
  frontmatter set to today's date *only if* a substantive review actually
  happened. Otherwise, keep the original year as the frontmatter value
  honestly.

### 5.4 Add a top-level TODO for legal review (non-blocking)

Append to `MIGRATION_NOTES.md` (the file owned by plan 03):

> **TODO (pre-launch, non-blocking for build):** Have Dr. Ruhma's lawyer or
> a Pakistan-licensed legal reviewer read the three `content/legal/*.mdx`
> files end-to-end before DNS cutover. Specifically: confirm the practice
> is correctly identified, refund window is accurate, "external platform"
> framing for guidebooks is acceptable, and the disclaimer about medical
> advice is sufficient. Update `lastUpdated` on the day of review.

This is a **TODO**, not a blocker for the build phase — the pages can ship
with the migrated copy and be amended via PR thereafter.

### 5.5 Wire the route + component

Implement `LegalPage.tsx` and `app/legal/[slug]/page.tsx` exactly as
specified in §4. Verify import paths against the actual `tsconfig.json`
path aliases set in plan 00 (likely `@/components/...`).

### 5.6 Smoke-test locally

```bash
pnpm dev
# visit /legal/privacy, /legal/terms, /legal/refunds
# visit /legal/foo → expect 404
```

Then production build:

```bash
pnpm build
# confirm three pages appear in the build output as ●  (SSG)
pnpm start
```

### 5.7 Verify redirects (owned by plan 02 but check here)

`/privacy-policy`, `/terms-and-conditions`, `/refund_returns` should each
return HTTP 301 to the corresponding `/legal/*` URL. Test with:

```bash
curl -sI http://localhost:3000/refund_returns | head -3
# expect HTTP/1.1 301 + Location: /legal/refunds
```

If any of these are missing, file an issue against plan 02 — do not
shadow-fix in this plan's scope.

### 5.8 Sitemap entry

In `app/sitemap.ts` (owned by plan 02), confirm the static URL list
includes:

```ts
{ url: `${siteUrl}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
{ url: `${siteUrl}/legal/terms`,   changeFrequency: "yearly", priority: 0.3 },
{ url: `${siteUrl}/legal/refunds`, changeFrequency: "yearly", priority: 0.3 },
```

Low priority is intentional — these aren't pages we want competing with
homepage / programs in search ranking.

---

## 6. Acceptance criteria

A reviewer signs this off when **all** of these hold:

1. **Routes resolve.** `GET /legal/privacy`, `/legal/terms`, `/legal/refunds`
   return 200 with the migrated content rendered.
2. **Static generation.** `pnpm build` output marks all three as
   pre-rendered (●), with `dynamicParams: false` enforced — `/legal/foo`
   returns 404.
3. **Typographic spec.** Body is Inter 17px / 1.6, max-width 720px, single
   column. Title is Display style (Epilogue, clamp scale per master §1).
   Eyebrow reads "Legal" in the spec'd style. Last-updated line uses
   Caption style and renders as e.g. "Last updated 4 November 2025".
4. **Semantic HTML.** Each page has exactly one `<h1>` (the title). The
   last-updated line uses `<time datetime="…">`. Body headings demote
   correctly to `<h2>` / `<h3>`. No `<div>` soup.
5. **Indexable.** No `noindex`. No `<meta name="robots" content="noindex">`.
   Each page has a unique `<title>` and a non-empty meta description.
6. **No images, no motion, no JSON-LD** rendered on these pages (verify
   with view-source).
7. **Accessibility.** axe-core finds 0 violations. Keyboard tab order:
   nav → main heading skip target → in-body links → footer. Color contrast
   ≥ AA for body text (`--ink-soft` on `--cream` — confirmed in plan 01).
8. **Frontmatter contract.** Every MDX file has `title`, `slug`, `lastUpdated`
   (ISO date) at minimum. Adding a TS type guard in `loadLegal` is fine
   but not required.
9. **Reused `<Prose>`.** No inline body typography styling in `LegalPage.tsx`
   beyond the wrapper container; everything inside `<Prose>` inherits from
   plan 08.
10. **Stale-clause flags.** A grep for `TODO: review` inside `content/legal/`
    surfaces the items flagged in §5.3 (or returns nothing if the migration
    pass found no stale clauses, which is unlikely).
11. **Lighthouse.** ≥ 95 across the board on each legal page (these are
    the easiest pages on the site to hit this on; if any score lower,
    something is wrong upstream).

---

## 7. Out of scope (explicit non-goals)

The following are **deliberately not included** in this plan and should
not be added during build without a separate decision:

- **Cookie / privacy consent banner.** Not needed: master §4 specifies
  Plausible Cloud (cookieless) for analytics + Vercel Analytics
  (first-party, no cross-site tracking). The contact form (plan 13) has
  its own inline privacy notice. No third-party cookies are set, so no
  ePrivacy / GDPR cookie banner is legally required for this site
  configuration. **If Dr. Ruhma later adds Meta Pixel, GA4, or any
  marketing pixel, this decision must be revisited** — flag in
  `MIGRATION_NOTES.md`.
- **GDPR-specific consent flows** (right-to-erasure form, data-portability
  download, DPO contact card). The practice is Pakistan-based with no
  active EU customer base; current legal posture is "respect requests on
  receipt by email," documented in the privacy text itself.
- **Audit log of legal-text edits.** Git history is the audit log. No
  separate changelog component on the page.
- **Versioned legal pages** (e.g., `/legal/privacy/v2`). If Dr. Ruhma
  needs to retain superseded versions for active customers, that becomes
  a separate plan; for now the latest version is the only version.
- **JSON-LD `LegalDocument` / `WebPage` schema.** Skipped intentionally —
  legal pages don't benefit from rich-result schema and noise in the
  schema graph hurts more than it helps.
- **Multi-language versions** (Urdu translations). Not currently planned.
- **Auto-generated "Effective from" + "Supersedes" headers.** The
  single-line "Last updated" satisfies §3.13's spec; richer versioning is
  YAGNI.

---

## 8. Estimated effort

| Task | Time |
|---|---|
| Extract HTML from WP container (5.1) | 10 min |
| Manual MDX cleanup × 3 files (5.2–5.3) | 60–90 min |
| Component + route implementation (5.5) | 30 min |
| Smoke test + sitemap + redirect check (5.6–5.8) | 20 min |
| **Total** | **~2–3 hours** |

This is the smallest of the per-page plans by design. The bulk of the
real-world time will be the eventual legal-review TODO (§5.4), which is
out-of-band and not on the build critical path.
