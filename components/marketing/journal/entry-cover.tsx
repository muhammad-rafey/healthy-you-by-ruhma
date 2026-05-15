// components/marketing/journal/entry-cover.tsx
//
// One cover-image element for a unified journal entry. MDX entries point at
// local /media paths and use next/image; blog entries carry arbitrary remote
// URLs and use a plain <img> — next/image would require whitelisting every
// remote host (see CLAUDE.md "Mongo-backed blog architecture"). Both render
// inside the caller's `relative`/aspect wrapper so the layout is identical.

import Image from "next/image";

import type { UnifiedEntry } from "@/lib/journal-unified";

interface EntryCoverProps {
  src: string;
  source: UnifiedEntry["source"];
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function EntryCover({ src, source, sizes, priority, className = "" }: EntryCoverProps) {
  if (source === "mdx") {
    return <Image src={src} alt="" fill priority={priority} sizes={sizes} className={className} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
