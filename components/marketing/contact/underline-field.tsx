"use client";

// Hand-drawn underline-only input. The page's signature visual move:
// no boxed inputs — bottom border only. Focus thickens the underline and
// shifts it to mauve. An error state recolors and thickens the underline.

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface UnderlineFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  describedById?: string;
}

export const UnderlineField = forwardRef<HTMLInputElement, UnderlineFieldProps>(
  function UnderlineField({ label, error, describedById, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;
    const errorId = error ? `${fieldId}-error` : undefined;
    const describedBy = [describedById, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-ink/70 type-eyebrow !text-[11px] tracking-[0.18em]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            "border-ink/40 border-0 border-b bg-transparent py-2 outline-none",
            "text-ink placeholder:text-ink/40 font-sans text-[17px]",
            "transition-[border-color,border-width,padding] duration-200",
            "focus:border-mauve focus:border-b-2 focus:pb-[7px]",
            error && "border-mauve-deep border-b-2 pb-[7px]",
            className,
          )}
          {...rest}
        />
        {error ? (
          <p id={errorId} className="text-mauve-deep type-small">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
