// components/marketing/focus/botanical.tsx
//
// Inline botanical illustration for use inside the longread MDX body. Anchors
// section breaks at ≤80 px (master §1). Decorative — `alt=""` enforced.

import Image from "next/image";

const ALLOWED = ["fennel", "mint", "citrus", "leaf", "seed", "sprig", "root", "pestle"] as const;

export type BotanicalName = (typeof ALLOWED)[number];

interface BotanicalProps {
  name: BotanicalName;
  size?: number;
  align?: "left" | "center" | "right";
}

export function Botanical({ name, size = 64, align = "center" }: BotanicalProps) {
  if (!ALLOWED.includes(name)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Botanical name="${name}" /> is not in the allowed set.`);
    }
    return null;
  }
  const px = Math.min(size, 80);
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";
  return (
    <div
      aria-hidden
      className={`focus-botanical flex ${justify} my-12 opacity-50`}
      style={{ breakInside: "avoid" }}
    >
      <Image
        src={`/illustrations/${name}.svg`}
        alt=""
        width={px}
        height={px}
        className="h-auto w-auto"
        style={{ width: px, height: px }}
        unoptimized
      />
    </div>
  );
}
