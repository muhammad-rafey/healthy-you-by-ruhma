// components/marketing/library/author-card.tsx
//
// Compact "About the author" block on every ebook detail page. Portrait
// + 2-paragraph bio (excerpted from content/about.mdx into AUTHOR_BIO) +
// link to /about. Server component.

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { AUTHOR_BIO, AUTHOR_PORTRAIT } from "@/lib/library-data";

export function AuthorCard() {
  return (
    <section aria-labelledby="ebook-author-heading" className="bg-cream-deep py-24 md:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-16">
          <figure className="md:col-span-4">
            <div className="bg-paper relative mx-auto aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-sm md:mx-0">
              <Image
                src={AUTHOR_PORTRAIT.src}
                alt={AUTHOR_PORTRAIT.alt}
                fill
                sizes="(min-width: 768px) 280px, 60vw"
                className="object-cover"
              />
            </div>
          </figure>

          <div className="md:col-span-8">
            <Eyebrow className="text-mauve">About the author</Eyebrow>
            <Heading as="h2" id="ebook-author-heading" variant="h2" className="mt-4 max-w-[18ch]">
              Dr. Ruhma.
            </Heading>
            <div className="text-ink-soft mt-6 max-w-[58ch] space-y-5 text-[17px] leading-[1.65]">
              {AUTHOR_BIO.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            <Link
              href="/about"
              className="border-ink/40 text-ink hover:border-mauve hover:text-mauve-deep mt-8 inline-flex items-center gap-2 border-b pb-1 text-[15px] font-medium transition-colors"
            >
              More about Dr. Ruhma <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
