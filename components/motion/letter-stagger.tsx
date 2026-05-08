"use client";

import { motion, useReducedMotion } from "motion/react";

interface LetterStaggerProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p" | "span" | "div";
  delay?: number;
}

export function LetterStagger({ text, className, as = "span", delay = 0 }: LetterStaggerProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  if (reduce) {
    return (
      <Tag className={className} aria-label={text}>
        {text}
      </Tag>
    );
  }

  // Spread by Unicode codepoint to handle composed characters safely.
  const letters = Array.from(text);
  const totalLetters = letters.filter((c) => c !== " ").length;
  // Distribute 800ms across all visible letters.
  const perLetter = totalLetters > 0 ? 0.8 / totalLetters : 0;

  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: perLetter,
          },
        },
      }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: "0.2em" },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </Tag>
  );
}
