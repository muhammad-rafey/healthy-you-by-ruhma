# Phase 01 — Design System — Report

## Summary

End-to-end implementation of the design-system foundation per `plan/01-design-system.md`. Tokens, fonts, type scale, primitives, motion components, botanical SVG set, shadcn/ui (Button, Sheet, Accordion), and a visual-QA route. All four verification gates pass.

## Files created

- `app/globals.css` — replaced scaffold with master §1 tokens, `@theme` block, base layer, type-scale + prose `@layer components` utilities, plus a shadcn-compat semantic-token shim mapped to the brand palette.
- `app/layout.tsx` — replaced Geist scaffold with Inter + Epilogue via `next/font/google`, brand metadata, `bg-cream text-ink-soft` body.
- `tailwind.config.ts` — minimal v4 stub with `content` array.
- `lib/cn.ts` — `cn()` helper (clsx + tailwind-merge).
- `components/ui/eyebrow.tsx`
- `components/ui/heading.tsx` — CVA with display-xl / display / h1 / h2 + tone + align variants.
- `components/ui/container.tsx` — narrow / default / wide / full widths.
- `components/ui/prose.tsx` — `.prose-editorial` wrapper with optional `dropcap`.
- `components/motion/fade-up.tsx` — 600ms scroll-into-view, reduce-motion aware.
- `components/motion/image-reveal.tsx` — 1.2s clip-path wipe (4 directions).
- `components/motion/letter-stagger.tsx` — 800ms per-letter cascade, codepoint-safe split, ARIA label.
- `public/illustrations/{fennel,mint,citrus,leaf,sprig,root,seed,pestle}.svg` — 8 hand-coded line-art SVGs (DIY per user direction). 80×80 viewBox, `currentColor` stroke, 1.5px stroke-width, round caps/joins, no fills, < 700 B each.
- `app/kit/page.tsx` — visual QA page covering 9 color tokens, 8 type rows, primitives showcase, button variants, prose with drop-cap, all three motion components, 8 botanical SVGs, reduced-motion notice.
- `components/ui/button.tsx` — shadcn primitive rewritten to match plan §4.14 (ink/mauve/outline/ghost/link variants, sm/default/lg/icon sizes, mauve focus ring, cream offset, rounded-full).
- `components/ui/sheet.tsx`, `components/ui/accordion.tsx` — shadcn-generated, repointed to `@/lib/cn`. Left otherwise as-generated per plan ("styled in Phase 2 / Phase 3 where consumed").
- `components.json` — `aliases.utils` set to `@/lib/cn`.
- `pnpm-workspace.yaml` — `allowBuilds.msw` set to `false` (was placeholder string blocking installs).

## Files modified

- `app/page.tsx` — left as scaffold-default per plan; Phase 3 replaces it.

## Dependencies added

Direct: `motion`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`. Indirect via shadcn init: `radix-ui`, `tw-animate-css`, `@base-ui/react` (transitive — pulled by shadcn but not imported by our code), `shadcn` CLI as a dep.

## Verification (final run)

```
$ pnpm typecheck   →  exit 0  ($ tsc --noEmit, no output)
$ pnpm lint        →  exit 0  ($ eslint --max-warnings=0, no output)
$ pnpm format:check→  exit 0  (All matched files use Prettier code style!)
$ pnpm build       →  exit 0
                      Routes: ○ / · ○ /_not-found · ○ /kit
```

## Deviations from plan

1. **Next.js 16, not 15.** Plan was written pre-N16. Adapted; no functional change required (App Router, Turbopack, `next/font` work identically).
2. **`/kit` instead of `/_kit`.** In the App Router, an underscore-prefixed folder is treated as a *private folder* and excluded from routing entirely. The plan's claim that `/_kit` would route is incorrect. I dropped the underscore. Consequences: the page is publicly accessible at `/kit` until Phase 2 wires `robots.txt` exclusion (already noted in plan §5.11 for sitemap exclusion). No security implication — the page only renders the design system.
3. **shadcn CLI changed.** The current shadcn CLI (`shadcn@4.7.0`) ships *preset-driven* registries — the legacy `--style new-york` flag is gone. The closest Radix-based preset is `radix-nova`. I used that, then patched `components/ui/button.tsx` to exactly match the plan's CVA spec (mauve/ink/cream tokens). For Sheet and Accordion (which the plan says to keep as-generated), I added a shadcn-compat block of CSS variables in `globals.css` mapping `--color-popover`, `--color-foreground`, `--color-muted`, `--color-ring`, etc. into our brand palette so the generated primitives render on-brand. Import paths repointed from `@/lib/utils` to `@/lib/cn`. Sheet's close button size changed `icon-sm` → `icon` to match our restricted size variants.
4. **Botanical SVGs: DIY, not commissioned.** Per user direction. Hand-coded 8 single-stroke SVGs. They are tasteful placeholders; final art remains a Phase 6 polish task.
5. **`Inter` font axes.** `next/font/google` requires `weight` to be set when using `axes`. Plan's snippet matches what worked. Both fonts loaded with `display: "swap"`, variable axes (`opsz` for Inter, full `100–900` for Epilogue).
6. **`pnpm-workspace.yaml` `allowBuilds`.** The Phase 0 file shipped with `msw: set this to true or false` as a literal string — pnpm rejected install steps. Set to `false` (msw is not a dep we use; shadcn pulled it transitively somewhere via tw-animate-css?). Documented here.

## Skipped / stubbed

- **External services.** No Vercel, no API keys.
- **Final botanical illustrations.** Placeholders ship; final art deferred to Phase 6.
- **`/kit` exclusion from robots/sitemap.** Phase 2.
- **Sheet & Accordion brand styling.** Per plan, deferred to Phase 2 / Phase 3 when first consumed.

## Next phase ready

Phase 02 (Layout shell) inherits a working token system, font pipeline, primitives (`Heading`, `Eyebrow`, `Container`, `Prose`, `Button`), motion library (`FadeUp`, `ImageReveal`, `LetterStagger`), illustration set, and a `/kit` page to regress against. Visit `pnpm dev` → `http://localhost:3000/kit`.
