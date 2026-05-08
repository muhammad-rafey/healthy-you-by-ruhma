# Changelog

All notable changes to this project. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); semver applies
once `1.0.0` ships at production cutover.

## [0.9.0] — 2026-05-08 — Pre-launch

Code-side cutover preparation per `plan/14-cutover.md`. The codebase is
ready for production; remaining work is operational (DNS, env vars,
external integrations) and is captured in `LAUNCH_CHECKLIST.md`.

### Added

- `LAUNCH_CHECKLIST.md` — operator-facing manual steps for cutover.
- `CHANGELOG.md` (this file).
- `MIGRATION_NOTES.md` "Cutover state" section documenting what is
  shipped, what is stubbed, and what remains manual.

### Changed

- `package.json` version bumped from `0.1.0` to `0.9.0`.
- `README.md` updated to reflect the as-built state, with a link to
  `LAUNCH_CHECKLIST.md`.

### Verified at this version

- `pnpm typecheck` — clean.
- `pnpm lint` — zero warnings, zero errors.
- `pnpm format:check` — clean.
- `pnpm build` — 27 pages generated; 16 user-facing routes prerendered
  plus dynamic OG image endpoints.
- All 17 redirects in `next.config.ts` return HTTP 308 with the correct
  `Location` header (verified via local `pnpm start`).
- All 18 sitemap URLs return HTTP 200.

### Stubbed (replace at launch — see `LAUNCH_CHECKLIST.md`)

- `RESEND_API_KEY` — contact form will throw without it.
- Library `buyUrl`s — all three point at `https://example.com/buy/<slug>`.
- `/programs/consultation` booking widget — currently mailto/WhatsApp.
- `NEXT_PUBLIC_SITE_URL` — defaults to placeholder if unset.

## Phase history

The full per-phase implementation history lives in
`PHASE_00_REPORT.md` … `PHASE_14_REPORT.md`. Each report has a paired
review document. The plans themselves are in `plan/00-setup.md` …
`plan/14-cutover.md`.
