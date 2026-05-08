// components/marketing/journal/featured-post.tsx
//
// Large hero card for the most recent journal post — 16:9 cover image
// with `<ImageReveal>` clip-path entrance, eyebrow (category), Epilogue
// title, excerpt, date · read time, and a clear "Read →" affordance.
// The whole block is one link so the entire surface is the primary
// action (master §3.11).

import Image from "next/image";
import Link from "next/link";

import type { JournalFrontmatter } from "@/lib/mdx";
import { formatCategory, formatPostDate } from "@/lib/journal-data";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ImageReveal } from "@/components/motion/image-reveal";
import { FadeUp } from "@/components/motion/fade-up";

interface FeaturedPostProps {
  post: JournalFrontmatter;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const href = `/journal/${post.slug}`;
  const cover = post.heroImage;
  const ariaLabel = `Read “${post.title}”`;

  return (
    <section aria-label="Featured journal entry" className="bg-cream pb-[clamp(56px,7vw,96px)]">
      <Container>
        <Link href={href} aria-label={ariaLabel} className="group block focus-visible:outline-none">
          {cover ? (
            <ImageReveal className="bg-cream-deep relative aspect-[16/9] w-full overflow-hidden rounded-sm">
              <Image
                src={cover}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 1100px, 100vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.02]"
              />
            </ImageReveal>
          ) : (
            <div className="bg-cream-deep relative aspect-[16/9] w-full overflow-hidden rounded-sm" />
          )}

          <FadeUp>
            <div className="mt-10 grid gap-8 md:grid-cols-12">
              <div className="md:col-span-2">
                <Eyebrow>{formatCategory(post.category)}</Eyebrow>
              </div>

              <div className="md:col-span-7">
                <h2 className="font-display text-ink text-[clamp(32px,4vw,56px)] leading-[1.05] font-medium tracking-[-0.02em]">
                  {post.title}
                </h2>
                <p className="text-ink-soft mt-6 max-w-[58ch] text-[17px] leading-[1.6]">
                  {post.description}
                </p>
              </div>

              <div className="flex flex-col justify-end md:col-span-3">
                <div className="text-ink-soft text-[13px] leading-[1.5] tracking-[0.04em]">
                  <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                  <span aria-hidden> · </span>
                  <span>{post.readingTime} min read</span>
                </div>
                <span className="text-mauve group-hover:text-mauve-deep mt-6 inline-flex items-center gap-2 text-[15px] font-medium underline-offset-4 transition-colors group-hover:underline">
                  Read <span aria-hidden>→</span>
                </span>
              </div>
            </div>
          </FadeUp>
        </Link>
      </Container>
    </section>
  );
}
