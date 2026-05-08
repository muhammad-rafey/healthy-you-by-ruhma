# Phase 11 — Contact Page

## Files created

- `app/contact/page.tsx` — server component. Header (Eyebrow + `<LetterStagger>` "Let's talk." + lead), two-column form/details grid, FAQ. `Metadata` + JSON-LD `ContactPage` schema.
- `app/contact/actions.ts` — `'use server'` `submitContact` action. Validates with Zod, logs payload, returns `{status:'success'}` after 600ms delay. TODO(infra) Resend snippet kept ready to drop in.
- `app/contact/schema.ts` — shared Zod schema + `ContactState` discriminated union, used by RHF resolver and the action.
- `lib/contact-data.ts` — `CONTACT_TOPICS` (Diet Planning, Coaching, Consultation, PCOS / Hormonal, Weight Management, General) + 3-question `CONTACT_FAQ`.
- `components/marketing/contact/contact-form.tsx` — `'use client'`. RHF + zodResolver, `useActionState` + `useFormStatus`, server field-errors win. `AnimatePresence` cross-fade swap to a `role="status"` thank-you panel; "Send another" reloads `/contact`.
- `components/marketing/contact/contact-details.tsx` — Email mailto:, WhatsApp `wa.me/<digits>`, Instagram link (all from `content/site.ts`), response-time note, Lahore GMT+5 hours.
- `components/marketing/contact/contact-faq.tsx` — shadcn Accordion wired to `CONTACT_FAQ`.
- `components/marketing/contact/underline-{field,select,textarea}.tsx` — signature hand-drawn underline-only inputs. `border-b border-ink/40` baseline, `focus:border-mauve focus:border-b-2` thickens to mauve, error state uses `mauve-deep`. `aria-invalid`, `aria-describedby`, visible `<label>`s.

## Dependencies added

- `react-hook-form ^7.75.0`
- `@hookform/resolvers ^5.2.2`

`zod` was already present. `resend` not added — server action stubs it.

## Server-action stub

`submitContact(prev, formData)` parses with `contactSchema.safeParse`. Invalid → returns `{status:'error', message, fieldErrors}` keyed by field. Valid → `await delay(600)`, `console.log('[contact]', payload)`, returns `{status:'success'}`. A commented `// LIVE:` block holds the Resend snippet (api key, sender, replyTo, subject template). Marked `TODO(infra):`.

## Motion / a11y

- `<LetterStagger>` on h1, two `<FadeUp>` wrappers (delays 0.1 / 0.25) on form/details columns, one on the FAQ. Submit success cross-fade via `motion.div` + `AnimatePresence` (no raw motion outside this swap).
- Single h1, all fields have visible labels (uppercase eyebrow style), errors use `aria-describedby`/`aria-invalid`, success panel has `role="status"`, error message has `role="alert"`.

## Verification

- `pnpm typecheck` — clean.
- `pnpm lint` — clean (single `no-console` disabled inline at the stub `console.log` with rationale).
- `pnpm format:check` — clean.
- `pnpm build` — clean. `/contact` listed as static (○).
- `pnpm start` on port 3789, `curl /contact` → `200`, contains "Let's talk", labels Name/Email/Topic/Message, all 3 FAQ questions, `info@dietitianruhma.com`, `wa.me`, `ruhma_nazeer`, "Lahore, Pakistan", `ContactPage` JSON-LD. Server killed.
- Curl POST returned 500 ("Failed to find Server Action") — expected; server actions need the Next-supplied action ID header. Build is green and that was the assigned acceptance bar for the loose POST test.

## Deviations from `plan/11-contact.md`

- No Resend integration, no `resend` package, no `RESEND_API_KEY`/`CONTACT_TO_EMAIL` env wiring (per task constraints).
- No rate limiter, no honeypot field — both are part of the full plan but out of scope for the stub. The TODO block flags both as future work.
- Topic enum follows the assignment list (Diet Planning, Coaching, Consultation, PCOS / Hormonal, Weight Management, General) rather than the plan's draft list (which included Speaking/Press).
- Newsletter opt-in checkbox added per assignment; not in the original plan schema.
- Map embed omitted — no public practice address (graceful skip per assignment).
- Sitemap already lists `/contact`; no change needed.
