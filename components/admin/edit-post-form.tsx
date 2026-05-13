"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";

interface EditPostFormProps {
  slug: string;
  initialTitle: string;
  initialDescription: string;
  initialCoverImage: string;
}

export function EditPostForm({
  slug,
  initialTitle,
  initialDescription,
  initialCoverImage,
}: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const trimmedCover = coverImage.trim();
      const payload: {
        title: string;
        description: string;
        coverImage?: string | null;
      } = {
        title,
        description,
      };
      // Pass an explicit value: a non-empty string sets it,
      // null clears the field on the document.
      payload.coverImage = trimmedCover.length > 0 ? trimmedCover : null;

      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        const message = errBody.error ?? "Could not save changes";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Changes saved");
      router.push(`/blog/${slug}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Title</span>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="border-ink/20 focus:border-mauve focus:ring-mauve/30 bg-cream text-ink h-12 rounded-full border px-5 shadow-sm focus:ring-2 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Cover image URL (optional)</span>
        <input
          type="url"
          name="coverImage"
          maxLength={2048}
          placeholder="https://…"
          value={coverImage}
          onChange={(event) => setCoverImage(event.target.value)}
          className="border-ink/20 focus:border-mauve focus:ring-mauve/30 bg-cream text-ink h-12 rounded-full border px-5 shadow-sm focus:ring-2 focus:outline-none"
        />
        <span className="text-ink/50 text-xs">Leave blank to fall back to the default cover.</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="type-eyebrow text-ink/70">Description</span>
        <textarea
          name="description"
          required
          rows={14}
          maxLength={8000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="border-ink/20 focus:border-mauve focus:ring-mauve/30 bg-cream text-ink min-h-70 resize-y rounded-2xl border px-5 py-4 shadow-sm focus:ring-2 focus:outline-none"
        />
        <span className="text-ink/50 text-xs">
          Plain text. Line breaks are preserved on the published page.
        </span>
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={submitting || title.length === 0 || description.length === 0}
        >
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
