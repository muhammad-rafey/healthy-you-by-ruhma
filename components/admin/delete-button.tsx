"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  slug: string;
  title: string;
}

export function DeleteButton({ slug, title }: DeleteButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        toast.error("Could not delete this post.");
        return;
      }
      toast.success(`Deleted "${title}"`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={busy}>
      {busy ? "Deleting…" : "Delete"}
    </Button>
  );
}
