# 11 — Contact page (`/contact`)

> Implements master plan §3.12. The Contact page is the single conversion-focused
> page on the marketing site. It must feel low-friction: the form is the centerpiece
> but the visual treatment must not feel like a sales funnel. Hand-drawn underline
> fields, generous whitespace, an Epilogue title, and a warm response-time note
> set the tone. No popovers, no toasts, no autoplay anything.

---

## 1. Goal

Ship a working `/contact` page that:

1. Renders a two-column layout: form on the left, contact details on the right
   (stacked on mobile: form first, details below).
2. Uses **hand-drawn underline-only** form fields — no bordered boxes, no
   filled backgrounds. This is the page's signature move.
3. Submits via a Next.js **server action** that validates with Zod and sends the
   message through **Resend**.
4. Has a working **success state** (form is replaced by an Epilogue thank-you and
   a "Send another" link), an **inline error state**, an in-memory **rate
   limiter** (3/hour/IP), and a **honeypot** spam field.
5. Includes contact details (email, WhatsApp placeholder, Instagram placeholder,
   response-time note) and a 3-question FAQ.
6. Has per-page metadata, JSON-LD `ContactPage` schema, and zero CLS.

Out of scope: CRM integration, ticket creation, file uploads, multi-step forms,
booking widgets — those are explicitly handled elsewhere or deferred.

---

## 2. Pre-requisites

This plan depends on:

- **`01-design-system.md`** — tokens (`--ink`, `--mauve`, `--paper`, `--cream`),
  font variables (`--font-inter`, `--font-epilogue`), the `<Heading>` component,
  spacing scale, and the `cn()` utility.
- **`02-layout-shell.md`** — the global `<Nav>`/`<Footer>` and the `<Container>`
  wrapper. The contact page does not introduce its own header chrome.

If those tokens or components are not in place, stop here and finish those plans
first. Do not stub them inside the contact page.

---

## 3. Dependencies

Add to `package.json` (if not already present from earlier plans):

```bash
pnpm add react-hook-form @hookform/resolvers zod resend
```

| Package               | Why                                                                          |
| --------------------- | ---------------------------------------------------------------------------- |
| `react-hook-form`     | Client-side form state. Uncontrolled by default, low re-render cost.         |
| `@hookform/resolvers` | Bridges Zod into RHF.                                                        |
| `zod`                 | Single source of truth for the schema; reused on the server.                 |
| `resend`              | Transactional email. We send to `CONTACT_TO_EMAIL`, no inbox needed locally. |

We rely on built-ins for everything else:

- `useFormStatus` from `react-dom` for the pending state on the submit button.
- `useActionState` (renamed from `useFormState`) from `react` for the action's
  return value, so we can render the inline error / success state without
  reaching for a toast library.

---

## 4. Files to create / modify

### 4.1 Files created by this plan

```
app/contact/page.tsx                         # server component, layout + JSON-LD
app/contact/actions.ts                       # 'use server' — validate + Resend
app/contact/schema.ts                        # shared Zod schema + types
components/marketing/contact/ContactForm.tsx # 'use client' — RHF + fields
components/marketing/contact/ContactDetails.tsx
components/marketing/contact/ContactFAQ.tsx
components/marketing/contact/UnderlineField.tsx
components/marketing/contact/UnderlineSelect.tsx
components/marketing/contact/UnderlineTextarea.tsx
lib/rate-limit.ts                            # tiny Map-based limiter
```

### 4.2 Files modified

- `.env.example` — add `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.
- `app/sitemap.ts` — ensure `/contact` is listed (likely already is from
  plan 02; double-check).
- `next.config.ts` — no changes expected.

### 4.3 Environment variables

```dotenv
# .env.example
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=info@dietitianruhma.com
```

`CONTACT_TO_EMAIL` defaults to `info@dietitianruhma.com` in code so that local
dev still works with only `RESEND_API_KEY` set.

---

## 5. Concrete code

### 5.1 `app/contact/schema.ts`

Shared Zod schema. Imported by both the client form and the server action so
validation rules cannot drift.

```ts
// app/contact/schema.ts
import { z } from "zod";

export const TOPICS = [
  "General",
  "Diet Planning",
  "Coaching",
  "Consultation",
  "Speaking",
  "Press",
] as const;

export type Topic = (typeof TOPICS)[number];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share your name.")
    .max(80, "That looks too long — keep it under 80 characters."),
  email: z.string().trim().email("That email does not look right.").max(160),
  topic: z.enum(TOPICS, {
    errorMap: () => ({ message: "Pick a topic so we can route this correctly." }),
  }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(2000, "Please keep it under 2000 characters."),
  // Honeypot — must be empty. Real users never see this field.
  website: z.string().max(0).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<keyof ContactInput, string>> };

export const initialContactState: ContactState = { status: "idle" };
```

### 5.2 `lib/rate-limit.ts`

In-memory limiter. Production will swap this for Upstash Redis (see §7).

```ts
// lib/rate-limit.ts
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  /** Max requests in the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export function rateLimit(
  key: string,
  opts: RateLimitOptions,
): {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count, retryAfterMs: 0 };
}

// Periodically prune expired buckets so the Map does not grow unbounded.
// Runs at most once per minute and only when the action is called.
let lastPruneAt = 0;
export function pruneExpiredBuckets(): void {
  const now = Date.now();
  if (now - lastPruneAt < 60_000) return;
  lastPruneAt = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}
```

### 5.3 `app/contact/actions.ts`

```ts
// app/contact/actions.ts
"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { contactSchema, type ContactState } from "./schema";
import { rateLimit, pruneExpiredBuckets } from "@/lib/rate-limit";

const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 3;

function getClientIp(headerList: Headers): string {
  // Vercel sets x-forwarded-for as a comma-separated list; take the first.
  const fwd = headerList.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = headerList.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  pruneExpiredBuckets();

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactState extends { fieldErrors?: infer F } ? F : never = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        // @ts-expect-error — narrowing handled by Zod's known keys
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // Honeypot trip — silently succeed so bots think they got through.
  if (data.website && data.website.length > 0) {
    return { status: "success" };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);
  const limit = rateLimit(`contact:${ip}`, { limit: MAX_PER_HOUR, windowMs: HOUR_MS });
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterMs / 60_000);
    return {
      status: "error",
      message: `You have sent a few messages already. Please try again in about ${minutes} minute${
        minutes === 1 ? "" : "s"
      }.`,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? "info@dietitianruhma.com";

  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not set.");
    return {
      status: "error",
      message:
        "The form is temporarily unavailable. Please email us directly at info@dietitianruhma.com.",
    };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      // `from` must use a domain verified in Resend. Until cutover, use the
      // sandbox onboarding sender — it works in dev but only delivers to the
      // owning Resend account inbox.
      from: "Healthy You Contact <contact@mail.dietitianruhma.com>",
      to: [to],
      replyTo: data.email,
      subject: `[${data.topic}] ${data.name} via dietitianruhma.com`,
      text: [
        `From: ${data.name} <${data.email}>`,
        `Topic: ${data.topic}`,
        `IP: ${ip}`,
        "",
        data.message,
      ].join("\n"),
    });

    if (error) {
      console.error("[contact] resend error:", error);
      return {
        status: "error",
        message:
          "Something went wrong sending your message. Please try again or email info@dietitianruhma.com.",
      };
    }

    return { status: "success" };
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return {
      status: "error",
      message: "Something went wrong. Please try again in a moment.",
    };
  }
}
```

Notes on the action:

- It is the **only** entry point — there is no `/api/contact` route. Server actions
  cover the conversion-from-progressive-form path natively.
- The honeypot returns success on trip so bots don't learn that the trap fired.
- IP detection prefers `x-forwarded-for[0]`; on Vercel this is the original client.
- The `from` address must use a domain verified in Resend. See §6 for the
  domain-verification step (must happen before launch).

### 5.4 `components/marketing/contact/UnderlineField.tsx`

A reusable label+input pair. Same component covers `name` and `email`; the
textarea and select get their own thin wrappers so they can keep the same
visual contract.

```tsx
// components/marketing/contact/UnderlineField.tsx
"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface UnderlineFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Visually hide the field. Used for the honeypot. */
  hidden?: boolean;
}

export const UnderlineField = forwardRef<HTMLInputElement, UnderlineFieldProps>(
  function UnderlineField({ label, error, hidden, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;

    if (hidden) {
      // Honeypot: present in the DOM, off-screen, no tab stop.
      return (
        <div
          aria-hidden="true"
          className="absolute top-auto left-[-9999px] h-px w-px overflow-hidden"
        >
          <label htmlFor={fieldId}>{label}</label>
          <input ref={ref} id={fieldId} tabIndex={-1} autoComplete="off" {...rest} />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-ink/70 font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            "border-ink border-0 border-b bg-transparent py-2 outline-none",
            "text-ink placeholder:text-ink/40 font-[family-name:var(--font-inter)] text-base",
            "focus:border-mauve transition-colors focus:border-b-2",
            error && "border-rust border-b-2",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-rust text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
```

### 5.5 `components/marketing/contact/UnderlineSelect.tsx`

```tsx
// components/marketing/contact/UnderlineSelect.tsx
"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { TOPICS } from "@/app/contact/schema";

interface UnderlineSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const UnderlineSelect = forwardRef<HTMLSelectElement, UnderlineSelectProps>(
  function UnderlineSelect({ label, error, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-ink/70 font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            "border-ink appearance-none border-0 border-b bg-transparent py-2 pr-6 outline-none",
            "text-ink font-[family-name:var(--font-inter)] text-base",
            "focus:border-mauve transition-colors focus:border-b-2",
            // Custom caret using a background-image arrow so we don't reintroduce a box.
            "bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='%231a1a1a' d='M2 4l4 4 4-4z'/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_2px_center] bg-no-repeat",
            error && "border-rust border-b-2",
            className,
          )}
          {...rest}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {error ? (
          <p id={`${fieldId}-error`} className="text-rust text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
```

### 5.6 `components/marketing/contact/UnderlineTextarea.tsx`

```tsx
// components/marketing/contact/UnderlineTextarea.tsx
"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface UnderlineTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const UnderlineTextarea = forwardRef<HTMLTextAreaElement, UnderlineTextareaProps>(
  function UnderlineTextarea({ label, error, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-ink/70 font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          rows={6}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={cn(
            "border-ink resize-y border-0 border-b bg-transparent py-2 outline-none",
            "text-ink placeholder:text-ink/40 font-[family-name:var(--font-inter)] text-base",
            "focus:border-mauve transition-colors focus:border-b-2",
            error && "border-rust border-b-2",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={`${fieldId}-error`} className="text-rust text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
```

### 5.7 `components/marketing/contact/ContactForm.tsx`

```tsx
// components/marketing/contact/ContactForm.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { submitContact } from "@/app/contact/actions";
import {
  contactSchema,
  initialContactState,
  type ContactInput,
  type ContactState,
} from "@/app/contact/schema";
import { UnderlineField } from "./UnderlineField";
import { UnderlineSelect } from "./UnderlineSelect";
import { UnderlineTextarea } from "./UnderlineTextarea";
import { cn } from "@/lib/cn";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-mauve text-paper mt-2 w-full px-8 py-3 transition-opacity sm:w-auto",
        "font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    initialContactState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      topic: "General",
      message: "",
      website: "",
    },
  });

  // After a successful server response, reset the RHF state so a "Send another"
  // click returns the form to a clean state.
  useEffect(() => {
    if (state.status === "success") {
      reset();
    }
  }, [state.status, reset]);

  // Server-returned per-field errors trump client errors (the server is canonical).
  const fieldError = (name: keyof ContactInput) =>
    (state.status === "error" && state.fieldErrors?.[name]) || errors[name]?.message;

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-ink font-[family-name:var(--font-epilogue)] text-3xl sm:text-4xl">
          Thank you. Your message is on its way.
        </h2>
        <p className="text-ink/80 max-w-md font-[family-name:var(--font-inter)] text-base">
          We read every note personally. You will hear back within 1–2 business days.
        </p>
        <button
          type="button"
          onClick={() => {
            // Reload-free reset: the action state is held in this client component,
            // so navigating away-and-back is unnecessary. We simply trigger a re-mount
            // of the form by dispatching a synthetic reset.
            formRef.current?.reset();
            // Force the action state back to idle by re-submitting an empty
            // form? Better: a Link-style refresh. Use Next router refresh:
            window.location.assign("/contact");
          }}
          className="text-mauve self-start font-[family-name:var(--font-inter)] text-sm tracking-wider uppercase underline-offset-4 hover:underline"
        >
          Send another →
        </button>
        <p className="text-ink/60 font-[family-name:var(--font-inter)] text-sm">
          Or head back to the{" "}
          <Link href="/" className="underline-offset-4 hover:underline">
            home page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-8">
      <UnderlineField
        label="Name"
        autoComplete="name"
        required
        error={fieldError("name")}
        {...register("name")}
      />

      <UnderlineField
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={fieldError("email")}
        {...register("email")}
      />

      <UnderlineSelect label="Topic" error={fieldError("topic")} {...register("topic")} />

      <UnderlineTextarea
        label="Message"
        required
        minLength={20}
        maxLength={2000}
        error={fieldError("message")}
        {...register("message")}
      />

      {/* Honeypot — visually hidden, must remain empty. */}
      <UnderlineField
        label="Website"
        hidden
        autoComplete="off"
        tabIndex={-1}
        {...register("website")}
      />

      <div className="flex flex-col gap-3">
        <SubmitButton />
        {state.status === "error" ? (
          <p role="alert" className="text-rust font-[family-name:var(--font-inter)] text-sm">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
```

### 5.8 `components/marketing/contact/ContactDetails.tsx`

```tsx
// components/marketing/contact/ContactDetails.tsx
import Link from "next/link";

// TODO(content): replace placeholders before launch.
const WHATSAPP_DIGITS = "00000000000"; // wa.me/<digits>
const INSTAGRAM_HANDLE = "dietitianruhma"; // TBD — confirm with Ruhma

export function ContactDetails() {
  return (
    <aside className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <p className="text-ink/60 font-[family-name:var(--font-inter)] text-xs tracking-wider uppercase">
          Email
        </p>
        <Link
          href="mailto:info@dietitianruhma.com"
          className="text-ink font-[family-name:var(--font-epilogue)] text-2xl underline-offset-4 hover:underline"
        >
          info@dietitianruhma.com
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-ink/60 font-[family-name:var(--font-inter)] text-xs tracking-wider uppercase">
          WhatsApp
        </p>
        <Link
          href={`https://wa.me/${WHATSAPP_DIGITS}`}
          className="text-ink font-[family-name:var(--font-epilogue)] text-2xl underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Message on WhatsApp
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-ink/60 font-[family-name:var(--font-inter)] text-xs tracking-wider uppercase">
          Instagram
        </p>
        <Link
          href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
          className="text-ink font-[family-name:var(--font-epilogue)] text-2xl underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @{INSTAGRAM_HANDLE}
        </Link>
      </div>

      <p className="text-ink/70 max-w-sm font-[family-name:var(--font-inter)] text-sm leading-relaxed">
        Within 1–2 business days. For urgent dietary questions, please book a consultation.
      </p>
    </aside>
  );
}
```

### 5.9 `components/marketing/contact/ContactFAQ.tsx`

Three short Q&As. Plain `<details>` keeps it accessible without an extra
component dep — the design is typographic anyway.

```tsx
// components/marketing/contact/ContactFAQ.tsx
const FAQ = [
  {
    q: "How quickly will I hear back?",
    a: "Within 1–2 business days. If the topic is urgent or clinical, please book a consultation directly — the inbox is not monitored on weekends.",
  },
  {
    q: "What should I include in my message?",
    a: "A short note about your goal, any conditions or restrictions, and what kind of support you are looking for. The more concrete, the better the first reply.",
  },
  {
    q: "When should I book a consultation instead?",
    a: "If you need a tailored plan, are managing a specific condition (PCOS, diabetes, post-partum, etc.), or want recurring coaching. The contact form is best for general questions and partnerships.",
  },
];

export function ContactFAQ() {
  return (
    <section aria-labelledby="contact-faq-title" className="flex flex-col gap-8">
      <h2
        id="contact-faq-title"
        className="text-ink font-[family-name:var(--font-epilogue)] text-3xl sm:text-4xl"
      >
        Before you write
      </h2>
      <ul className="divide-ink/15 border-ink/15 flex flex-col divide-y border-y">
        {FAQ.map((item) => (
          <li key={item.q}>
            <details className="group py-5">
              <summary className="text-ink flex cursor-pointer list-none items-center justify-between gap-6 font-[family-name:var(--font-inter)] text-base">
                {item.q}
                <span aria-hidden className="text-ink/50 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-ink/75 mt-3 max-w-prose font-[family-name:var(--font-inter)] text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### 5.10 `app/contact/page.tsx`

```tsx
// app/contact/page.tsx
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ContactForm } from "@/components/marketing/contact/ContactForm";
import { ContactDetails } from "@/components/marketing/contact/ContactDetails";
import { ContactFAQ } from "@/components/marketing/contact/ContactFAQ";

export const metadata: Metadata = {
  title: "Contact — Healthy You by Ruhma",
  description:
    "Get in touch about diet planning, coaching, consultations, speaking, or press. Replies within 1–2 business days.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Let's talk — Healthy You by Ruhma",
    description: "Get in touch about diet planning, coaching, consultations, speaking, or press.",
    url: "/contact",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact — Healthy You by Ruhma",
  url: "https://dietitianruhma.com/contact",
  description:
    "Contact form and details for Healthy You by Ruhma. Topics include diet planning, coaching, consultations, speaking, and press.",
  mainEntity: {
    "@type": "Organization",
    name: "Healthy You by Ruhma",
    email: "info@dietitianruhma.com",
    url: "https://dietitianruhma.com",
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="py-20 sm:py-28">
        <header className="mb-16 max-w-2xl">
          <p className="text-ink/60 font-[family-name:var(--font-inter)] text-xs tracking-[0.2em] uppercase">
            Contact
          </p>
          <h1 className="text-ink mt-4 font-[family-name:var(--font-epilogue)] text-5xl leading-tight sm:text-6xl">
            Let&rsquo;s talk.
          </h1>
          <p className="text-ink/75 mt-6 max-w-xl font-[family-name:var(--font-inter)] text-base leading-relaxed">
            Tell us a little about what you&rsquo;re working on and we&rsquo;ll reply with the right
            next step.
          </p>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-24">
          <ContactForm />
          <ContactDetails />
        </div>

        <div className="mt-28 max-w-3xl">
          <ContactFAQ />
        </div>
      </Container>
    </>
  );
}
```

### 5.11 Map (optional, deferred)

The master plan says: _"Embedded map (optional — only if there's a real practice
address)."_ Skip it. Do not add a Google Maps embed unless Ruhma confirms a
public practice address. Tracking-heavy embeds violate the page's quiet tone
and add a privacy footnote we don't want. If/when an address is confirmed, add
a `<MapEmbed />` block between `<ContactDetails />` and `<ContactFAQ />` using
OpenStreetMap's `iframe` (no cookies, no API key) — that is a separate ticket.

---

## 6. Step-by-step tasks

Run these in order. The Resend domain step is the one that catches teams off
guard at launch — flag it on day one.

1. **Install dependencies** (§3). Verify `pnpm-lock.yaml` updates cleanly.
2. **Update `.env.example`** with `RESEND_API_KEY` and `CONTACT_TO_EMAIL`.
   Add real values to `.env.local` (use a free Resend account for dev).
3. **Create the schema** at `app/contact/schema.ts`. Add a Vitest unit test
   that asserts a known-good payload parses and that each error path produces
   the expected message.
4. **Create the rate-limit helper** at `lib/rate-limit.ts`. Add a Vitest test
   that simulates 4 calls with the same key and asserts the 4th returns
   `ok: false` with a positive `retryAfterMs`.
5. **Create the underline field components** (`UnderlineField`,
   `UnderlineSelect`, `UnderlineTextarea`). Eyeball them on a Storybook stub
   page (or a throwaway `/preview` route) to confirm focus shifts the border
   to mauve and thickens to 2px.
6. **Create `ContactForm.tsx`**. Wire RHF + Zod resolver. Confirm:
   - Empty submit triggers RHF errors on blur, not on first render.
   - Server response with `fieldErrors` overrides RHF errors (server is canon).
   - `useFormStatus` flips the button label to "Sending…" while pending.
7. **Create `ContactDetails.tsx`** and `ContactFAQ.tsx`. Mark TBD numbers
   with a clear `TODO(content)` comment so they show up in repo grep.
8. **Create the server action** at `app/contact/actions.ts`. Test paths:
   - Valid payload → success.
   - Bad email → `error` with `fieldErrors.email` set.
   - Honeypot filled → `success` (no email sent).
   - 4th submit within an hour from the same IP → `error` with retry-after copy.
9. **Wire it into `app/contact/page.tsx`** with metadata and JSON-LD.
10. **Manual end-to-end test** in dev:
    - Submit a happy-path message, confirm Resend dashboard shows the send and
      the inbox receives it.
    - Submit an invalid email, confirm inline error renders.
    - Submit four times quickly, confirm rate-limit message shows on the 4th.
    - Submit with the honeypot pre-filled (via DevTools), confirm success state
      renders without the action calling `resend.emails.send`.
11. **Resend domain verification (pre-launch, blocking)**:
    1. In the Resend dashboard, add `dietitianruhma.com` (or
       `mail.dietitianruhma.com` as a subdomain).
    2. Add the SPF, DKIM, and DMARC records to the DNS zone.
    3. Wait for verification (usually under an hour).
    4. Update the action's `from` address from the sandbox sender to a real
       `contact@mail.dietitianruhma.com` once verified.
    5. Send a final test from production preview before merging to `main`.
12. **Accessibility pass**:
    - Tab through every field — focus ring or thick mauve underline must be
      visible at all times.
    - Hit Submit with no fields filled, confirm screen reader announces the
      first error.
    - Confirm the success state's `role="alert"` (or live region) is read out.
13. **Lighthouse**: target ≥95 on Performance, Accessibility, Best Practices,
    SEO. JSON-LD must validate against the Rich Results Test.

---

## 7. Acceptance criteria

The page is "done" when **all** of the following hold:

1. `app/contact/page.tsx` renders the two-column layout above the FAQ on
   ≥`lg` screens, and a single stacked column on mobile (form first).
2. All four fields use the underline-only treatment with 1px `--ink` border,
   2px `--mauve` border on focus, no boxes, no fills.
3. Submitting a valid form sends a real email via Resend to
   `CONTACT_TO_EMAIL`, with `replyTo` set to the user's address.
4. Submitting an invalid form shows inline per-field errors (no toast).
5. The submit button label flips to "Sending…" via `useFormStatus`.
6. After a successful submit, the form is replaced by an Epilogue thank-you
   message and a "Send another" link that returns the form to its initial
   state.
7. The 4th submission from the same IP within one hour returns a polite
   rate-limit message; the 1st–3rd succeed.
8. The honeypot field, if filled, returns the success state without calling
   Resend.
9. Page metadata and `ContactPage` JSON-LD render in the response HTML.
10. Lighthouse Accessibility score ≥95; the form is fully usable with
    keyboard alone.
11. `pnpm build` and `pnpm typecheck` pass with no warnings tied to this page.
12. `.env.example` lists both new variables.

---

## 8. Out of scope

The following are **explicitly not** part of this plan:

- **CRM integration** (HubSpot, Pipedrive, etc.) — defer until volume warrants.
- **Ticket/helpdesk creation** (Front, Help Scout) — same.
- **Newsletter double-opt-in** on the contact form — newsletter has its own
  surface (handled by the Buttondown embed elsewhere).
- **File uploads** (intake forms, lab results) — handled inside the
  consultation booking flow, not here.
- **Calendly / Cal.com booking widget** — the right column is for contact
  details only; booking lives on the Services page.
- **Production-grade rate limiting** — the in-memory `Map` limiter is
  intentionally simple. Before scaling beyond a single Vercel region, swap
  `lib/rate-limit.ts` for an Upstash Redis–backed limiter (`@upstash/ratelimit`
  - `@upstash/redis`). Same interface, drop-in replacement.
- **Internationalization** — single-locale (en) for now.
- **Captcha** (hCaptcha, Turnstile) — honeypot + rate-limit are sufficient at
  this volume. Revisit if spam becomes an issue.

---

## 9. Notes for the executor

- The submit button's "Send another" handler intentionally uses
  `window.location.assign('/contact')` instead of `router.refresh()`. The
  `useActionState` hook holds the `success` state until the page navigates;
  a true reload is the simplest way to drop it. If you'd prefer, replace it
  with a `useState` toggle that conditionally renders the form again — both
  are fine, the reload version is just less code.
- The select uses a CSS-only caret. Do **not** add `appearance: auto` back —
  the native chrome reintroduces a box and breaks the visual contract.
- Keep server logs at `console.error` only for failures. Do not log message
  bodies (PII).
- The action's `from` placeholder (`contact@mail.dietitianruhma.com`) will
  fail to send until the domain is verified in Resend. Until then, use the
  Resend sandbox sender (`onboarding@resend.dev`) and accept that delivery
  is restricted to the Resend account's owner inbox in dev.
