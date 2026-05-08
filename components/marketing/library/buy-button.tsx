// components/marketing/library/buy-button.tsx
//
// External buy CTA. Renders as a regular anchor when buyUrl is a real
// publisher URL (Gumroad, Lemon Squeezy, etc.) and as a disabled-style
// "Coming soon" button when the MDX still ships the example.com placeholder
// per Phase 03. Pure presentational client component — no payment SDKs.

"use client";

import { cn } from "@/lib/cn";
import { derivePlatformLabel, isPlaceholderBuyUrl } from "@/lib/library-data";

interface BuyButtonProps {
  buyUrl: string;
  size?: "default" | "lg";
  className?: string;
}

export function BuyButton({ buyUrl, size = "lg", className }: BuyButtonProps) {
  const placeholder = isPlaceholderBuyUrl(buyUrl);
  const label = placeholder ? "Coming soon" : derivePlatformLabel(buyUrl);

  const base =
    "inline-flex w-fit items-center gap-3 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mauve";
  const sizing = size === "lg" ? "px-7 py-4 text-[15px]" : "px-5 py-2.5 text-[14px]";

  if (placeholder) {
    return (
      <span
        aria-disabled="true"
        role="button"
        tabIndex={-1}
        className={cn(
          base,
          sizing,
          "bg-cream-deep text-ink-soft cursor-not-allowed opacity-80",
          className,
        )}
      >
        <span>{label}</span>
        <span aria-hidden>·</span>
        <span className="text-[12px] tracking-wide uppercase">In production</span>
      </span>
    );
  }

  return (
    <a
      href={buyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, sizing, "bg-ink text-cream hover:bg-mauve-deep", className)}
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </a>
  );
}
