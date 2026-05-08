# 03 — Content & Media Migration

> One-time bulk migration of WordPress content + uploads into the new repo's
> MDX content tree and optimized public media tree. Runs once, after the
> design system exists, before any page composition begins. Everything in
> plans 04–12 (page builds) assumes this plan has run to completion.

---

## 1. Goal

Convert the existing dietitianruhma.com WordPress site into the
`healthy-you-by-ruhma` Next.js repo as:

1. **Content** — 13 MDX files under `content/` (3 programs, 2 focus areas,
   3 library entries, 3 legal, 1 journal placeholder, 1 about long-form
   excerpt) plus a `content/site.ts` for global copy. The Home, Services,
   and Contact pages do **not** get MDX files — their copy lives directly
   in the page components in `app/`. About is a hybrid: the long-form
   bio paragraphs are imported from `content/about.mdx` for editorial
   ergonomics; the rest is in `app/about/page.tsx`.
2. **Media** — ~80–120 hand-curated source images converted to AVIF +
   WEBP at five sizes each, written under `public/media/<category>/` and
   served via `next/image`. The original 1,555 / 320 MB upload tree is
   discarded after migration. Final asset weight target: ≤ 35 MB.
3. **Wordmark** — a single optimized SVG at `public/wordmark.svg`,
   shared with plan 02 (design system) which renders it in `<Nav />`.
4. **Frontmatter contract** — TypeScript-validated with `zod` so any
   missing/typoed key blocks `pnpm build`.
5. **Verification** — `pnpm content:check` passes: every MDX has the
   required frontmatter for its content type, and every image referenced
   from MDX exists on disk under `public/media/`.

The deliverable is a green `content:check` run plus a `MIGRATION_NOTES.md`
documenting any sections from the old site that were intentionally dropped
(per master §9 verification criteria).

---

## 2. Pre-requisites

| Plan                                        | Why it must run first                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `00-setup`                                  | We need pnpm, the Next.js scaffold, `tsx`, and `package.json`/`tsconfig.json` to add scripts and install deps.                                                                                                                                                                                                                                                                                                      |
| `01-design-system` (soft dep, not blocking) | The MDX files import design-system MDX components (`<PullQuote />`, `<NumberedList />`, `<SampleWeekCard />`, `<Eyebrow />`, …). If 01 is not yet done, the MDX files can be authored against the eventual component names — they don't _render_ until pages are built (plans 04–12), so the import paths can be stubbed (`// @ts-expect-error pending plan 01`) and resolved later. Recommended order: 01 then 03. |

The local WordPress stack must be running (per `CLAUDE.md`):

```
cd "/home/duh/Documents/website backup (1)/_local"
sudo docker compose up -d
```

This plan reads `post_content` from that container; it does not write
back to it.

---

## 3. Dependencies

Add to `package.json` `devDependencies`:

| Package       | Version | Why                                                                    |
| ------------- | ------- | ---------------------------------------------------------------------- |
| `sharp`       | ^0.33   | AVIF / WEBP encoding + resize for the media pipeline                   |
| `gray-matter` | ^4.0    | Frontmatter parsing in `content:check`                                 |
| `tsx`         | ^4.19   | Run `scripts/migrate-media.ts` and `scripts/check-content.ts` directly |
| `svgo`        | ^3.3    | Minify the wordmark SVG                                                |
| `zod`         | ^3.23   | Frontmatter schema validation in `lib/content/types.ts`                |
| `glob`        | ^10.4   | Walk MDX files in the check script                                     |

```bash
pnpm add -D sharp gray-matter tsx svgo zod glob
```

Add to `package.json` `scripts`:

```json
{
  "scripts": {
    "media:migrate": "tsx scripts/migrate-media.ts",
    "content:check": "tsx scripts/check-content.ts",
    "wordmark:optimize": "tsx scripts/optimize-wordmark.ts"
  }
}
```

---

## 4. Files to create / modify

### Created in this plan

```
scripts/
├── migrate-media.ts            # one-shot AVIF+WEBP pipeline (this plan owns it)
├── optimize-wordmark.ts        # one-shot svgo run on Artboard-4.svg
├── check-content.ts            # zero-arg validator, exits non-zero on failure
└── media-manifest.ts           # the explicit source→slug→category map (TS, not JSON)

lib/
└── content/
    ├── types.ts                # zod schemas for each content type
    ├── load.ts                 # cached MDX loader (used by page builds later)
    └── README.md               # 1-page how-to-edit-content guide

content/
├── site.ts                     # global site copy (nav labels, footer, meta)
├── about.mdx                   # long-form bio paragraphs (imported by /about)
├── programs/
│   ├── diet-planning.mdx
│   ├── coaching.mdx
│   └── consultation.mdx
├── focus/
│   ├── hormonal-health.mdx
│   └── weight-management.mdx
├── library/
│   ├── diabetes-essentials.mdx
│   ├── pcos-guidebook.mdx
│   └── skin-secrets.mdx
├── journal/
│   └── welcome.mdx             # placeholder, status: draft
└── legal/
    ├── privacy.mdx
    ├── terms.mdx
    └── refunds.mdx

public/
├── wordmark.svg                # output of optimize-wordmark.ts (shared with plan 02)
└── media/
    ├── home/
    ├── about/
    ├── programs/
    ├── focus/
    ├── library/
    └── journal/

raw-content/                    # gitignored scratch dir (see §5.1)
└── *.html                      # one HTML dump per WP page

MIGRATION_NOTES.md              # decisions log, dropped sections
```

### Modified in this plan

- `package.json` — add the deps + scripts above.
- `.gitignore` — add `raw-content/` (it's a scratchpad of WP HTML dumps,
  never committed).
- `next.config.js` — nothing here; redirects belong to plan 02 (layout
  shell). Mentioned only so the next agent doesn't double-do it.

---

## 5. Step-by-step tasks

### 5.1 Set up the scratch workspace

Create the gitignored `raw-content/` directory. This is where every
`wp post get` dump lands, gets cleaned up by hand, and then the polished
result is moved into `content/`. **Never commit `raw-content/`.**

```bash
mkdir -p raw-content
echo "raw-content/" >> .gitignore
```

### 5.2 Extract `post_content` for every relevant page

The master plan §10 documents the access pattern. Run this loop **once**.
Every page in the table below is captured (even if its target is "drop"
— we still want the dump in `raw-content/` as evidence we looked at it
before deciding to drop).

The full mapping table (16 pages — every page from the existing WP):

| WP ID | Old slug               | Old URL                 | Approx chars          | Target                                | New path                                                                                                                               |
| ----- | ---------------------- | ----------------------- | --------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 57    | `home`                 | `/`                     | ~6,000                | **inline**                            | `app/page.tsx` (no MDX, copy hard-coded into the section components since the home page is bespoke)                                    |
| 19    | `about-me`             | `/about-me`             | ~10,000               | **MDX** (long-form bio only) + inline | `content/about.mdx` (bio paragraphs) — surrounding chrome lives in `app/about/page.tsx`                                                |
| 23    | `services`             | `/services`             | ~3,500                | **inline**                            | `app/services/page.tsx` (FAQ + card descriptions hard-coded; the 3 cards reference the `programs/*.mdx` frontmatter for title + price) |
| 25    | `diet-plannig-program` | `/diet-plannig-program` | 19,637                | **MDX**                               | `content/programs/diet-planning.mdx` (note: typo `plannig`→`planning` fixed in slug + content)                                         |
| 27    | `coaching-program`     | `/coaching-program`     | ~23,000               | **MDX**                               | `content/programs/coaching.mdx`                                                                                                        |
| 29    | `conultation-call`     | `/conultation-call`     | ~4,500                | **MDX**                               | `content/programs/consultation.mdx` (typo `conultation`→`consultation`)                                                                |
| 31    | `hormonal-health`      | `/hormonal-health`      | ~12,000               | **MDX**                               | `content/focus/hormonal-health.mdx` (typo `harmone`→`hormone` throughout body)                                                         |
| 33    | `weight-management`    | `/weight-management`    | ~10,000               | **MDX**                               | `content/focus/weight-management.mdx`                                                                                                  |
| 35    | `shop`                 | `/shop`                 | WooCommerce shortcode | **inline**                            | `app/library/page.tsx` (the index reads the 3 `library/*.mdx` files; no MDX for the index itself)                                      |
| 37    | `cart`                 | `/cart`                 | shortcode             | **drop**                              | redirected → `/library`                                                                                                                |
| 39    | `checkout`             | `/checkout`             | shortcode             | **drop**                              | redirected → `/library`                                                                                                                |
| 41    | `my-account`           | `/my-account`           | shortcode             | **drop**                              | redirected → `/library`                                                                                                                |
| 43    | `contact-me`           | `/contact-me`           | ~2,000                | **inline**                            | `app/contact/page.tsx` (form + details hard-coded; FAQ inline)                                                                         |
| 45    | `refund_returns`       | `/refund_returns`       | ~3,500                | **MDX**                               | `content/legal/refunds.mdx`                                                                                                            |
| 47    | `privacy-policy`       | `/privacy-policy`       | ~6,000                | **MDX**                               | `content/legal/privacy.mdx`                                                                                                            |
| 49    | `terms-and-conditions` | `/terms-and-conditions` | ~7,500                | **MDX**                               | `content/legal/terms.mdx`                                                                                                              |

Plus the three WooCommerce **products** (which are WP `post_type=product`,
not pages — surface separately):

| Product ID                                   | Product slug          | Target                                    |
| -------------------------------------------- | --------------------- | ----------------------------------------- |
| (TBD via `wp post list --post_type=product`) | `diabetes-essentials` | `content/library/diabetes-essentials.mdx` |
| (TBD)                                        | `pcos-guidebook`      | `content/library/pcos-guidebook.mdx`      |
| (TBD)                                        | `skin-secrets`        | `content/library/skin-secrets.mdx`        |

> **IDs above are conventional placeholders** (the running site's actual
> auto-increment IDs may differ). Verify once at the start of the migration
> by running `wp post list --post_type=page --fields=ID,post_name --format=csv`
> and updating the table in `MIGRATION_NOTES.md` with the canonical IDs.
> If the **WP-CLI list disagrees with this table**, trust the CLI and
> patch the table — do not silently use stale numbers.

The dump loop (run from any host shell that has docker access):

```bash
mkdir -p raw-content
for id in 57 19 23 25 27 29 31 33 35 43 45 47 49; do
  slug=$(sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post get "$id" --field=post_name)
  sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post get "$id" --field=post_content \
    > "raw-content/${id}-${slug}.html"
  echo "wrote raw-content/${id}-${slug}.html"
done

# Products separately
for slug in diabetes-essentials pcos-guidebook skin-secrets; do
  pid=$(sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post list --post_type=product \
    --name="$slug" --field=ID --format=csv | tail -n +2)
  sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post get "$pid" --field=post_content \
    > "raw-content/product-${pid}-${slug}.html"
  # also dump the product's WooCommerce metadata (price, sale_price, etc.)
  sudo docker exec -u www-data dietitianruhma-local-wpcli-1 \
    wp --path=/var/www/html post meta list "$pid" --format=csv \
    > "raw-content/product-${pid}-${slug}.meta.csv"
done
```

After this loop you have ~16 HTML files in `raw-content/`, each one
Elementor-noisy but with the source-of-truth copy embedded.

### 5.3 HTML → MDX conversion strategy

Elementor's `post_content` is a tar pit of inline `<style>` blocks
(`.elementor-element-abcdef { … }` repeated thousands of times),
`data-elementor-*` attributes, and shortcodes (`[elementor-template id="…"]`,
`[woocommerce_cart]`, etc.). **No automated converter handles this well**
— attempts produce MDX that's still 80% noise. We do it by hand, once,
per page.

The fixed conversion pass per page:

1. Open `raw-content/<id>-<slug>.html` in the editor side-by-side with
   the rendered page at `http://localhost:8080/<slug>/`.
2. **Strip all** `<style>…</style>` blocks. Elementor inlines them; we
   reproduce style in Tailwind / design-system components.
3. **Strip all** `data-*`, `class="elementor-*"`, and `id="elementor-*"`
   attributes. They carry no semantics.
4. **Decode shortcodes manually**:
   - `[elementor-template id="…"]` — locate the template in WP admin,
     read what it renders, treat it as inline copy.
   - `[woocommerce_cart]`, `[woocommerce_checkout]`, `[woocommerce_my_account]`
     — out of scope (those pages are dropped). Just confirm the parent
     page is in the drop list.
   - `[contact-form-7 id="…"]` — replace with a note in the MDX comment;
     the form lives in `app/contact/page.tsx`, not MDX.
5. **Rewrite to clean semantic markup**:
   - Headings → `## H2`, `### H3`. The page title is the frontmatter
     `title` and is **not** repeated in the body (the page component
     renders it as the hero H1).
   - Body paragraphs → plain Markdown paragraphs.
   - Bulleted lists → `-` lists.
   - Quote/testimonial blocks → `<PullQuote attribution="…">…</PullQuote>`
     (component from plan 01).
   - Numbered editorial lists (e.g. the philosophy principles in About,
     the 4 steps in Diet Planning) → `<NumberedList>` with `<NumberedItem n="01" title="…">…</NumberedItem>` children.
   - "What's included" tile grids → `<TileGrid>` with `<Tile icon="fennel">…</Tile>`.
   - The Diet Planning sample-week → `<SampleWeekCard>` block (component
     from plan 01) populated from the existing copy; if the existing
     copy has a real weekly meal plan, preserve it verbatim modulo typos.
   - Embedded images → Markdown image syntax `![alt](/media/…)` —
     **always** with alt text, and always pointing into `public/media/<category>/`,
     never the old `/wp-content/uploads/` paths.
   - Drop-caps and pull-quotes inside long-form (Focus pages) → component
     wrappers from plan 01 (`<DropCap>F</DropCap>or many women…` style).
6. **Apply the typo fixes** from master §6 (see §5.4 below) during this
   pass — every occurrence in body and frontmatter.
7. Save into the canonical location (`content/<category>/<slug>.mdx`)
   with the frontmatter described in §5.5.
8. Open in the editor and read it end-to-end. If a section feels
   redundant or pure Elementor filler, drop it and add a one-line note
   to `MIGRATION_NOTES.md` (e.g. "Diet Planning: dropped 'Why choose us'
   icon-box section — generic Elementor fill, replaced by Three Pillars
   on home page").

> **Rule of thumb**: if a hand-pass takes longer than 30 minutes for one
> page, you're trying to preserve too much. Strip more. The brief is to
> _evolve_ the content, not photocopy it.

### 5.4 Typo fixes (per master §6)

Apply these substitutions during the hand-pass. They're case-preserving
search-and-replace, but be careful not to break URLs (the old slug
`diet-plannig-program` stays in the redirect map in plan 02 — only the
_new_ slug and the _body copy_ get the fix).

| Wrong                             | Right                             | Where                                                                   |
| --------------------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| `harmone`, `harmones`, `harmonal` | `hormone`, `hormones`, `hormonal` | Body of `focus/hormonal-health.mdx`, anywhere else it appears           |
| `manue`                           | `menu`                            | Anywhere (likely `programs/diet-planning.mdx`)                          |
| `plannig`                         | `planning`                        | Body of `programs/diet-planning.mdx`, the new slug, frontmatter `title` |
| `conultation`                     | `consultation`                    | Body of `programs/consultation.mdx`, the new slug                       |

Old slugs remain in `next.config.js` redirects (`/diet-plannig-program`
→ `/programs/diet-planning`) for SEO continuity; only **new** slugs get
the corrected spelling.

After the hand-pass, run `grep -rni "harmone\|manue\|plannig\|conultation" content/`
— it must return zero hits.

### 5.5 Frontmatter schema per content type

All schemas live in `lib/content/types.ts` and are validated by zod in
`scripts/check-content.ts`. The library schema is the master §3.10
contract verbatim — non-negotiable.

```ts
// lib/content/types.ts
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "kebab-case only");
const mediaPath = z.string().regex(/^\/media\/.+\.(avif|webp|png|jpg|svg)$/);

// ───────────────────────── programs/*.mdx
export const ProgramFrontmatter = z.object({
  type: z.literal("program"),
  slug, // e.g. "diet-planning"
  title: z.string(), // "Diet Planning Program"
  eyebrow: z.string(), // "Program 01"
  description: z.string().max(180), // meta + share blurb
  heroImage: mediaPath, // /media/programs/diet-planning-hero.avif
  ogImage: mediaPath.optional(),
  priceFrom: z.number().int().positive(), // PKR
  currency: z.literal("PKR"),
  ctaLabel: z.string().default("Book your slot"),
  ctaHref: z.string().url().or(z.string().startsWith("/")),
  // section-specific extras consumed by the program page template:
  whatsIncluded: z
    .array(
      z.object({
        icon: z.enum(["fennel", "mint", "citrus", "leaf", "drop", "spiral"]),
        label: z.string(),
      }),
    )
    .min(3)
    .max(8)
    .optional(),
  steps: z
    .array(
      z.object({
        n: z.string().regex(/^\d{2}$/), // "01"
        title: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
});
export type ProgramFrontmatter = z.infer<typeof ProgramFrontmatter>;

// ───────────────────────── focus/*.mdx
export const FocusFrontmatter = z.object({
  type: z.literal("focus"),
  slug,
  title: z.string(),
  eyebrow: z.literal("Focus area"),
  description: z.string().max(180),
  heroImage: mediaPath.optional(), // type-driven hero, image optional
  ogImage: mediaPath.optional(),
  related: z
    .object({
      program: slug.optional(), // e.g. "coaching"
      library: slug.optional(), // e.g. "pcos-guidebook"
    })
    .optional(),
});
export type FocusFrontmatter = z.infer<typeof FocusFrontmatter>;

// ───────────────────────── library/*.mdx (master §3.10 contract)
export const LibraryFrontmatter = z
  .object({
    type: z.literal("library"),
    slug,
    title: z.string(),
    eyebrow: z.string(), // "Guidebook 02"
    description: z.string().max(220),
    price: z.number().int().positive(), // regular price, PKR
    salePrice: z.number().int().positive().optional(),
    currency: z.literal("PKR"),
    buyUrl: z.string().url(), // EXTERNAL — Gumroad/LemonSqueezy/Amazon/etc.
    cover: mediaPath,
    ogImage: mediaPath.optional(),
    format: z.string().default("Digital · PDF"),
    pages: z.number().int().positive().optional(),
    sampleSpreads: z.array(mediaPath).min(1).max(5),
    toc: z.array(z.string()).min(3).max(20),
  })
  .refine((d) => d.salePrice === undefined || d.salePrice < d.price, {
    message: "salePrice must be less than price",
  });
export type LibraryFrontmatter = z.infer<typeof LibraryFrontmatter>;

// ───────────────────────── journal/*.mdx
export const JournalFrontmatter = z.object({
  type: z.literal("journal"),
  slug,
  title: z.string(),
  description: z.string().max(220),
  category: z.enum(["nutrition", "hormones", "lifestyle", "recipes", "case-notes"]),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  readingTime: z.number().int().positive(), // minutes; computed by hand or script
  heroImage: mediaPath.optional(),
  ogImage: mediaPath.optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  author: z.literal("Dr. Ruhma").default("Dr. Ruhma"),
});
export type JournalFrontmatter = z.infer<typeof JournalFrontmatter>;

// ───────────────────────── legal/*.mdx
export const LegalFrontmatter = z.object({
  type: z.literal("legal"),
  slug: z.enum(["privacy", "terms", "refunds"]),
  title: z.string(),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().max(180),
});
export type LegalFrontmatter = z.infer<typeof LegalFrontmatter>;

export const FrontmatterByType = {
  program: ProgramFrontmatter,
  focus: FocusFrontmatter,
  library: LibraryFrontmatter,
  journal: JournalFrontmatter,
  legal: LegalFrontmatter,
} as const;
```

Every MDX file's frontmatter starts with `type: <kind>` so the validator
can pick the right schema. Example library frontmatter (the master §3.10
contract, made concrete):

```yaml
---
type: library
slug: pcos-guidebook
title: PCOS Guidebook
eyebrow: Guidebook 02
description: A practical, evidence-based guide for women managing PCOS — what's actually happening, what works, what doesn't.
price: 3000
salePrice: 1500
currency: PKR
buyUrl: https://gumroad.com/l/REPLACE-ME-PCOS
cover: /media/library/pcos-cover.avif
ogImage: /media/library/pcos-og.avif
format: Digital · PDF
pages: 62
sampleSpreads:
  - /media/library/pcos-sample-1.avif
  - /media/library/pcos-sample-2.avif
  - /media/library/pcos-sample-3.avif
toc:
  - What's actually happening with PCOS
  - The hormonal cascade in plain language
  - The food framework — what to eat, when, why
  - Movement that helps (and what to skip)
  - Supplements — the evidence-based shortlist
  - When to see a clinician
---
```

`buyUrl` is required. It's the **only** way to buy — there is no on-site
checkout (master §7 decision 1). If Dr. Ruhma hasn't picked a platform
yet at migration time, use a `https://example.com/buy/<slug>` placeholder
and add the real URL to the launch checklist.

### 5.6 Image inventory + selection (3 passes)

The 1,555-file `uploads/` tree is mostly auto-generated thumbnails
(WordPress generates 5–10 sizes per upload; Elementor adds more). The
real source-image count is closer to ~250. Of those, ~80–120 are
_actually used in published content_. The rest are leftovers from
template imports, replaced versions, and Elementor temp files.

#### Pass A — find what WP says is used (DB queries)

Run these against the running container's DB. Save the results as CSV
in `raw-content/`. Two queries:

**A1. Featured-image (`_thumbnail_id`) references:**

```sql
-- raw-content/used-thumbnails.csv
SELECT
  p.ID                AS post_id,
  p.post_type,
  p.post_status,
  p.post_name         AS post_slug,
  pm.meta_value       AS attachment_id,
  att.guid            AS attachment_url,
  att_file.meta_value AS attachment_path
FROM wp_postmeta pm
JOIN wp_posts p        ON p.ID = pm.post_id
LEFT JOIN wp_posts att ON att.ID = pm.meta_value
LEFT JOIN wp_postmeta att_file
       ON att_file.post_id = pm.meta_value
      AND att_file.meta_key = '_wp_attached_file'
WHERE pm.meta_key = '_thumbnail_id'
  AND p.post_status IN ('publish', 'draft')
ORDER BY p.post_type, p.post_name;
```

**A2. Elementor-embedded image references** (Elementor stores the JSON
of every page in `wp_postmeta._elementor_data`, which contains
`{"id":<attachment_id>,"url":"…"}` for every dropped image):

```sql
-- raw-content/used-elementor.csv
SELECT
  p.ID         AS post_id,
  p.post_name  AS post_slug,
  pm.meta_value AS elementor_data
FROM wp_postmeta pm
JOIN wp_posts p ON p.ID = pm.post_id
WHERE pm.meta_key = '_elementor_data'
  AND p.post_status = 'publish';
```

After dumping A2, extract every `"id":\d+` and every `"url":"…wp-content/uploads/…"`
match with a one-liner:

```bash
grep -oE '"id":[0-9]+|"url":"[^"]*wp-content/uploads/[^"]+"' \
  raw-content/used-elementor.csv \
  | sort -u > raw-content/elementor-image-ids.txt
```

Drive both queries through:

```bash
sudo docker exec -i dietitianruhma-local-db-1 \
  mariadb -uwordpress -pwordpress wordpress < query.sql \
  > raw-content/<name>.csv
```

The union of A1 + A2 is the **candidate set** of in-use images.
Expected size: ~150–250 distinct attachment IDs.

#### Pass B — hand-curate

Open `raw-content/used-thumbnails.csv` and `raw-content/elementor-image-ids.txt`
side-by-side with the actual files in `uploads/<year>/<month>/`. For each
candidate decide one of:

- **Keep** — real photography (practitioner portraits, lifestyle shots,
  product mockups, sample spreads). Move to the migration manifest with
  a target slug (§5.7).
- **Replace** — quote-graphic PNGs, generic stock backgrounds, decorative
  Elementor boxes. **Drop**, add note to `MIGRATION_NOTES.md` ("home
  testimonial PNGs replaced by typeset CSS quotes per master §3.1").
- **Drop** — anything redundant, blurry, watermarked, or stock.

Target: 80–120 final source images. The known keepers from master §1
(visual direction):

- `coach-1.png` — primary practitioner portrait (home hero)
- `call1-1.png` — secondary practitioner portrait (consultation page)
- `AboutPage-Hero-1.jpg` — about-page hero
- The 3 ebook cover mockups + ~9 sample-spread images (3 per ebook)
- `Artboard-4.svg` — wordmark (handled separately, §5.8)

The other ~70–110 images are lifestyle shots, ingredient close-ups, and
in-line section photography selected from the candidate set.

#### Pass C — drop the rest

Everything not on the keeper list stays in `uploads/` (the WP backup) and
**does not** get copied into the new repo. The new repo never knows
those files existed. Confidence check: after the migration runs, the
new `public/media/` tree should weigh ≤ 35 MB.

### 5.7 Image optimization pipeline — `scripts/migrate-media.ts`

The pipeline reads from an explicit TS manifest (NOT from a JSON file
generated automatically — explicit is auditable). The manifest is
hand-edited during pass B and committed alongside the script.

**`scripts/media-manifest.ts`:**

```ts
// scripts/media-manifest.ts
//
// Source-image manifest. Hand-curated during the migration's pass B.
// Each entry maps an absolute path under the WP backup uploads tree to a
// destination category + slug under public/media/. Add entries here, then
// run `pnpm media:migrate`.
//
// To add a new image after migration: drop the source somewhere, add a row,
// re-run the script — it's idempotent and only re-encodes when the source
// is newer than the output.

export type MediaCategory = "home" | "about" | "programs" | "focus" | "library" | "journal";

export interface MediaEntry {
  /** Absolute path under the WP backup. */
  src: string;
  /** Top-level folder under public/media/. */
  category: MediaCategory;
  /** Filename slug — no extension, kebab-case. */
  slug: string;
  /** Optional: skip the largest size if the source is small. */
  maxSize?: 400 | 800 | 1200 | 1600 | 2400;
}

const UPLOADS = "/home/duh/Documents/website backup (1)/uploads";

export const MANIFEST: MediaEntry[] = [
  // ── HOME ──────────────────────────────────────────────────────────
  { src: `${UPLOADS}/2024/04/coach-1.png`, category: "home", slug: "hero-portrait" },
  // ── ABOUT ─────────────────────────────────────────────────────────
  { src: `${UPLOADS}/2024/04/AboutPage-Hero-1.jpg`, category: "about", slug: "hero" },
  // ── PROGRAMS ──────────────────────────────────────────────────────
  // { src: `${UPLOADS}/2024/05/diet-planning-hero.jpg`, category: "programs", slug: "diet-planning-hero" },
  // … fill in during pass B
  // ── FOCUS ─────────────────────────────────────────────────────────
  // ── LIBRARY ───────────────────────────────────────────────────────
  // covers + sample spreads
  // ── JOURNAL ───────────────────────────────────────────────────────
  // optional placeholder hero for the empty-state card
];
```

**`scripts/migrate-media.ts`:**

```ts
// scripts/migrate-media.ts
//
// One-shot AVIF + WEBP pipeline. Reads MANIFEST, encodes each source at
// five widths (400, 800, 1200, 1600, 2400) into AVIF + WEBP, and writes
// to public/media/<category>/<slug>-<width>.<ext>. Idempotent: skips an
// output if it's newer than the source.
//
// Usage: pnpm media:migrate
//        pnpm media:migrate -- --force   (re-encode everything)

import { mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MANIFEST, type MediaEntry } from "./media-manifest";

const SIZES = [400, 800, 1200, 1600, 2400] as const;
const FORMATS = ["avif", "webp"] as const;
const PUBLIC_MEDIA = path.resolve(process.cwd(), "public/media");

const FORCE = process.argv.includes("--force");

interface EncodePlan {
  entry: MediaEntry;
  width: number;
  format: (typeof FORMATS)[number];
  outPath: string;
}

async function isOutdated(srcPath: string, outPath: string): Promise<boolean> {
  if (FORCE) return true;
  if (!existsSync(outPath)) return true;
  const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
  return s.mtimeMs > o.mtimeMs;
}

async function encode(plan: EncodePlan): Promise<{ skipped: boolean; bytes: number }> {
  const { entry, width, format, outPath } = plan;
  if (!(await isOutdated(entry.src, outPath))) {
    return { skipped: true, bytes: 0 };
  }
  await mkdir(path.dirname(outPath), { recursive: true });

  const pipeline = sharp(entry.src, { failOn: "warning" })
    .rotate() // honor EXIF orientation
    .resize({ width, withoutEnlargement: true, fit: "inside" });

  const encoded =
    format === "avif"
      ? pipeline.avif({ quality: 55, effort: 6, chromaSubsampling: "4:2:0" })
      : pipeline.webp({ quality: 78, effort: 5 });

  const { size } = await encoded.toFile(outPath);
  return { skipped: false, bytes: size };
}

async function planFor(entry: MediaEntry): Promise<EncodePlan[]> {
  const meta = await sharp(entry.src).metadata();
  const sourceWidth = meta.width ?? 0;
  const ceiling = entry.maxSize ?? 2400;
  const widths = SIZES.filter((w) => w <= Math.min(sourceWidth, ceiling));
  if (widths.length === 0 && sourceWidth > 0) widths.push(sourceWidth);
  const plans: EncodePlan[] = [];
  for (const width of widths) {
    for (const format of FORMATS) {
      plans.push({
        entry,
        width,
        format,
        outPath: path.join(PUBLIC_MEDIA, entry.category, `${entry.slug}-${width}.${format}`),
      });
    }
  }
  return plans;
}

async function main(): Promise<void> {
  if (MANIFEST.length === 0) {
    console.error("media-manifest.ts is empty — populate it before running");
    process.exit(2);
  }

  const errors: string[] = [];
  let totalEncoded = 0;
  let totalSkipped = 0;
  let totalBytes = 0;
  const start = Date.now();

  for (const entry of MANIFEST) {
    if (!existsSync(entry.src)) {
      errors.push(`missing source: ${entry.src} (${entry.category}/${entry.slug})`);
      continue;
    }
    const plans = await planFor(entry);
    const results = await Promise.all(plans.map(encode));
    const encoded = results.filter((r) => !r.skipped).length;
    const skipped = results.length - encoded;
    const bytes = results.reduce((acc, r) => acc + r.bytes, 0);
    totalEncoded += encoded;
    totalSkipped += skipped;
    totalBytes += bytes;
    console.log(`  ${entry.category}/${entry.slug}: ${encoded} encoded, ${skipped} cached`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDone in ${elapsed}s — ${totalEncoded} encoded, ${totalSkipped} cached, ` +
      `${(totalBytes / 1024 / 1024).toFixed(2)} MB written`,
  );

  if (errors.length > 0) {
    console.error(`\n${errors.length} errors:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
```

Quality settings rationale:

- **AVIF q=55** + effort 6 — the sweet spot for photographic content;
  visually indistinguishable from q=70 but ~25% smaller.
- **WEBP q=78** — fallback for browsers without AVIF (Safari < 16.4).
  Higher q than AVIF because WEBP starts to artifact below ~75 on
  skin tones (this site has a lot of practitioner photography).
- **No JPEG** — between AVIF and WEBP we cover everything ≥ 2020 browsers.
  `next/image` automatically picks the best format from `srcSet`.
- **`withoutEnlargement: true`** — never upscale a small source; if a
  source is 1,200px wide, no 1,600 / 2,400 outputs are written.

After the script runs, `public/media/` looks like:

```
public/media/
├── home/
│   ├── hero-portrait-400.avif
│   ├── hero-portrait-400.webp
│   ├── hero-portrait-800.avif
│   ├── hero-portrait-800.webp
│   ├── hero-portrait-1200.avif
│   ├── hero-portrait-1200.webp
│   ├── hero-portrait-1600.avif
│   ├── hero-portrait-1600.webp
│   ├── hero-portrait-2400.avif
│   └── hero-portrait-2400.webp
├── about/
│   └── …
├── programs/
│   └── …
├── focus/
│   └── …
├── library/
│   └── …
└── journal/
    └── …
```

MDX files reference the **largest available** as the canonical path:
`heroImage: /media/home/hero-portrait-2400.avif` — the page component
strips the `-2400.avif` suffix and rebuilds the full `srcSet` for
`next/image`. (Helper for that lives in `lib/content/load.ts`, owned
by plan 02 layout / plan 04 home; this plan only needs to write the
files.)

### 5.8 Wordmark — separate handling

The wordmark is a single SVG (`Artboard-4.svg`) and gets its own
script — sharp is for raster, svgo for vector.

> **Duplication note**: this overlaps with **plan 02 (design system)**,
> which renders the wordmark inside `<Nav />` and `<Footer />`. That
> plan owns the _consumption_ of `public/wordmark.svg`. This plan owns
> the _production_ of it. Whichever plan runs first writes the file;
> the other should skip if it already exists. Coordinate in the team
> chat — but at minimum, neither plan should overwrite the other's
> output without a reason.

**`scripts/optimize-wordmark.ts`:**

```ts
// scripts/optimize-wordmark.ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { optimize } from "svgo";

const SRC = "/home/duh/Documents/website backup (1)/uploads/2024/04/Artboard-4.svg";
const OUT = path.resolve(process.cwd(), "public/wordmark.svg");

async function main(): Promise<void> {
  const raw = await readFile(SRC, "utf8");
  const result = optimize(raw, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            // keep viewBox so the SVG scales cleanly via CSS width/height
            removeViewBox: false,
            // don't merge paths — Ruhma's wordmark has multiple visually
            // distinct strokes; merging them broke the kerning in testing
            mergePaths: false,
          },
        },
      },
      "removeDimensions", // prefer viewBox over fixed width/height
      "sortAttrs",
    ],
  });
  if ("error" in result) throw new Error(result.error);
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, result.data, "utf8");
  console.log(`wordmark: ${raw.length} → ${result.data.length} bytes`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
```

If the actual wordmark file in the backup has a different name than
`Artboard-4.svg`, update the `SRC` constant — verify with
`find "/home/duh/Documents/website backup (1)/uploads" -name "*.svg"` first.

### 5.9 Verification — `scripts/check-content.ts`

Hard-fails on:

1. Any MDX file under `content/` whose frontmatter doesn't validate
   against its `type`'s zod schema.
2. Any image path referenced from MDX (frontmatter `heroImage`,
   `cover`, `ogImage`, `sampleSpreads[]`, or inline `![](…)`) that
   doesn't exist on disk under `public/`.
3. Any leftover typo (`harmone`, `manue`, `plannig`, `conultation`).
4. Any duplicate slug within a content type.

```ts
// scripts/check-content.ts
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";
import { z } from "zod";
import { FrontmatterByType } from "../lib/content/types";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

const FORBIDDEN_TYPOS = ["harmone", "manue", "plannig", "conultation"];
const IMAGE_KEYS = ["heroImage", "cover", "ogImage"] as const;
const INLINE_IMG = /!\[[^\]]*\]\((\/media\/[^)\s]+)\)/g;

interface Finding {
  file: string;
  message: string;
}

async function main(): Promise<void> {
  const files = await glob("content/**/*.mdx", { cwd: ROOT, absolute: true });
  const findings: Finding[] = [];
  const seenSlugs = new Map<string, string>(); // type:slug → file

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const raw = await readFile(file, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as { type?: keyof typeof FrontmatterByType };

    if (!fm.type || !(fm.type in FrontmatterByType)) {
      findings.push({
        file: rel,
        message: `frontmatter.type missing or unknown: ${String(fm.type)}`,
      });
      continue;
    }

    const schema = FrontmatterByType[fm.type];
    const result = schema.safeParse(fm);
    if (!result.success) {
      for (const issue of result.error.issues) {
        findings.push({
          file: rel,
          message: `frontmatter ${issue.path.join(".")}: ${issue.message}`,
        });
      }
      continue;
    }

    // duplicate slug check
    const fmd = result.data as { type: string; slug: string };
    const key = `${fmd.type}:${fmd.slug}`;
    const prior = seenSlugs.get(key);
    if (prior) findings.push({ file: rel, message: `duplicate slug — also in ${prior}` });
    seenSlugs.set(key, rel);

    // image existence — frontmatter
    for (const k of IMAGE_KEYS) {
      const v = (fm as Record<string, unknown>)[k];
      if (typeof v === "string" && !existsSync(path.join(PUBLIC, v))) {
        findings.push({ file: rel, message: `image not found: ${v} (frontmatter.${k})` });
      }
    }
    if (Array.isArray((fm as { sampleSpreads?: unknown[] }).sampleSpreads)) {
      for (const v of (fm as { sampleSpreads: string[] }).sampleSpreads) {
        if (!existsSync(path.join(PUBLIC, v))) {
          findings.push({ file: rel, message: `image not found: ${v} (sampleSpreads)` });
        }
      }
    }

    // image existence — inline
    for (const m of parsed.content.matchAll(INLINE_IMG)) {
      const ref = m[1];
      if (!existsSync(path.join(PUBLIC, ref))) {
        findings.push({ file: rel, message: `image not found: ${ref} (inline)` });
      }
    }

    // forbidden typos
    const lower = raw.toLowerCase();
    for (const t of FORBIDDEN_TYPOS) {
      if (lower.includes(t)) findings.push({ file: rel, message: `forbidden typo: "${t}"` });
    }
  }

  if (findings.length === 0) {
    console.log(`content:check ✓ ${files.length} files, all valid`);
    return;
  }
  console.error(`content:check ✗ ${findings.length} issues across ${files.length} files`);
  for (const f of findings) console.error(`  ${f.file}: ${f.message}`);
  process.exit(1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
```

Wire it into CI later (plan 14): `pnpm content:check` runs in the
GitHub Actions workflow alongside lint + typecheck + build.

### 5.10 `MIGRATION_NOTES.md`

A running log of decisions made during the hand-pass. One bullet per
change, terse. Sections:

- **Pages dropped** — cart, checkout, my-account, plus any inline
  Elementor section the human reviewer dropped as filler.
- **Slugs corrected** — diet-plannig→diet-planning, conultation→consultation,
  shop→library.
- **Images dropped** — quote-graphic PNGs (replaced by typeset CSS
  blockquotes), Elementor template visuals, stock backgrounds.
- **Content moved** — anything that lived on one old page but now belongs
  on a different new page (e.g., a paragraph from `/services` that's now
  on the home page).
- **Open questions** — `buyUrl` placeholders, missing imagery, anything
  Dr. Ruhma needs to confirm before launch.

This file is committed and lives at the repo root next to `README.md`
forever — it's the audit trail required by master §9 verification:
"every section from the old site has a home in the new one, or a
deliberate decision to omit it documented."

---

## 6. Output structure (snapshot)

After this plan runs to completion the new repo contains:

```
content/
├── site.ts
├── about.mdx
├── programs/
│   ├── diet-planning.mdx
│   ├── coaching.mdx
│   └── consultation.mdx
├── focus/
│   ├── hormonal-health.mdx
│   └── weight-management.mdx
├── library/
│   ├── diabetes-essentials.mdx
│   ├── pcos-guidebook.mdx
│   └── skin-secrets.mdx
├── journal/
│   └── welcome.mdx        # status: draft, used by /journal empty-state
└── legal/
    ├── privacy.mdx
    ├── terms.mdx
    └── refunds.mdx

public/
├── wordmark.svg
└── media/
    ├── home/
    │   └── hero-portrait-{400,800,1200,1600,2400}.{avif,webp}
    ├── about/
    │   ├── hero-{400,800,1200,1600,2400}.{avif,webp}
    │   └── portrait-secondary-{400,800,1200,1600,2400}.{avif,webp}
    ├── programs/
    │   ├── diet-planning-hero-{…}.{avif,webp}
    │   ├── coaching-hero-{…}.{avif,webp}
    │   └── consultation-hero-{…}.{avif,webp}
    ├── focus/
    │   ├── hormonal-health-{…}.{avif,webp}        (optional)
    │   └── weight-management-{…}.{avif,webp}      (optional)
    ├── library/
    │   ├── diabetes-cover-{…}.{avif,webp}
    │   ├── diabetes-sample-{1,2,3}-{…}.{avif,webp}
    │   ├── pcos-cover-{…}.{avif,webp}
    │   ├── pcos-sample-{1,2,3}-{…}.{avif,webp}
    │   ├── skin-cover-{…}.{avif,webp}
    │   └── skin-sample-{1,2,3}-{…}.{avif,webp}
    └── journal/
        └── (empty until first real post)

lib/content/
├── types.ts
├── load.ts
└── README.md

scripts/
├── migrate-media.ts
├── media-manifest.ts
├── optimize-wordmark.ts
└── check-content.ts

MIGRATION_NOTES.md
```

Total weight target: `public/media/` ≤ 35 MB; `public/wordmark.svg`
≤ 5 KB. Verify with `du -sh public/media public/wordmark.svg` after
the run — note the actual numbers in `MIGRATION_NOTES.md`.

---

## 7. Acceptance criteria

The plan is done when **all** of the following are true:

1. **MDX files exist** at every path listed in §6. Each one is at least
   the skeleton (frontmatter + 1 paragraph), with no `TODO` markers
   left in body copy. Empty-with-frontmatter is OK only for
   `journal/welcome.mdx` (placeholder by design).
2. `pnpm content:check` exits 0.
3. `pnpm media:migrate` runs to completion with zero errors. Re-running
   it is a no-op (all sources cached).
4. `pnpm wordmark:optimize` produced `public/wordmark.svg` and the file
   is ≤ 5 KB.
5. `grep -rni "harmone\|manue\|plannig\|conultation" content/` returns
   zero hits.
6. `grep -rEn "elementor-|data-elementor|wp-content/uploads" content/`
   returns zero hits — no Elementor leakage made it through.
7. `du -sh public/media` reports ≤ 35 MB.
8. `find public/media -type f | wc -l` is between 400 and 1,200
   (between 80 sources × 5 sizes × 2 formats and 120 × 5 × 2). If
   wildly outside that range, something's wrong with the manifest.
9. `MIGRATION_NOTES.md` exists with at least the headings from §5.10
   filled in.
10. `lib/content/types.ts` exports zod schemas for all five content
    types and has `pnpm typecheck` passing.
11. The dropped pages (cart/checkout/my-account) appear nowhere under
    `content/` and nowhere under `app/` — they're handled exclusively
    by 301s in plan 02.
12. Each `library/*.mdx` has a real `buyUrl` (or a clearly marked
    `https://example.com/buy/<slug>` placeholder, with a TODO entry in
    `MIGRATION_NOTES.md` Open Questions).

A reviewer should be able to read `MIGRATION_NOTES.md` and understand,
at a glance, what was preserved, what was dropped, and what's still
open.

---

## 8. Out of scope

Explicitly **not** in this plan — handled elsewhere:

- **Page composition** — `app/page.tsx`, `app/about/page.tsx`,
  `app/programs/[slug]/page.tsx`, etc. are plans 04–12. This plan
  only produces the inputs they consume.
- **Writing real journal posts** — only the placeholder `welcome.mdx`
  is created. Real editorial content is post-launch (master §3.11).
- **Newsletter, booking widget, contact form wiring** — plans 09 / 10 /
  11 / 13 own those. This plan doesn't touch them.
- **`next.config.js` redirect map** — owned by plan 02 (layout shell).
  Listed in §2 for context only.
- **Botanical SVG illustrations** (`public/illustrations/`) — owned by
  plan 01 (design system). Referenced in MDX via component props
  (`<Tile icon="fennel">`), not by file path, so this plan is
  decoupled from their delivery.
- **OG image generation** — `app/opengraph-image.tsx` is plan 13
  (SEO/polish). Frontmatter `ogImage` here is a static fallback only.
- **CMS integration** — the master plan §7 says no CMS; MDX in repo,
  PR-based updates. Don't add one in this plan or any later plan.
- **Elementor migration tooling** — no automated converter is built.
  Hand-pass is the strategy (master §6 — "Manually copy-edit into MDX").
- **Live-site deployment / DNS cutover** — plan 15 (cutover).

---

## 9. Estimated effort

For one developer, working from a clean repo with plans 00–02 done:

| Step                                                   | Time                      |
| ------------------------------------------------------ | ------------------------- |
| Set up scratch dir + dump WP HTML                      | 30 min                    |
| `lib/content/types.ts` zod schemas                     | 1 hr                      |
| `scripts/check-content.ts`                             | 1 hr                      |
| `scripts/migrate-media.ts` + manifest scaffolding      | 1.5 hrs                   |
| `scripts/optimize-wordmark.ts` + run                   | 30 min                    |
| Image pass A (DB queries + extract IDs)                | 1 hr                      |
| Image pass B (hand-curate, populate manifest)          | 3–4 hrs                   |
| Run `pnpm media:migrate`, verify weight                | 30 min                    |
| Hand-pass conversion of 13 MDX files (avg 30 min each) | 6.5 hrs                   |
| `MIGRATION_NOTES.md` running log                       | (woven in, ~30 min total) |
| Final `content:check` run + fix-ups                    | 1 hr                      |

Total: **~16–18 hours** = ~2 working days. Fits the 2–3 day "asset
migration" slot implied by master §8 phasing.
