# Phase 02 — Layout Shell — Report

## Files created

- `content/site.ts` — single source of truth for site name, tagline, contact, nav, and footer columns. Real Instagram handle (`ruhma_nazeer`), WhatsApp (`+923176296025`), and email (`info@dietitianruhma.com`) recovered from the WP database backup.
- `components/layout/nav.tsx` — sticky top bar, scroll-condenses past 64 px (animated padding/blur/translucent background via `motion/react` + `useScroll`), wordmark left, link rail right, mauve underline on active section, Contact CTA pill, mobile sheet via shadcn `Sheet`. Active match uses `isActiveSection` so `/focus/weight-management` lights "Focus" when the nav points at `/focus/hormonal-health`.
- `components/layout/footer.tsx` — 5-column grid (Practice / Programs / Resources / Legal + Newsletter), tagline in `font-display` at 28/32 px, Instagram + Mail + WhatsApp social rail. Newsletter is visual + POSTs to `/api/newsletter` (TODO comment for Phase 6 wiring).
- `app/api/newsletter/route.ts` — placeholder POST returns 202 with TODO comment.
- `app/loading.tsx` — editorial pulse skeleton, SR-only "Loading…".
- `app/error.tsx` — client error boundary, "Try again" + "Return home", optional `error.digest` reference.
- `app/not-found.tsx` — on-brand 404 ("Not on the menu.").
- `app/robots.ts` — disallow-all in non-prod (`VERCEL_ENV !== "production"`), allow `/` + sitemap link in prod.
- `app/sitemap.ts` — 17 static routes; tries to glob `content/journal/*.mdx` and degrades cleanly when the directory is missing.
- `public/wordmark.svg` — copied from `/home/duh/Documents/website backup (1)/uploads/2024/06/Artboard-4.svg`, run through SVGO multipass (1.3 KB → 1.2 KB), then `fill:#fff` swapped to `currentColor` so the mark inherits `text-ink`. Without the swap the wordmark was white-on-cream and invisible.

## Files modified

- `app/layout.tsx` — added `Viewport` export, full SEO metadata block (`metadataBase`, `openGraph`, `twitter`, `robots`), skip-link, body becomes flex column, mounts `<Nav>` and `<Footer>` around `<main id="main">`. Kept `next/font` declarations inline (Phase 1 chose inline over `app/fonts.ts`; the plan accepts either).
- `next.config.ts` — added `reactStrictMode`, `poweredByHeader: false`, AVIF/WebP image config, and the 17 permanent (308) redirects from master plan §6.

## Dependencies added

- `svgo@4.0.1` (devDependency) — used once to optimize the wordmark.

All other deps (`motion`, `lucide-react`, `clsx`, `tailwind-merge`) were already present from Phase 0/1.

## Deviations from the plan

1. **`next.config.js` → `next.config.ts`** — repo already uses TS config (Phase 0 choice); adapted the redirects export to the TS form.
2. **17 redirects, not 18** — the plan's §4.7 lists a belt-and-braces `/shop/` trailing-slash entry which Next.js refuses (`source` is identical to `/shop` after Next's default trailing-slash collapse). Master plan §6 lists 17. Kept 17.
3. **Instagram icon** — `lucide-react@1.14.0` (already locked by Phase 1) does not ship the Instagram glyph (trademark). Inlined a stroke-equivalent SVG component inside `footer.tsx` so we don't pull in an extra icon library.
4. **`isActive` + `cta`** — added `aria-current="page"` to the CTA Contact link too (the plan only set it on text links). Costs nothing, helps a11y.
5. **Sheet close button** — passed `showCloseButton={false}` so the bespoke mobile-menu close button (with `Menu` label) doesn't double up against the shadcn default close.
6. **`useEffect` cleanup of mobile sheet on route change** — wrapped in a `useRef` previous-pathname guard to satisfy the new `react-hooks/set-state-in-effect` rule in eslint-config-next 16.
7. **`lib/cn.ts`** — already created in Phase 1 at this path (not `lib/utils.ts`); imports updated accordingly.
8. **WhatsApp / Instagram / email** — used real legacy-WP values rather than placeholders (`info@dietitianruhma.com`, `ruhma_nazeer`, `+923176296025`).
9. **`fill:currentColor` on wordmark** — applied by default; the original SVG was pure white and unusable on cream.

## Verification

```text
$ pnpm typecheck
✓ tsc --noEmit (no errors)

$ pnpm lint
✓ eslint --max-warnings=0 (clean)

$ pnpm format:check
✓ All matched files use Prettier code style

$ pnpm build
✓ Compiled successfully in 2.1s
✓ Static pages 8/8
  Routes: / · /_not-found · /api/newsletter · /kit · /robots.txt · /sitemap.xml
```

### Runtime checks against `pnpm dev`

| Check                                | Result                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| All 17 legacy slugs → 308 + Location | pass — every old WP URL resolves                               |
| `GET /robots.txt`                    | `User-Agent: *` + `Disallow: /` (correct for dev / non-prod)   |
| `GET /sitemap.xml` `<url>` count     | 17 (matches static route table)                                |
| `POST /api/newsletter`               | 202 Accepted                                                   |
| `GET /` → HTML                       | contains `html lang="en"`, `theme-color`, `og:site_name`, `twitter:card`, `<main id="main"`, `bg-cream`, `font-sans`, wordmark preload |
| `GET /this-route-does-not-exist`     | 404 + on-brand `not-found.tsx`                                 |
| `<link rel="preload" as="image">` for `/wordmark.svg` | emitted (priority Image)                      |

## Notes for the next phase

- `app/fonts.ts` does not exist; fonts are declared inline in `app/layout.tsx`. Phase 13 (SEO) and any per-page metadata work should keep using the inline declaration or factor it out — both work.
- `content/journal/` is intentionally not created here; `app/sitemap.ts` will pick MDX up automatically once Phase 10 lands.
- The site's home page (`app/page.tsx`) is still the Phase 0 placeholder. Phase 04 owns the real home; this phase only delivered the chrome around it.
