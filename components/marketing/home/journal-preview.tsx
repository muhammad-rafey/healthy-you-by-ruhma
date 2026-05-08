import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";
import type { JournalCard } from "@/lib/home-data";

type Item = JournalCard;

export function JournalPreview({ items }: { items: Item[] }) {
  const allPlaceholders = items.every((i) => i.placeholder);

  return (
    <section aria-labelledby="journal-heading" className="bg-cream-deep py-24 md:py-32">
      <Container>
        <FadeUp>
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Eyebrow>From the journal</Eyebrow>
              <Heading as="h2" id="journal-heading" variant="h1" className="mt-4">
                Reading, slowly.
              </Heading>
            </div>
            <Link
              href="/journal"
              className="text-mauve hover:text-mauve-deep text-[14px] font-medium underline-offset-4 hover:underline"
            >
              All entries →
            </Link>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          {items.map((post, i) => (
            <FadeUp key={post.slug} delay={i * 0.08}>
              {post.placeholder ? (
                <div className="block opacity-90">
                  <div className="bg-shell relative aspect-[4/3] w-full overflow-hidden">
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-ink/15 text-[120px] leading-none lowercase">
                        soon
                      </span>
                    </div>
                  </div>
                  <Eyebrow className="text-ink-soft mt-6">{post.eyebrow}</Eyebrow>
                  <h3 className="font-display text-ink mt-2 text-[24px] leading-[1.2] font-medium tracking-[-0.015em]">
                    {post.title}
                  </h3>
                  <p className="text-ink-soft mt-3 line-clamp-3 text-[17px] leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              ) : (
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="bg-shell relative aspect-[4/3] w-full overflow-hidden">
                    {post.cover && (
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <Eyebrow className="text-ink-soft mt-6">{post.eyebrow}</Eyebrow>
                  <h3 className="font-display text-ink group-hover:text-mauve-deep mt-2 text-[24px] leading-[1.2] font-medium tracking-[-0.015em]">
                    {post.title}
                  </h3>
                  <p className="text-ink-soft mt-3 line-clamp-3 text-[17px] leading-relaxed">
                    {post.excerpt}
                  </p>
                </Link>
              )}
            </FadeUp>
          ))}
        </div>

        {allPlaceholders && (
          <p className="text-ink-soft mt-10 text-[13px] tracking-[0.04em] italic">
            New entries coming. The journal opens later this season.
          </p>
        )}
      </Container>
    </section>
  );
}
