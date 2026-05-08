// components/marketing/journal/empty-state.tsx
//
// Editorial empty-state for /journal. Rendered when the catalogue has
// fewer than two published posts — keeps the page composed instead of
// staring at a single lonely card. Newsletter form mirrors the global
// footer markup (placeholder action /api/newsletter — wired for real in
// phase 12).

import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

function EmptyStateNewsletter() {
  return (
    <form
      action="/api/newsletter"
      method="post"
      className="flex w-full max-w-md items-center gap-3"
      aria-label="Journal newsletter signup"
    >
      <label htmlFor="journal-empty-email" className="sr-only">
        Email address
      </label>
      <input
        id="journal-empty-email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@inbox.com"
        className="border-ink/30 text-ink placeholder:text-ink/40 focus:border-mauve flex-1 rounded-none border-0 border-b bg-transparent px-0 py-2 text-[15px] focus:outline-none"
      />
      <input type="hidden" name="source" value="journal-empty-state" />
      <button
        type="submit"
        className="text-mauve hover:text-mauve-deep text-[15px] font-medium tracking-wide underline-offset-4 hover:underline"
      >
        Sign up →
      </button>
    </form>
  );
}

export function JournalEmptyState() {
  return (
    <section aria-label="Coming soon" className="bg-cream pb-[clamp(80px,10vw,144px)]">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-x-16">
          <div className="md:col-span-7">
            <Eyebrow>The journal</Eyebrow>
            <p className="font-display text-ink mt-6 text-[clamp(28px,3.5vw,44px)] leading-[1.1] font-medium tracking-[-0.02em]">
              New entries coming soon —
              <br />
              sign up for updates.
            </p>
            <p className="text-ink-soft mt-6 max-w-[58ch] text-[17px] leading-[1.6]">
              Short, useful notes from the clinic — on hormones, nutrition, and the small habits
              that actually move the needle. One letter, occasional Sundays, never spam.
            </p>

            <div className="mt-10">
              <EmptyStateNewsletter />
            </div>

            <p className="text-ink-soft mt-5 text-[13px] tracking-[0.04em]">
              Or{" "}
              <Link
                href="/contact"
                className="text-mauve hover:text-mauve-deep underline underline-offset-4"
              >
                send a question
              </Link>{" "}
              and Dr. Ruhma may answer it in the next entry.
            </p>
          </div>

          <aside className="md:col-span-5">
            <div className="bg-cream-deep flex aspect-[4/5] w-full flex-col items-center justify-center rounded-sm p-12 text-center">
              <Eyebrow>Coming soon</Eyebrow>
              <p className="font-display text-ink-soft mt-6 text-[clamp(22px,2vw,28px)] leading-[1.2] tracking-[-0.02em]">
                The first entries are being written.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
