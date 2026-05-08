# Phase 14 — Cutover (code-side) Report

Code-side cutover work per `plan/14-cutover.md`, with the live DNS swap,
Vercel deploy, GitHub Actions deploy hooks, local WP retirement, and
Search Console submission **explicitly skipped per user instruction**.

## Verifications

All four gates green at v0.9.0:

```
pnpm typecheck       # tsc --noEmit, clean
pnpm lint            # eslint --max-warnings=0, clean
pnpm format:check    # All matched files use Prettier code style
pnpm build           # 27 routes, 16 user-prerendered + dynamic OG
```

`pnpm build` route summary:
`/`, `/about`, `/services`, `/contact`, `/journal`, `/library`, `/kit`
prerendered static; `/focus/[slug]`, `/journal/[slug]`, `/legal/[slug]`,
`/library/[slug]`, `/programs/[slug]` SSG; `/api/newsletter` and the
section OG endpoints dynamic; `/sitemap.xml`, `/robots.txt` static.

## Redirect table (17/17 — verified `curl -sI http://localhost:3000<path>`)

| Old path                    | Status | Location                       |
| --------------------------- | ------ | ------------------------------ |
| `/about-me`                 | 308    | `/about`                       |
| `/contact-me`               | 308    | `/contact`                     |
| `/diet-plannig-program`     | 308    | `/programs/diet-planning`      |
| `/coaching-program`         | 308    | `/programs/coaching`           |
| `/conultation-call`         | 308    | `/programs/consultation`       |
| `/hormonal-health`          | 308    | `/focus/hormonal-health`       |
| `/weight-management`        | 308    | `/focus/weight-management`     |
| `/shop`                     | 308    | `/library`                     |
| `/shop/diabetes-essentials` | 308    | `/library/diabetes-essentials` |
| `/shop/pcos-guidebook`      | 308    | `/library/pcos-guidebook`      |
| `/shop/skin-secrets`        | 308    | `/library/skin-secrets`        |
| `/cart`                     | 308    | `/library`                     |
| `/checkout`                 | 308    | `/library`                     |
| `/my-account`               | 308    | `/library`                     |
| `/refund_returns`           | 308    | `/legal/refunds`               |
| `/privacy-policy`           | 308    | `/legal/privacy`               |
| `/terms-and-conditions`     | 308    | `/legal/terms`                 |

## Sitemap audit (18/18 URLs return 200)

`curl -s http://localhost:3000/sitemap.xml` enumerated 18 `<loc>`s. Each
HEAD request returned 200:

`/`, `/about`, `/services`, `/programs/diet-planning`,
`/programs/coaching`, `/programs/consultation`,
`/focus/hormonal-health`, `/focus/weight-management`, `/library`,
`/library/diabetes-essentials`, `/library/pcos-guidebook`,
`/library/skin-secrets`, `/journal`, `/contact`, `/legal/privacy`,
`/legal/terms`, `/legal/refunds`, `/journal/welcome` — all 200.

## Robots audit

`app/robots.ts` returns `Allow: /` plus the sitemap pointer **only**
when `process.env.VERCEL_ENV === "production"`; otherwise emits
`Disallow: /`. Local `curl -s /robots.txt` returned `User-Agent: * /
Disallow: /` (expected for non-production). Production path is correct
and matches `plan/14-cutover.md` §11 acceptance criteria.

## Files created

- `LAUNCH_CHECKLIST.md` — 10-step operator checklist for the manual
  launch work (env vars, Resend, Vercel link, analytics, booking,
  buyUrl swap, DNS, Search Console, WP retirement, Hostinger
  cancellation).
- `CHANGELOG.md` — `0.9.0` entry summarising the pre-launch state.
- `PHASE_14_REPORT.md` — this document.

## Files modified

- `package.json` — version `0.1.0` → `0.9.0`.
- `README.md` — rewritten for the as-built state; links to
  `LAUNCH_CHECKLIST.md`, `MIGRATION_NOTES.md`, `CHANGELOG.md`,
  `plan/14-cutover.md`.
- `MIGRATION_NOTES.md` — added "Cutover state" section listing what is
  shipped, stubbed (`RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`, three
  `buyUrl`s, booking widget, analytics snippet), and what remains
  manual (cross-ref `LAUNCH_CHECKLIST.md`).

## Open items

All operational. Tracked in `LAUNCH_CHECKLIST.md`:

1. Set `NEXT_PUBLIC_SITE_URL` and `RESEND_API_KEY` in Vercel env.
2. Verify Resend sending domain.
3. Vercel project link and first deploy.
4. Analytics (Plausible recommended) snippet in `app/layout.tsx`.
5. Cal.com / Calendly embed on `/programs/consultation`.
6. Replace three library `buyUrl` placeholders.
7. Lower DNS TTL → flip apex A + `www` CNAME (per `plan/14-cutover.md`
   §5).
8. Submit sitemap to Search Console; monitor for 7 days.
9. `docker compose down -v` on the local WP `_local` stack at Day +7.
10. Cancel Hostinger hosting at Day +30; preserve domain registration
    and MX continuity.

## Skipped per user instruction

Production DNS swap, Vercel deploy/promote, GitHub Actions deploy
hooks, local WP retirement, Search Console sitemap submission. The
local WordPress Docker stack remains running for content reference.
