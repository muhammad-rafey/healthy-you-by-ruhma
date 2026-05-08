// components/marketing/legal/legal-page.tsx
//
// Plain typographic shell for /legal/[slug] pages. Per master §3.13:
//   1. Eyebrow ("Legal")
//   2. H1 (Epilogue) — kept smaller than marketing pages: clamp 32–56px
//   3. Last-updated caption with semantic <time datetime="…">
//   4. Body rendered inside <Prose> (single column, max-width 720px)
//
// Motion is intentionally minimal: header fades up, body fades up — that's it.
// No dropcap, no images, no botanical SVGs, no JSON-LD.

import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Prose } from "@/components/ui/prose";
import { FadeUp } from "@/components/motion/fade-up";

interface LegalPageProps {
  title: string;
  /** ISO date string, e.g. "2026-05-08". Drives <time datetime>. */
  lastUpdated: string;
  children: ReactNode;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  const formatted = dateFormatter.format(new Date(`${lastUpdated}T00:00:00Z`));

  return (
    <article className="bg-cream text-ink-soft">
      <Container>
        <header className="mx-auto max-w-[720px] pt-[clamp(72px,12vw,144px)] pb-10 md:pb-12">
          <FadeUp>
            <Eyebrow>Legal</Eyebrow>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h1 className="font-display text-ink mt-6 text-[clamp(32px,5vw,56px)] leading-[1.1] font-medium tracking-[-0.02em]">
              {title}
            </h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className="type-caption text-ink-soft/70 mt-6">
              Last updated <time dateTime={lastUpdated}>{formatted}</time>
            </p>
          </FadeUp>
        </header>

        <FadeUp delay={0.1}>
          <div className="mx-auto max-w-[720px] pb-[clamp(72px,10vw,128px)]">
            <Prose>{children}</Prose>

            <p className="text-ink-soft/80 mt-16 text-[15px] leading-relaxed">
              If you have questions about this page, please{" "}
              <Link
                href="/contact"
                className="text-mauve hover:text-mauve-deep underline decoration-1 underline-offset-[3px] transition-colors"
              >
                contact us
              </Link>
              .
            </p>
          </div>
        </FadeUp>
      </Container>
    </article>
  );
}
