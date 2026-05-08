// components/marketing/journal/post-grid.tsx
//
// 3-col magazine-style grid for /journal entries below the featured card.
// When the published catalogue is smaller than the 3-card target row, the
// remaining slots fall back to "Coming soon — sign up for updates"
// placeholder tiles so the layout never collapses to a lonely single card.

import type { ReactNode } from "react";

import type { JournalFrontmatter } from "@/lib/mdx";

import { Eyebrow } from "@/components/ui/eyebrow";
import { FadeUp } from "@/components/motion/fade-up";

import { PostCard } from "./post-card";

interface PostGridProps {
  posts: JournalFrontmatter[];
}

const PLACEHOLDER_TARGET = 3;
const PLACEHOLDER_MAX = 5;

function PlaceholderCard({ index }: { index: number }) {
  const aspect = index % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/3]";
  return (
    <div
      role="presentation"
      className="border-ink/10 group block h-full rounded-sm border border-dashed p-6"
    >
      <div
        className={`bg-cream-deep/60 flex w-full items-center justify-center rounded-sm ${aspect}`}
      >
        <span aria-hidden className="text-ink-soft/40 font-display text-[64px] leading-none">
          ·
        </span>
      </div>
      <div className="mt-6">
        <Eyebrow>Coming soon</Eyebrow>
        <p className="font-display text-ink-soft mt-3 text-[clamp(20px,2vw,24px)] leading-[1.2] font-medium tracking-[-0.01em]">
          New entry being written.
        </p>
        <p className="text-ink-soft mt-3 text-[14px] leading-[1.55]">
          Sign up below — quiet, occasional dispatches when fresh entries land.
        </p>
      </div>
    </div>
  );
}

export function PostGrid({ posts }: PostGridProps): ReactNode {
  // Real posts first, then placeholders to fill out the row(s) so the
  // grid reads as deliberate, not under-built. Cap placeholders at
  // PLACEHOLDER_MAX so a brand-new install (zero posts after the
  // featured slot) never becomes a wall of empty boxes.
  const fillNeeded = Math.max(0, PLACEHOLDER_TARGET - posts.length);
  const placeholderCount = Math.min(fillNeeded, PLACEHOLDER_MAX);

  return (
    <section aria-label="Recent journal entries" className="bg-cream pb-[clamp(72px,9vw,128px)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 sm:px-8 lg:px-12">
        <ul className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-3" role="list">
          {posts.map((post, i) => (
            <FadeUp as="li" key={post.slug} delay={0.04 * i}>
              <PostCard post={post} size={i === 0 ? "lg" : "md"} />
            </FadeUp>
          ))}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <FadeUp as="li" key={`placeholder-${i}`} delay={0.04 * (posts.length + i)}>
              <PlaceholderCard index={posts.length + i} />
            </FadeUp>
          ))}
        </ul>
      </div>
    </section>
  );
}
