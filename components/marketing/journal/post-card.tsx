// components/marketing/journal/post-card.tsx
//
// Single journal teaser card. Three sizes (lg / md / sm) — same component,
// different image aspect and title scale, used by <PostGrid> for the
// magazine rhythm and by <RelatedPosts> for the post-page tail strip.

import Link from "next/link";
import type { ReactNode } from "react";

import type { UnifiedEntry } from "@/lib/journal-unified";
import { formatCategory, formatPostDate } from "@/lib/journal-data";

import { EntryCover } from "./entry-cover";

interface PostCardProps {
  post: UnifiedEntry;
  size?: "lg" | "md" | "sm";
}

const SIZE_CONFIG: Record<
  NonNullable<PostCardProps["size"]>,
  { aspect: string; title: string; sizes: string }
> = {
  lg: {
    aspect: "aspect-[4/3]",
    title: "text-[clamp(26px,3vw,36px)]",
    sizes: "(min-width: 1024px) 640px, 100vw",
  },
  md: {
    aspect: "aspect-[3/4]",
    title: "text-[clamp(22px,2.4vw,30px)]",
    sizes: "(min-width: 1024px) 480px, 100vw",
  },
  sm: {
    aspect: "aspect-[4/3]",
    title: "text-[clamp(20px,2vw,24px)]",
    sizes: "(min-width: 1024px) 360px, 50vw",
  },
};

export function PostCard({ post, size = "sm" }: PostCardProps): ReactNode {
  const cfg = SIZE_CONFIG[size];
  const cover = post.heroImage;

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group focus-visible:ring-mauve block h-full rounded-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      {cover ? (
        <div className={`bg-cream-deep relative w-full overflow-hidden rounded-sm ${cfg.aspect}`}>
          <EntryCover
            src={cover}
            source={post.source}
            sizes={cfg.sizes}
            className="object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <div className={`bg-cream-deep w-full rounded-sm ${cfg.aspect}`} />
      )}

      <div className="mt-6">
        <p className="type-eyebrow text-mauve">{formatCategory(post.category)}</p>
        <h3
          className={`font-display text-ink group-hover:text-mauve-deep mt-3 leading-[1.15] font-medium tracking-[-0.02em] transition-colors ${cfg.title}`}
        >
          {post.title}
        </h3>
        <p className="text-ink-soft mt-3 line-clamp-2 max-w-[44ch] text-[15px] leading-[1.55]">
          {post.description}
        </p>
        <p className="text-ink-soft mt-4 text-[13px] tracking-[0.04em]">
          <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
          <span aria-hidden> · </span>
          <span>{post.readingTime} min read</span>
        </p>
      </div>
    </Link>
  );
}
