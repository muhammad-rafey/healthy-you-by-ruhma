# Healthy You By Ruhma

Next.js redesign of [dietitianruhma.com](https://dietitianruhma.com) for
**Dr. Ruhma** — clinical dietitian, Lahore. Brand: **Healthy You By
Ruhma**. Currency: **PKR**.

> Editorial, photography-led, restrained motion. See
> `plan/redesign-plan.md` for the design plan and `plan/00-setup.md`
> through `plan/14-cutover.md` for the per-phase implementation plans.

## Status

**v0.9.0 — pre-launch.** Phases 00–14 complete. Codebase is
production-ready. Remaining work is operational (env vars, Resend, DNS
cutover, external integrations) — see [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md).

## Stack

- Next.js 16 (App Router, RSC, Turbopack) · TypeScript strict
- Tailwind CSS v4 (CSS-variable tokens)
- shadcn/ui · Radix · Base UI primitives
- Motion v12 (three motion primitives only)
- MDX in repo for long-form content (`content/`)
- `@vercel/og` for dynamic OG images
- React Hook Form + Zod for the contact form
- Hosted on Vercel (target)

## Requirements

- Node 20.11+
- pnpm 10+ (via `corepack enable`)

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in values as needed
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command                  | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `pnpm dev`               | Dev server (Turbopack) on :3000                               |
| `pnpm build`             | Production build                                              |
| `pnpm start`             | Serve production build                                        |
| `pnpm lint`              | ESLint with `next/core-web-vitals` + strict rules             |
| `pnpm lint:fix`          | ESLint, auto-fix                                              |
| `pnpm format`            | Prettier write                                                |
| `pnpm format:check`      | Prettier check (CI uses this)                                 |
| `pnpm typecheck`         | `tsc --noEmit`, strict mode                                   |
| `pnpm ci`                | All four checks above, sequentially                           |
| `pnpm media:migrate`     | Encode `public/media/` from the source manifest               |
| `pnpm content:check`     | Validate MDX frontmatter against the schemas in `lib/content` |
| `pnpm wordmark:optimize` | Re-emit `public/wordmark.svg` from `Artboard-4.svg`           |

## Project structure

```
app/         routes (App Router) + sitemap.ts + robots.ts + opengraph-image.tsx
components/  ui (shadcn) · marketing · motion · layout · forms
content/     mdx — about · programs · focus · library · journal · legal · site
lib/         tokens · seo · og helpers · MDX loaders
public/      media (avif/webp) · illustrations · wordmark
plan/        15-file implementation plan (00–14) + master redesign plan
scripts/     migration + content + asset tooling
```

## Routes shipped

User-facing prerendered routes (16): `/`, `/about`, `/services`,
`/programs/{diet-planning,coaching,consultation}`,
`/focus/{hormonal-health,weight-management}`, `/library`,
`/library/{diabetes-essentials,pcos-guidebook,skin-secrets}`,
`/journal`, `/journal/welcome`, `/contact`, `/legal/{privacy,terms,refunds}`.

Plus `/kit` (design kit, dev reference), dynamic OG image routes per
content section, and the contact form server endpoint.

17 legacy WordPress URLs return HTTP 308 to the new IA — see
`next.config.ts` `redirects()`.

## Production cutover

Pre-launch operator steps: [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md).
Full SRE runbook: [`plan/14-cutover.md`](./plan/14-cutover.md).

## Documentation

- [`MIGRATION_NOTES.md`](./MIGRATION_NOTES.md) — WP → Next.js migration log,
  open questions, and current "Cutover state".
- [`CHANGELOG.md`](./CHANGELOG.md) — version history.
- `PHASE_00_REPORT.md` … `PHASE_14_REPORT.md` — per-phase reports with
  paired review documents.

## License

Private / unlicensed. All content © Healthy You By Ruhma.
