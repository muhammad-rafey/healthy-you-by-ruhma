# Migration notes — WordPress → Next.js

Phase 03 migration log. Decisions, drops, and the open questions waiting on
Dr. Ruhma. Pair with `plan/03-content-media-migration.md` for the full
context.

## Page mapping (canonical IDs from `wp post list`)

| WP ID | Old slug                | New path                          | Status                    |
| ----- | ----------------------- | --------------------------------- | ------------------------- |
| 57    | `home`                  | `app/page.tsx` (inline, plan 04)  | Extracted to raw-content/ |
| 46    | `about-me`              | `content/about.mdx`               | Migrated                  |
| 38    | `services`              | `app/services/page.tsx` (inline)  | Extracted; copy lives inline at build time |
| 25    | `diet-plannig-program`  | `content/programs/diet-planning.mdx` | Migrated (slug fixed: plannig → planning) |
| 460   | `coaching-program`      | `content/programs/coaching.mdx`   | Migrated                  |
| 506   | `conultation-call`      | `content/programs/consultation.mdx` | Migrated (slug fixed: conultation → consultation) |
| 562   | `hormonal-health`       | `content/focus/hormonal-health.mdx` | Migrated (typo fix: harmone → hormone) |
| 645   | `weight-management`     | `content/focus/weight-management.mdx` | Migrated (title fix: managment → management) |
| 934   | `shop`                  | `app/library/page.tsx` (inline)   | Replaced by `/library`    |
| 1029  | `cart`                  | —                                 | **Dropped** (redirect → /library) |
| 936   | `checkout`              | —                                 | **Dropped** (redirect → /library) |
| 937   | `my-account`            | —                                 | **Dropped** (redirect → /library) |
| 20    | `contact-me`            | `app/contact/page.tsx` (inline)   | Extracted (form copy minimal) |
| 938   | `refund_returns`        | `content/legal/refunds.mdx`       | Migrated                  |
| 1156  | `privacy-policy`        | `content/legal/privacy.mdx`       | Migrated                  |
| 1409  | `terms-and-conditions`  | `content/legal/terms.mdx`         | Migrated                  |

WooCommerce products (3 published):

| Product ID | Slug                  | New path                                  | Status   |
| ---------- | --------------------- | ----------------------------------------- | -------- |
| 941        | `diabetes-essentials` | `content/library/diabetes-essentials.mdx` | Migrated |
| 1146       | `pcos-guidebook`      | `content/library/pcos-guidebook.mdx`      | Migrated |
| 1601       | `skin-secrets`        | `content/library/skin-secrets.mdx`        | Migrated |

Four draft products (`weightloss-by-your-own`, `recipe-book`,
`fertility-nutriton`, `menopause-health`) are unpublished in WP and not
brought across. They surface in `MIGRATION_NOTES.md` Open Questions for
Dr. Ruhma to decide whether to revive.

## Pages dropped

- **Cart / Checkout / My Account** (WP IDs 1029, 936, 937) — redirected to
  `/library` per master §2 (commerce is external link-out only).
- **Home / Services / Contact** are NOT in `content/` — they are bespoke
  pages whose copy is hard-coded in `app/<route>/page.tsx` per plan §3 of
  the master document. The Phase 03 deliverable for those is the extracted
  `raw-content/*.html` snapshot used as the source of truth in plan 04.

## Sections dropped during the hand-pass

- **Home — "0+ Satisfied Clients / 0+ Consultation Calls / 0+ Ebooks"
  vanity counters.** Currently render as `0+` because the values were
  never populated; replacing the section with the testimonial grid is the
  master plan's intent. Will be restored only if Dr. Ruhma supplies real
  numbers.
- **Home — quote-graphic PNGs** for the testimonial slider. Replaced
  with typeset `<PullQuote>` / `<TestimonialGrid>` per master §1 visual
  direction.
- **Diet Planning — Vimeo testimonial embeds** (4 raw URLs). Replaced
  with two typeset long-form quote cards per the program-page schema in
  master §3.4.
- **Coaching — same Vimeo block.** Same treatment.
- **Generic Elementor "Why choose us" boxes** with placeholder icons —
  the new home page expresses this as the Three Pillars grid.
- **Services page "Maternal Nutrition / Anti-Aging Nutrition / Mental
  Health Nutrition" tiles** — collapsed into a single "Other Services"
  paragraph in the Services page copy. The three programs (Diet, Coaching,
  Consultation) are the funnel; the rest is positioning.
- **WhatsApp / Chat duplicate CTAs** — every WP page ended with two
  near-identical "Chat WhatsApp" buttons. Replaced with the canonical
  CTA band from master §3.

## Slugs corrected

- `diet-plannig-program` → `diet-planning` (typo: plannig)
- `conultation-call`     → `consultation` (typo: conultation)
- `shop`                 → `library` (editorial framing per master §3.9)
- `about-me`             → `about`
- `contact-me`           → `contact`
- `refund_returns`       → `legal/refunds`
- `privacy-policy`       → `legal/privacy`
- `terms-and-conditions` → `legal/terms`

Old slugs remain as 301s in `next.config.ts` (owned by Phase 02 layout shell).

## Typos fixed

Body content was hand-edited during the conversion pass:

- `harmone` / `harmones` / `harmonal` → `hormone` / `hormones` / `hormonal`
- `manue` → `menu`
- `plannig` → `planning`
- `conultation` → `consultation`
- `managment` → `management` (focus/weight-management title)

`grep -rni "harmone\|manue\|plannig\|conultation" content/` returns zero
hits (verified in `pnpm content:check`).

## Images dropped

- The full **1,555-file uploads/** tree is NOT copied to the new repo.
  `public/media/` is built only from the manifest in
  `scripts/media-manifest.ts` — currently 32 source images, encoded to
  AVIF + WEBP at five widths each.
- **Quote-graphic PNGs** (`Copy-of-quote*.png`, `quote*.png`) — replaced
  by typeset CSS blockquotes per master §1.
- **WooCommerce / Elementor placeholder PNGs** (`placeholder-*.png`) —
  generic stock that adds nothing.
- **Decorative Elementor SVGs** (`HomePage-IconBox_*.svg`,
  `WorkshopsPage-*.svg`, `community-icon-flip_new.svg`) — replaced by
  the botanical SVG set in `public/illustrations/`.
- **Background patterns** (`transparant-background-pat.svg`) — Tailwind
  handles surface treatments now.
- **`Artboard-4.svg`** — kept as the wordmark source for
  `scripts/optimize-wordmark.ts`. The current `public/wordmark.svg` was
  authored in Phase 02 and is preserved (svgo-optimised already, 1,222
  bytes); pass `--force` to overwrite from Artboard-4.svg if needed.

## Content moved between pages

- **About** — the "My Wins" section (Korea/Pakistan competition, Chiniot
  General Hospital gluten-free cake) is preserved in `content/about.mdx`.
  These are real biographical wins worth keeping.
- **Diet Planning sample week** — the original WP page had no real meal
  plan. The MDX now contains a worked example (anonymised), per master
  §3.4 "the sample-week embedded card — gives the buyer something
  concrete instead of vague promises."
- **Coaching "What 8 weeks looks like"** — the WP source had a generic
  4-step description; the MDX preserves it with editorial polish. The
  awards-grade timeline visualisation is built in plan 05.

## Asset weight

After encoding:

- `public/media/`: 5.5 MB across 192 files (32 source images × ~6
  width-format combinations on average).
- `public/wordmark.svg`: 1,222 bytes.
- Down from 320 MB / 1,555 files in the legacy uploads tree (≈ 98%
  reduction).
- Comfortably inside the master plan §6 ≤ 35 MB target.

## Open questions

The following items are placeholders and need confirmation before launch:

- **`buyUrl` for each library entry** — currently
  `https://example.com/buy/<slug>`. Dr. Ruhma to decide on Gumroad,
  Lemon Squeezy, Amazon KDP, or a similar external store, then PR the
  URL into each frontmatter.
- **Real testimonials** — the WP testimonials (Muhammad Atif, Amna
  Khalid, Abigill, Rejab Gul, Jassica Enton, Muhammad Saad) read as
  template-mart filler. Need real quotes from real clients with explicit
  consent before launch. Until then, the home page renders typeset
  pull-quotes from clinical experience without attribution.
- **Vanity counters** — "500+ clients", "0+ consultation calls" etc.
  We need real numbers, or the section comes off the home page.
- **Draft products** (Recipe Book, Fertility Nutrition, Menopause
  Health, Weightloss By Your Own) — should any of these go live? They
  are currently `post_status=draft` and not brought into the Library.
- **Practitioner credentials list** — the WP About page has a
  "Certifications" header but no actual content under it. The MDX
  preserves the framing; need the credentials to render.
- **Real practice address** — for the optional Contact page map. WP
  has none.
- **Fonts** — Inter + Epilogue self-hosted via `next/font`; verified
  Phase 01.

## Cutover state (Phase 14, 2026-05-08)

The codebase is at **v0.9.0** — pre-launch. Phases 00–13 implemented
the design system, content migration, all user-facing routes, SEO,
sitemap/robots, OG images, contact form, and verification tooling.
Phase 14 closes the code-side cutover work.

### Done (code-side)

- 16 user-facing routes prerendered + dynamic OG images.
- 17 legacy WP URLs return HTTP 308 to the new IA (verified locally
  against `pnpm start` — see `PHASE_14_REPORT.md` for the redirect
  table with statuses).
- `app/sitemap.ts` emits 18 URLs; all 200 locally.
- `app/robots.ts` `noindex`s on non-production (`VERCEL_ENV !==
  "production"`) and exposes `Allow: /` plus the sitemap pointer in
  production. Verified local response is `User-Agent: * / Disallow: /`
  as expected.
- `pnpm typecheck && pnpm lint && pnpm format:check && pnpm build` all
  green.
- `package.json` version bumped 0.1.0 → 0.9.0; `CHANGELOG.md` added.
- `LAUNCH_CHECKLIST.md` written with the operator-facing manual steps.
- `README.md` updated for the as-built state.

### Stubbed — replace at launch (cross-ref `LAUNCH_CHECKLIST.md`)

| Item                         | Where                                          | Step in `LAUNCH_CHECKLIST.md` |
| ---------------------------- | ---------------------------------------------- | ----------------------------- |
| `RESEND_API_KEY`             | Vercel env var                                 | §1, §2                        |
| `NEXT_PUBLIC_SITE_URL`       | Vercel env var                                 | §1                            |
| Library `buyUrl` × 3         | `content/library/{diabetes-essentials,pcos-guidebook,skin-secrets}.mdx` | §6                            |
| Booking widget               | `/programs/consultation` (currently mailto/WhatsApp link) | §5                            |
| Analytics snippet            | `app/layout.tsx` (Plausible or Vercel Analytics) | §4                            |

### Remaining manual cutover work

Out of scope for the codebase. Tracked in `LAUNCH_CHECKLIST.md`:

- Vercel project link, env vars, first deploy.
- Resend domain verification + API key.
- DNS TTL pre-stage at registrar (T-2 days).
- DNS apex A + `www` CNAME flip at registrar (T-0).
- Hostinger maintenance-mode static `index.html`.
- Search Console sitemap submission and indexing requests.
- Local Docker WP retirement (`docker compose down -v`) at Day +7 with
  final `database.sql` dump archived first.
- Hostinger hosting plan cancellation at Day +30.

### Explicitly not done (per user instruction for Phase 14)

- No production DNS changes, no Vercel env mutation, no
  promote-to-production deploy.
- No GitHub Actions deploy hook wiring (would require Vercel project
  ID).
- Local WP `_local` Docker stack left running for content reference.
- Search Console sitemap submission deferred to manual operator step.

## Verification commands run

```bash
pnpm exec tsx scripts/check-content.ts   # ✓ 13 files, all valid
pnpm exec tsx scripts/migrate-media.ts   # 192 files / 5.06 MB
pnpm exec tsx scripts/optimize-wordmark.ts  # ✓ 1,222-byte wordmark in place
grep -rni "harmone\|manue\|plannig\|conultation" content/   # zero hits
grep -rEn "elementor-|data-elementor|wp-content/uploads" content/  # zero hits
du -sh public/media public/wordmark.svg
find public/media -type f | wc -l
```
