// components/marketing/library/ebook-hero.tsx
//
// Split-hero for the ebook detail page. Left = cover with hover 3D tilt
// (max 4° per axis, suppressed under prefers-reduced-motion). Right =
// eyebrow + title + price block + external Buy CTA + format/delivery line.
// Title runs through <LetterStagger>; cover wrapped in <ImageReveal>.

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { LibraryFrontmatter } from "@/lib/mdx";
import { computeSavings, formatPKR, isPlaceholderBuyUrl } from "@/lib/library-data";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ImageReveal } from "@/components/motion/image-reveal";
import { LetterStagger } from "@/components/motion/letter-stagger";
import { BuyButton } from "./buy-button";

interface EbookHeroProps {
  ebook: LibraryFrontmatter;
}

export function EbookHero({ ebook }: EbookHeroProps) {
  const { title, eyebrow, cover, price, salePrice, buyUrl, format, pages } = ebook;
  const savings = computeSavings({ price, salePrice });
  const placeholder = isPlaceholderBuyUrl(buyUrl);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 8; // -4..4
    const rx = -(py - 0.5) * 8; // -4..4
    setTilt({ rx, ry });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  const formatLine = [format, pages ? `~${pages} pages` : null].filter(Boolean).join(" · ");

  return (
    <section
      aria-label="Ebook hero"
      className="bg-cream pt-[clamp(96px,12vw,180px)] pb-[clamp(64px,9vw,128px)]"
    >
      <Container width="wide">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
          {/* LEFT: cover with tilt */}
          <div className="flex items-center justify-center" style={{ perspective: "1400px" }}>
            <ImageReveal direction="up" className="rounded-sm">
              <div
                ref={cardRef}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                className="relative aspect-[3/4] w-full max-w-[420px] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
                style={{
                  transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <Image
                  src={cover}
                  alt={`${title} — cover`}
                  fill
                  priority
                  sizes="(min-width: 768px) 420px, 80vw"
                  className="rounded-sm object-cover shadow-[0_30px_60px_-20px_rgba(26,26,26,0.35)]"
                />
              </div>
            </ImageReveal>
          </div>

          {/* RIGHT: copy + price + CTA */}
          <div className="flex flex-col justify-center">
            <Eyebrow className="text-mauve">{eyebrow}</Eyebrow>
            <LetterStagger
              as="h1"
              text={title}
              className="font-display text-ink mt-6 block text-[clamp(40px,6vw,80px)] leading-[1.02] font-medium tracking-[-0.03em] text-balance"
            />

            {/* Price block */}
            <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              {salePrice ? (
                <>
                  <span className="font-display text-ink text-[clamp(28px,3.5vw,40px)] font-medium">
                    {formatPKR(salePrice)}
                  </span>
                  <span className="text-ink-soft text-[18px] line-through">{formatPKR(price)}</span>
                </>
              ) : (
                <span className="font-display text-ink text-[clamp(28px,3.5vw,40px)] font-medium">
                  {formatPKR(price)}
                </span>
              )}
              {savings && (
                <span className="bg-shell text-mauve-deep rounded-full px-3 py-1 text-[13px] font-medium">
                  {savings.label}
                </span>
              )}
            </div>

            {/* External buy CTA */}
            <div className="mt-10">
              <BuyButton buyUrl={buyUrl} size="lg" />
            </div>

            <p className="text-ink-soft mt-4 text-[13px]">
              {placeholder
                ? "Real publisher links land before launch — book a consultation in the meantime."
                : "Opens in a new tab. Checkout is handled on the publisher's site."}
            </p>

            {(formatLine || true) && (
              <p className="text-ink-soft mt-6 text-[14px] leading-[1.6]">
                {formatLine || "Digital · PDF · ~60 pages"}
                {" · "}
                <span>Delivered instantly to your inbox</span>
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
