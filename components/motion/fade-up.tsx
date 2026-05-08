"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

interface FadeUpProps {
  children: ReactNode;
  delay?: number; // seconds
  className?: string;
  as?: "div" | "section" | "article" | "li";
  amount?: number; // viewport intersection threshold 0..1
  once?: boolean;
}

export function FadeUp({
  children,
  delay = 0,
  className,
  as = "div",
  amount = 0.2,
  once = true,
}: FadeUpProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  if (reduce) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Component>
  );
}
