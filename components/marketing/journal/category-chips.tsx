// components/marketing/journal/category-chips.tsx
//
// Chip row above the post grid. Each chip is a `?category=` link the
// /journal index now honours: clicking one filters the merged catalogue
// (MDX + Mongo) and the matching chip renders in the active style.

import Link from "next/link";

import type { JournalFrontmatter } from "@/lib/mdx";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp } from "@/components/motion/fade-up";
import { formatCategory } from "@/lib/journal-data";

const BASE_CHIP = "rounded-full px-4 py-2 text-[13px] tracking-[0.04em] transition-colors";
const ACTIVE_CHIP = "bg-ink text-cream";
const IDLE_CHIP = "bg-shell text-ink hover:bg-mauve hover:text-cream";

interface CategoryChipsProps {
  categories: { value: JournalFrontmatter["category"]; label: string }[];
  /** Currently filtered category, or undefined for the "All" view. */
  activeCategory?: string;
}

const FALLBACK: CategoryChipsProps["categories"] = [
  { value: "hormones", label: formatCategory("hormones") },
  { value: "nutrition", label: formatCategory("nutrition") },
  { value: "lifestyle", label: formatCategory("lifestyle") },
  { value: "recipes", label: formatCategory("recipes") },
];

export function CategoryChips({ categories, activeCategory }: CategoryChipsProps) {
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
                aria-current={activeCategory ? undefined : "page"}
                className={`${BASE_CHIP} ${activeCategory ? IDLE_CHIP : ACTIVE_CHIP}`}
              >
                All
              </Link>
            </li>
            {items.map((cat) => {
              const isActive = cat.value === activeCategory;
              return (
                <li key={cat.value}>
                  <Link
                    href={`/journal?category=${cat.value}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`${BASE_CHIP} ${isActive ? ACTIVE_CHIP : IDLE_CHIP}`}
                  >
                    {cat.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </FadeUp>
      </Container>
    </section>
  );
}
