// components/marketing/focus/focus-prose.tsx
//
// Magazine-longread wrapper around the rendered MDX body of a focus page.
// Two-column on lg+ (CSS columns, balanced, with break-inside:avoid on
// blocks), single-column ≤md, max-width ~720 px. Drop-cap on the first
// paragraph via `:first-of-type::first-letter`. CSS lives in app/globals.css
// under the `.focus-prose` scope.

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FocusProseProps {
  children: ReactNode;
  dropcap?: boolean;
  className?: string;
}

export function FocusProse({ children, dropcap = true, className }: FocusProseProps) {
  return (
    <div className={cn("focus-prose mx-auto w-full max-w-[1040px]", className)}>
      <div className={cn("focus-prose-body", dropcap && "has-dropcap")}>{children}</div>
    </div>
  );
}
