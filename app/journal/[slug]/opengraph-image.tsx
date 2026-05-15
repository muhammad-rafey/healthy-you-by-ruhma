// Per-journal-entry OG image. Resolves MDX or Mongo via the merge layer.

import { loadEntryBySlug } from "@/lib/journal-unified";
import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Healthy You By Ruhma — journal entry";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadEntryBySlug(slug);
  if (!loaded) {
    return ogImageResponse({ eyebrow: "JOURNAL", title: "Healthy You By Ruhma" });
  }
  const { entry } = loaded;
  return ogImageResponse({
    eyebrow: entry.category.toUpperCase(),
    title: entry.title,
    subtitle: entry.description,
  });
}
