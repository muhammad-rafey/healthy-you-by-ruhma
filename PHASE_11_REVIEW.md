# Phase 11 — Contact · Review

## Verdict

PASS.

## Gates

- `pnpm typecheck` — clean.
- `pnpm lint` — 0 warnings (one inline `no-console` disable on the stub log,
  rationale tied to the `TODO(infra)` Resend wiring).
- `pnpm format:check` — clean.
- `pnpm build` — green; `/contact` prerendered as static (`○`).

## Runtime

- `pnpm start -p 3789`, `curl /contact` → 200. Body contains "Let’s talk",
  visible labels Name/Email/Topic/Message, all 3 FAQ questions ("How
  quickly…", "Before you write", "book a consultation"),
  `info@dietitianruhma.com`, `wa.me`, `ruhma_nazeer`. JSON-LD
  `ContactPage` script tag emitted.
- Single `<h1>` ("Let’s talk."); FAQ uses `<h2>`. No second h1.

## Spot-checks

- `app/contact/page.tsx` — two-column grid `lg:grid-cols-[1.4fr_1fr]`,
  form first / details second; FAQ stacked below.
- `underline-{field,select,textarea}.tsx` — `border-0 border-b
  border-ink/40`, `focus:border-mauve focus:border-b-2`, error uses
  `border-mauve-deep`. No bordered boxes, no fills. Caret on select is
  inline-SVG (no native chrome).
- `app/contact/actions.ts` — `'use server'`, `contactSchema.safeParse`,
  per-field error mapping, discriminated `ContactState` returned to
  `useActionState`.
- `aria-invalid` and `aria-describedby` wired conditionally on all three
  underline components; error message rendered with stable id.
- All visible field labels (uppercase eyebrow), no placeholder-only
  fields. No raw hex in component sources.

## Deviations accepted

Resend stubbed, no rate-limit/honeypot, map omitted, topic list +
newsletter opt-in adjusted — per task brief.

## Notes

`contact-form.tsx` imports `motion, AnimatePresence, useReducedMotion`
from `motion/react` for the success cross-fade. Page-level motion still
uses DS `LetterStagger` / `FadeUp`; the form-internal swap is a
contained, reduced-motion-aware exception, not a structural break.
