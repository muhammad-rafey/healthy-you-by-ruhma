"use client";

// Contact form: react-hook-form (client validation) bridged to a server
// action via `useActionState`. Server-returned field errors win over the
// client errors so the server stays canonical. The success state is a
// cross-fade swap into a thank-you panel with a "Send another" reset.

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { submitContact } from "@/app/contact/actions";
import {
  contactSchema,
  initialContactState,
  type ContactInput,
  type ContactState,
} from "@/app/contact/schema";
import { cn } from "@/lib/cn";

import { UnderlineField } from "./underline-field";
import { UnderlineSelect } from "./underline-select";
import { UnderlineTextarea } from "./underline-textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "bg-ink text-cream hover:bg-mauve-deep mt-2 inline-flex items-center justify-center self-start rounded-full px-8 py-3 transition-colors",
        "type-eyebrow !text-[12px] tracking-[0.18em]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

interface SuccessPanelProps {
  onReset: () => void;
}

function SuccessPanel({ onReset }: SuccessPanelProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <h2 className="font-display text-ink text-[clamp(28px,3.4vw,40px)] leading-[1.1] font-medium tracking-[-0.02em]">
        Thank you. Your message is on its way.
      </h2>
      <p className="text-ink-soft max-w-[44ch] text-[17px] leading-[1.6]">
        I read every note personally. You will hear back within one business day.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-mauve hover:text-mauve-deep type-eyebrow self-start !text-[12px] tracking-[0.18em] underline-offset-4 hover:underline"
      >
        Send another →
      </button>
    </div>
  );
}

export function ContactForm() {
  const reduce = useReducedMotion();
  const [state, formAction] = useActionState<ContactState, FormData>(
    submitContact,
    initialContactState,
  );

  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      topic: "Diet Planning",
      message: "",
      newsletter: false,
    },
  });

  // After a successful submit, reset RHF state so a "Send another" click
  // returns the form to a clean baseline if it remounts.
  useEffect(() => {
    if (state.status === "success") {
      reset();
      formRef.current?.reset();
    }
  }, [state.status, reset]);

  const fieldError = (name: keyof ContactInput) =>
    (state.status === "error" && state.fieldErrors?.[name]) || errors[name]?.message;

  const handleSendAnother = () => {
    // The cleanest reset path: full navigation drops the action state held
    // by `useActionState`. Reload-equivalent, no stale state on the button.
    window.location.assign("/contact");
  };

  const fadeProps = reduce
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state.status === "success" ? (
        <motion.div key="success" {...fadeProps}>
          <SuccessPanel onReset={handleSendAnother} />
        </motion.div>
      ) : (
        <motion.div key="form" {...fadeProps}>
          <form
            ref={formRef}
            action={formAction}
            noValidate
            className="flex flex-col gap-8"
            aria-describedby={state.status === "error" ? "contact-form-error" : undefined}
          >
            <UnderlineField
              label="Name"
              autoComplete="name"
              required
              error={fieldError("name")}
              {...register("name")}
            />

            <UnderlineField
              label="Email"
              type="email"
              autoComplete="email"
              required
              error={fieldError("email")}
              {...register("email")}
            />

            <UnderlineSelect label="Topic" error={fieldError("topic")} {...register("topic")} />

            <UnderlineTextarea
              label="Message"
              required
              minLength={20}
              maxLength={2000}
              error={fieldError("message")}
              {...register("message")}
            />

            <label className="text-ink-soft flex items-start gap-3 text-[15px] leading-[1.5]">
              <input
                type="checkbox"
                {...register("newsletter")}
                className="border-ink/40 text-mauve focus-visible:ring-mauve mt-[3px] h-4 w-4 cursor-pointer rounded-sm border bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2"
              />
              <span>
                Send me the occasional note from the practice — no more than once a month, easy to
                unsubscribe.
              </span>
            </label>

            <div className="flex flex-col gap-3">
              <SubmitButton />
              {state.status === "error" ? (
                <p id="contact-form-error" role="alert" className="text-mauve-deep type-small">
                  {state.message}
                </p>
              ) : null}
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
