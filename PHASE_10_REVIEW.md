# Phase 10 — Journal · Review

## Verdict

PASS.

## Gates

- `pnpm typecheck` — clean.
- `pnpm lint` — 0 warnings.
- `pnpm build` — green; prerenders `/journal` (static) and `/journal/welcome`
  (SSG via `generateStaticParams`).

## Runtime

- `curl /journal` → 200. Welcome featured card ("A note before the journal
  begins"), `Read →` affordance, "Coming soon" empty placeholder cards, and
  "sign up for updates" newsletter copy all present. Single `<h1>`.
- `curl /journal/welcome` → 200. MDX body, "Dr. Ruhma" + `/about` author
  footer, "More entries" related strip, JSON-LD `BlogPosting` script tag all
  present. Single `<h1>`.
- `curl /journal/does-not-exist` → 404.

## Spot-checks

- `app/sitemap.ts` calls `loadAllJournal()` (line 40) and maps each post
  to a sitemap entry — drafts excluded, dynamic.
- `<script type="application/ld+json">` with `"@type": "BlogPosting"`
  emitted from `app/journal/[slug]/page.tsx`.
- `<time dateTime={post.publishedAt}>` in `post-hero.tsx`,
  `featured-post.tsx`, and `post-card.tsx`.
- Motion via `LetterStagger`, `ImageReveal`, `FadeUp` only — no raw
  `framer-motion` / `motion/react` imports inside `components/marketing/journal/`
  or `app/journal/`.
- No raw hex colors in journal source (tokens only).
- All `<img>` tags emitted by `next/image`; no raw `<img>` authored.

## Notes

Welcome cover hero uses `alt=""` (decorative, primary action labelled via
`aria-label` on the wrapping `<a>`) — acceptable.

## Deviations accepted

RSS deferred, chips as anchors only, newsletter to placeholder
`/api/newsletter`, placeholder cards capped at 5, single real post —
all per task brief.
