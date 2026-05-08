"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
}

const clipFor: Record<
  NonNullable<ImageRevealProps["direction"]>,
  {
    initial: string;
    animate: string;
  }
> = {
  up: { initial: "inset(100% 0% 0% 0%)", animate: "inset(0% 0% 0% 0%)" },
  down: { initial: "inset(0% 0% 100% 0%)", animate: "inset(0% 0% 0% 0%)" },
  left: { initial: "inset(0% 0% 0% 100%)", animate: "inset(0% 0% 0% 0%)" },
  right: { initial: "inset(0% 100% 0% 0%)", animate: "inset(0% 0% 0% 0%)" },
};

export function ImageReveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: ImageRevealProps) {
  const reduce = useReducedMotion();
  const clip = clipFor[direction];

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      initial={{ clipPath: clip.initial }}
      animate={{ clipPath: clip.animate }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.77, 0, 0.175, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
