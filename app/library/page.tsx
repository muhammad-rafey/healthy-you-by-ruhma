// app/library/page.tsx
//
// /library — editorial index of three guidebooks. Header (Eyebrow +
// Epilogue display title + subhead), then the alternating LibraryGrid,
// then a soft "Book a consultation" CTA band. All three MDX files are
// loaded server-side via loadLibrary() and rendered in eyebrow order
// (Guidebook 01 → 02 → 03).

import type { Metadata } from "next";

import { listSlugs, loadLibrary } from "@/lib/mdx";
import type { LibraryFrontmatter } from "@/lib/mdx";
import { site } from "@/content/site";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { FadeUp } from "@/components/motion/fade-up";

import { LibraryGrid } from "@/components/marketing/library/library-grid";
import { LibraryCtaBand } from "@/components/marketing/library/library-cta-band";

const PAGE_DESCRIPTION =
  "Three guidebooks. Practical, evidence-based, written for women who want answers — not another fad.";

export const metadata: Metadata = {
  title: `The Library · ${site.name}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/library" },
  openGraph: {
    title: `The Library · ${site.name}`,
    description: PAGE_DESCRIPTION,
    url: "/library",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `The Library · ${site.name}`,
    description: PAGE_DESCRIPTION,
  },
};

async function loadAllLibrary(): Promise<LibraryFrontmatter[]> {
  const slugs = await listSlugs("library");
  const docs = await Promise.all(slugs.map((s) => loadLibrary(s)));
  return docs.map((d) => d.frontmatter).sort((a, b) => a.eyebrow.localeCompare(b.eyebrow));
}

export default async function LibraryIndexPage() {
  const ebooks = await loadAllLibrary();

  return (
    <>
      <header
        aria-label="Library header"
        className="bg-cream pt-[clamp(96px,12vw,180px)] pb-[clamp(40px,6vw,96px)]"
      >
        <Container>
          <Eyebrow>The Library</Eyebrow>
          <LetterStagger
            as="h1"
            text="Three guidebooks."
            className="font-display text-ink mt-6 block max-w-[14ch] text-[clamp(48px,8vw,112px)] leading-[0.98] font-medium tracking-[-0.04em] text-balance"
          />
          <p className="text-ink-soft mt-8 max-w-[58ch] text-[clamp(17px,1.4vw,19px)] leading-[1.6] text-pretty">
            Practical, evidence-based, written for women who want answers — not another fad. Each
            one is the distilled version of conversations Dr. Ruhma has had with hundreds of
            clients.
          </p>
        </Container>
      </header>

      <FadeUp>
        <LibraryGrid ebooks={ebooks} />
      </FadeUp>

      <LibraryCtaBand />
    </>
  );
}
