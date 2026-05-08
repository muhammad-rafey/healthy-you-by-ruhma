# Phase 09 Report — Library

## Files

### Routes

- `app/library/page.tsx` — editorial index, header + alternating grid + CTA band.
- `app/library/[slug]/page.tsx` — detail page with `generateStaticParams`/`generateMetadata`, `Product` JSON-LD, full editorial layout. `dynamicParams = false`.

### Helpers

- `lib/library-data.ts` — `formatPKR`, `computeSavings`, `derivePlatformLabel`, `isPlaceholderBuyUrl`, plus shared `LIBRARY_FAQ`, `AUTHOR_BIO`, `AUTHOR_PORTRAIT`. Frontmatter validation already lives in `lib/content/types.ts` (`LibraryFrontmatter`) so a duplicate Zod schema was not added.

### Components (`components/marketing/library/`)

- `library-grid.tsx` — server, three alternating editorial cards (subtle ±1.5° rotation, neutralised on hover and under `prefers-reduced-motion`).
- `ebook-hero.tsx` — client, split hero with mouse-position 3D tilt (max 4° per axis), `<ImageReveal>` cover, `<LetterStagger>` title.
- `ebook-toc.tsx` — server, mauve Epilogue numerals (`01`, `02`…), shows first 8 with "…and N more chapters inside" tail.
- `sample-spreads.tsx` — server, mobile snap-rail / desktop 3-col, CSS hover-scale.
- `author-card.tsx` — server, portrait (`/media/about/portrait-secondary-800.webp`) + 2-paragraph bio + link to `/about`.
- `ebook-faq.tsx` — shadcn `Accordion`, 5 shared ebook questions.
- `related-ebooks.tsx` — server, the other two ebooks as compact cards.
- `library-cta-band.tsx` — "Book a consultation" closing band.
- `buy-button.tsx` — client, derives platform label from host or renders disabled-style "Coming soon · In production" chip.

## buyUrl placeholder handling

The three MDX files ship `https://example.com/buy/<slug>` per Phase 03. `isPlaceholderBuyUrl()` flags any URL whose host matches `example.com` (or `TODO_FILL_LATER` / empty). When placeholder, `BuyButton` renders a non-clickable `<span role="button" tabIndex={-1} aria-disabled="true">` styled in cream-deep with the label "Coming soon · In production", and the hero swaps the helper line to "Real publisher links land before launch — book a consultation in the meantime." JSON-LD also drops `offers.url` and switches `availability` to `PreOrder` for placeholder URLs. When real publisher URLs replace the placeholders, the same code automatically renders the real anchor with `target="_blank" rel="noopener noreferrer"` and a "Buy on Gumroad/Lemon Squeezy/…" label — no further code changes needed.

## Verification

- `pnpm run ci` (typecheck + lint + format:check + build) all green.
- Build prerendered `/library` plus `/library/{diabetes-essentials,pcos-guidebook,skin-secrets}` as SSG (`●`).
- `curl` against `pnpm start`: `/library` → 200, contains "Library", "Three guidebooks", all three titles, "Open", "→". Each detail route → 200, contains its title, "Guidebook 0X", price, TOC numerals, "About the author", "Dr. Ruhma". `/library/pcos-guidebook` shows both `PKR 1,500` and `PKR 3,000` with "Save PKR" chip.
- Server stopped after verification.

## Deviations

- `LibraryFrontmatter` was reused from Phase 03's `lib/content/types.ts` rather than redefining a Phase-09-local Zod schema.
- Plausible click tracking is intentionally omitted — the placeholder buyUrls would only fire dead-link events. The Buy CTA still has all the required `target="_blank"`/`rel` attrs on real URLs.
- Phase 09 plan referenced a Plausible global; left unwired so non-placeholder rollout doesn't carry vestigial telemetry.
