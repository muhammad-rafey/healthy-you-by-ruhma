// components/marketing/journal/related-posts.tsx
//
// Tail strip on a journal post — up to 3 other entries as small <PostCard>s.
// Falls back to "Coming soon" placeholder tiles when only one post exists,
// so the section never reads as broken on a fresh install.

import type { UnifiedEntry } from "@/lib/journal-unified";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { FadeUp } from "@/components/motion/fade-up";

import { PostCard } from "./post-card";

interface RelatedPostsProps {
  posts: UnifiedEntry[];
}

const TARGET = 3;

export function RelatedPosts({ posts }: RelatedPostsProps) {
  const fillNeeded = Math.max(0, TARGET - posts.length);

  return (
    <section
      aria-labelledby="journal-more-entries"
      className="bg-cream-deep/50 border-cream-deep border-t py-[clamp(72px,9vw,128px)]"
    >
      <Container>
        <FadeUp>
          <Eyebrow id="journal-more-entries">More entries</Eyebrow>
          <Heading as="h2" variant="h2" className="mt-4 max-w-[640px]">
            Keep reading.
          </Heading>
        </FadeUp>

        <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10" role="list">
          {posts.map((post, i) => (
            <FadeUp as="li" key={post.slug} delay={0.05 * i}>
              <PostCard post={post} size="sm" />
            </FadeUp>
          ))}
          {Array.from({ length: fillNeeded }).map((_, i) => (
            <FadeUp as="li" key={`related-placeholder-${i}`} delay={0.05 * (posts.length + i)}>
              <div className="border-ink/10 h-full rounded-sm border border-dashed p-6">
                <div className="bg-cream-deep/60 aspect-[4/3] w-full rounded-sm" />
                <p className="type-eyebrow text-mauve mt-6">Coming soon</p>
                <p className="font-display text-ink-soft mt-3 text-[20px] leading-[1.2] font-medium tracking-[-0.01em]">
                  New entry being written.
                </p>
                <p className="text-ink-soft mt-3 text-[14px] leading-[1.55]">
                  Sign up below — quiet dispatches when fresh entries land.
                </p>
              </div>
            </FadeUp>
          ))}
        </ul>
      </Container>
    </section>
  );
}
