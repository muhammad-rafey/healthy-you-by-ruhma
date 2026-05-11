"use client";

import { Fragment } from "react";
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

  // Split into words first so the browser only ever line-breaks at real
  // spaces between words. Inside each word, every character is its own
  // inline-block so the per-letter stagger animation still works — but
  // because the word itself is wrapped in an inline-block with
  // white-space: nowrap, the word breaks atomically (it never splits
  // mid-letter across lines).
  const words = text.split(" ");
  const totalLetters = words.reduce((acc, w) => acc + Array.from(w).length, 0);
  const perLetter = totalLetters > 0 ? 0.8 / totalLetters : 0;

  let globalIndex = 0;

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
      {words.map((word, wi) => {
        const chars = Array.from(word);
        return (
          <Fragment key={`w-${wi}`}>
            <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {chars.map((char) => {
                const i = globalIndex++;
                return (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    style={{ display: "inline-block" }}
                    variants={{
                      hidden: { opacity: 0, y: "0.2em" },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </Tag>
  );
}
