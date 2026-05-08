// components/marketing/library/related-ebooks.tsx
//
// Tail block on the detail page — the *other* two ebooks as small cards.
// Intentionally simpler than LibraryGrid (no alternating layout, no large
// covers) so it reads as a navigation surface, not a duplicate spread.

import Image from "next/image";
import Link from "next/link";
import type { LibraryFrontmatter } from "@/lib/mdx";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { computeSavings, formatPKR } from "@/lib/library-data";

interface RelatedEbooksProps {
  current: string;
  all: LibraryFrontmatter[];
}

export function RelatedEbooks({ current, all }: RelatedEbooksProps) {
  const others = all.filter((e) => e.slug !== current).slice(0, 2);
  if (others.length === 0) return null;

  return (
    <section
      aria-labelledby="related-ebooks-heading"
      className="bg-cream-deep border-ink/10 border-t py-24 md:py-32"
    >
      <Container>
        <div className="max-w-[640px]">
          <Eyebrow className="text-mauve">More from the Library</Eyebrow>
          <Heading as="h2" id="related-ebooks-heading" variant="h2" className="mt-4">
            Keep reading.
          </Heading>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-12">
          {others.map((book) => {
            const savings = computeSavings({
              price: book.price,
              salePrice: book.salePrice,
            });
            return (
              <Link
                key={book.slug}
                href={`/library/${book.slug}`}
                className="group bg-paper/0 border-ink/10 hover:border-mauve/40 flex flex-col rounded-sm border p-6 transition-colors md:p-8"
              >
                <div className="relative aspect-[3/4] w-full max-w-[220px]">
                  <Image
                    src={book.cover}
                    alt={`${book.title} — cover`}
                    fill
                    sizes="(min-width: 768px) 220px, 50vw"
                    className="rounded-sm object-cover shadow-[0_18px_36px_-14px_rgba(26,26,26,0.25)]"
                  />
                </div>
                <p className="type-eyebrow text-mauve mt-6">{book.eyebrow}</p>
                <h3 className="font-display text-ink group-hover:text-mauve-deep mt-3 text-[24px] leading-[1.1] font-medium tracking-[-0.02em] transition-colors">
                  {book.title}
                </h3>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {book.salePrice ? (
                    <>
                      <span className="text-ink text-[16px] font-medium">
                        {formatPKR(book.salePrice)}
                      </span>
                      <span className="text-ink-soft text-[13px] line-through">
                        {formatPKR(book.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink text-[16px] font-medium">
                      {formatPKR(book.price)}
                    </span>
                  )}
                  {savings && (
                    <span className="bg-shell text-mauve-deep rounded-full px-2 py-0.5 text-[11px] font-medium">
                      Save {savings.pct}%
                    </span>
                  )}
                </div>
                <span className="text-ink group-hover:text-mauve-deep mt-6 inline-flex items-center gap-2 text-[14px] font-medium">
                  Open <span aria-hidden>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
