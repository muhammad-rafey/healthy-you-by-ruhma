"use client";

// Underline-only select. Uses an inline SVG caret so the native chrome is
// fully suppressed (no box, no fill).

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { CONTACT_TOPICS } from "@/lib/contact-data";

interface UnderlineSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const CARET_BG =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath fill='%231a1a1a' d='M2 4l4 4 4-4z'/%3E%3C/svg%3E\")] bg-[length:12px] bg-[right_2px_center] bg-no-repeat";

export const UnderlineSelect = forwardRef<HTMLSelectElement, UnderlineSelectProps>(
  function UnderlineSelect({ label, error, id, className, ...rest }, ref) {
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
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={errorId}
          className={cn(
            "border-ink/40 appearance-none border-0 border-b bg-transparent py-2 pr-6 outline-none",
            "text-ink font-sans text-[17px]",
            "transition-[border-color,border-width,padding] duration-200",
            "focus:border-mauve focus:border-b-2 focus:pb-[7px]",
            CARET_BG,
            error && "border-mauve-deep border-b-2 pb-[7px]",
            className,
          )}
          {...rest}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {error ? (
          <p id={errorId} className="text-mauve-deep type-small">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
