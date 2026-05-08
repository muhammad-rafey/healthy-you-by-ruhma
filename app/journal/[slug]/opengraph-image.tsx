// Per-journal-entry OG image.

import { loadJournal } from "@/lib/content/load";
import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Healthy You By Ruhma — journal entry";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { frontmatter } = await loadJournal(slug);
  return ogImageResponse({
    eyebrow: frontmatter.category?.toUpperCase() ?? "JOURNAL",
    title: frontmatter.title,
    subtitle: frontmatter.description,
  });
}
