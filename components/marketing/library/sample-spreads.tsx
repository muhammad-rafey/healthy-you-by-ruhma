// components/marketing/library/sample-spreads.tsx
//
// Three interior previews from the MDX `sampleSpreads[]`. Mobile lays out
// as a horizontal scroll-snap rail, desktop becomes a 3-column grid. Each
// image is wrapped in a hover-scale frame (CSS only).

import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";

interface SampleSpreadsProps {
  images: readonly string[];
  title: string;
}

export function SampleSpreads({ images, title }: SampleSpreadsProps) {
  const previews = images.slice(0, 3);
  return (
    <section aria-labelledby="ebook-spreads-heading" className="bg-cream py-24 md:py-32">
      <Container>
        <div className="max-w-[640px]">
          <Eyebrow className="text-mauve">A look inside</Eyebrow>
          <Heading as="h2" id="ebook-spreads-heading" variant="h2" className="mt-4">
            Sample pages.
          </Heading>
          <p className="text-ink-soft mt-6 text-[17px] leading-[1.6]">
            A glimpse at the layout, voice, and pacing of the book. The full edition is delivered as
            a clean PDF the moment you buy.
          </p>
        </div>

        {/* Mobile: snap-rail. Desktop: 3-col grid. */}
        <div className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:-mx-8 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {previews.map((src, i) => (
            <figure
              key={src}
              className="bg-paper relative aspect-[4/5] w-[78%] flex-shrink-0 snap-center overflow-hidden rounded-sm md:w-auto"
            >
              <Image
                src={src}
                alt={`Sample spread ${i + 1} from ${title}`}
                fill
                sizes="(min-width: 768px) 33vw, 78vw"
                className="object-cover transition-transform duration-500 ease-out will-change-transform hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
              />
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
