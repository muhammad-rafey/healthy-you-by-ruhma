// components/marketing/library/library-grid.tsx
//
// Editorial alternating-card grid for /library. Three large feature
// "spreads" stacked vertically — each one is the cover on one side and the
// copy + price + Open link on the other, swapping sides on each row.
// NOT a 3-column tile grid — the alternation is the signature.

import Image from "next/image";
import Link from "next/link";
import type { LibraryFrontmatter } from "@/lib/mdx";
import { computeSavings, formatPKR } from "@/lib/library-data";

interface LibraryGridProps {
  ebooks: LibraryFrontmatter[];
}

export function LibraryGrid({ ebooks }: LibraryGridProps) {
  return (
    <section aria-label="Library guidebooks" className="bg-cream">
      {ebooks.map((book, i) => {
        const savings = computeSavings({
          price: book.price,
          salePrice: book.salePrice,
        });
        const reverse = i % 2 === 1;
        const tilt = reverse ? "rotate-[1.5deg]" : "-rotate-[1.5deg]";

        return (
          <article
            key={book.slug}
            className={`border-ink/10 border-t ${i === ebooks.length - 1 ? "border-b" : ""}`}
          >
            <div
              className={`mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-20 sm:px-8 md:grid-cols-12 md:gap-16 md:py-28 lg:px-12 ${
                reverse ? "md:[&>figure]:order-2" : ""
              }`}
            >
              {/* Cover */}
              <figure
                className={`${
                  reverse ? "md:col-span-6 md:col-start-7" : "md:col-span-6 md:col-start-1"
                }`}
              >
                <div
                  className={`relative mx-auto aspect-[3/4] w-full max-w-[460px] transition-transform duration-500 ease-out ${tilt} hover:rotate-0 motion-reduce:rotate-0 motion-reduce:transition-none`}
                >
                  <Image
                    src={book.cover}
                    alt={`${book.title} — cover`}
                    fill
                    sizes="(min-width: 768px) 460px, 80vw"
                    className="rounded-sm object-cover shadow-[0_24px_50px_-18px_rgba(26,26,26,0.3)]"
                  />
                </div>
              </figure>

              {/* Copy */}
              <div
                className={`${
                  reverse ? "md:col-span-5 md:col-start-1" : "md:col-span-5 md:col-start-8"
                }`}
              >
                <p className="type-eyebrow text-mauve">{book.eyebrow}</p>
                <h2 className="font-display text-ink mt-4 text-[clamp(32px,4vw,56px)] leading-[1.05] font-medium tracking-[-0.02em]">
                  {book.title}
                </h2>
                <p className="text-ink-soft mt-6 max-w-[44ch] text-[17px] leading-[1.6]">
                  {book.description}
                </p>

                <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {book.salePrice ? (
                    <>
                      <span className="text-ink text-[20px] font-medium">
                        {formatPKR(book.salePrice)}
                      </span>
                      <span className="text-ink-soft text-[15px] line-through">
                        {formatPKR(book.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink text-[20px] font-medium">
                      {formatPKR(book.price)}
                    </span>
                  )}
                  {savings && (
                    <span className="bg-shell text-mauve-deep rounded-full px-2.5 py-0.5 text-[12px] font-medium">
                      {savings.label}
                    </span>
                  )}
                </div>

                <Link
                  href={`/library/${book.slug}`}
                  className="border-ink/40 text-ink hover:border-mauve hover:text-mauve-deep mt-10 inline-flex items-center gap-2 border-b pb-1 text-[15px] font-medium transition-colors"
                >
                  Open <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
