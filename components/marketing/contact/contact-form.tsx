"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";

const fieldClass =
  "border-ink/20 focus:border-mauve focus:ring-mauve/30 bg-cream text-ink h-12 rounded-full border px-5 shadow-sm focus:ring-2 focus:outline-none";

export function ContactForm() {
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, email, description, company }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        const message = errBody.error ?? "Could not send message";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Message sent — I’ll reply within a business day.");
      setSubject("");
      setEmail("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Subject</span>
        <input
          type="text"
          name="subject"
          required
          maxLength={200}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Email</span>
        <input
          type="email"
          name="email"
          required
          maxLength={254}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Description</span>
        <textarea
          name="description"
          required
          rows={8}
          maxLength={8000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="border-ink/20 focus:border-mauve focus:ring-mauve/30 bg-cream text-ink min-h-70 resize-y rounded-2xl border px-5 py-4 shadow-sm focus:ring-2 focus:outline-none"
        />
      </label>

      {/* Honeypot: hidden from users; bots tend to fill every field. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={company}
        onChange={(event) => setCompany(event.target.value)}
      />

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          type="submit"
          disabled={
            submitting || subject.length === 0 || email.length === 0 || description.length === 0
          }
        >
          {submitting ? "Sending…" : "Send message"}
        </Button>
        <Button asChild type="button" data-event-label="contact_consultation">
          <Link href="/programs/consultation">Book a consultation</Link>
        </Button>
      </div>
    </form>
  );
}
