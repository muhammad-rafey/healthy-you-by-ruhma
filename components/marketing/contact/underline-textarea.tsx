"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface UnderlineTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const UnderlineTextarea = forwardRef<HTMLTextAreaElement, UnderlineTextareaProps>(
  function UnderlineTextarea({ label, error, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;
    const errorId = error ? `${fieldId}-error` : undefined;
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={fieldId}
          className="text-ink/70 type-eyebrow !text-[11px] tracking-[0.18em]"
        >
          {label}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          rows={6}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          className={cn(
            "border-ink/40 resize-y border-0 border-b bg-transparent py-2 outline-none",
            "text-ink placeholder:text-ink/40 font-sans text-[17px] leading-[1.6]",
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
