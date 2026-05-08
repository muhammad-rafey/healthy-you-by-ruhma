// components/marketing/journal/category-chips.tsx
//
// Visual chip row above the post grid. Per phase 10 plan §4.8 we ship the
// chips as visual anchors only for v1 (deferred client-side filtering until
// the catalogue grows). Each chip renders as a small pill link so it's
// keyboard-reachable, but the href is a `?category=` query that the index
// route may later honour.

import Link from "next/link";

import type { JournalFrontmatter } from "@/lib/mdx";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp } from "@/components/motion/fade-up";
import { formatCategory } from "@/lib/journal-data";

interface CategoryChipsProps {
  categories: { value: JournalFrontmatter["category"]; label: string }[];
}

const FALLBACK: CategoryChipsProps["categories"] = [
  { value: "hormones", label: formatCategory("hormones") },
  { value: "nutrition", label: formatCategory("nutrition") },
  { value: "lifestyle", label: formatCategory("lifestyle") },
  { value: "recipes", label: formatCategory("recipes") },
];

export function CategoryChips({ categories }: CategoryChipsProps) {
  // If the catalogue only has one published category we still show a row
  // of editorial anchors so the section reads as scaffolded for growth.
  const items = categories.length >= 2 ? categories : FALLBACK;

  return (
    <section
      aria-labelledby="journal-categories-heading"
      className="bg-cream pt-[clamp(48px,6vw,96px)] pb-[clamp(24px,3vw,48px)]"
    >
      <Container>
        <FadeUp>
          <Eyebrow id="journal-categories-heading">Browse by</Eyebrow>
          <ul className="mt-6 flex flex-wrap gap-2" role="list">
            <li>
              <Link
                href="/journal"
                className="bg-ink text-cream rounded-full px-4 py-2 text-[13px] tracking-[0.04em] transition-colors"
              >
                All
              </Link>
            </li>
            {items.map((cat) => (
              <li key={cat.value}>
                <Link
                  href={`/journal?category=${cat.value}`}
                  className="bg-shell text-ink hover:bg-mauve hover:text-cream rounded-full px-4 py-2 text-[13px] tracking-[0.04em] transition-colors"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </FadeUp>
      </Container>
    </section>
  );
}
