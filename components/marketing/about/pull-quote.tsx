import type { ReactNode } from "react";

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-mauve font-display text-ink border-l-2 pl-5 text-[clamp(20px,1.6vw,26px)] leading-[1.35] italic">
      {children}
    </blockquote>
  );
}
