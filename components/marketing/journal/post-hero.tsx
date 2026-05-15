// components/marketing/journal/post-hero.tsx
//
// Title-only editorial hero for a single journal post. Eyebrow strip
// combines category · published date · read time. Body title gets the
// LetterStagger one-shot reveal; nothing else animates here (master
// motion budget — three motions only, see redesign-plan §1).

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LetterStagger } from "@/components/motion/letter-stagger";
import type { UnifiedEntry } from "@/lib/journal-unified";
import { formatCategory, formatPostDate } from "@/lib/journal-data";

interface PostHeroProps {
  post: UnifiedEntry;
}

export function PostHero({ post }: PostHeroProps) {
  return (
    <header
      aria-label="Journal post header"
      className="bg-cream border-cream-deep border-b pt-[clamp(96px,12vw,180px)] pb-[clamp(40px,6vw,72px)]"
    >
      <Container>
        <div className="mx-auto max-w-[820px]">
          <p className="text-ink-soft flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] tracking-[0.16em] uppercase">
            <Eyebrow as="span" className="text-mauve">
              {formatCategory(post.category)}
            </Eyebrow>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime} min read</span>
          </p>
          <LetterStagger
            as="h1"
            text={post.title}
            className="font-display text-ink mt-8 block text-[clamp(36px,6vw,72px)] leading-[1.05] font-medium tracking-[-0.03em] text-balance"
          />
          {post.description ? (
            <p className="text-ink-soft mt-6 max-w-[640px] text-[clamp(17px,1.4vw,19px)] leading-[1.55] text-pretty">
              {post.description}
            </p>
          ) : null}
        </div>
      </Container>
    </header>
  );
}
