// Per-focus-area OG image.

import { loadFocus } from "@/lib/content/load";
import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Healthy You By Ruhma — focus area";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { frontmatter } = await loadFocus(slug);
  return ogImageResponse({
    eyebrow: frontmatter.eyebrow?.toUpperCase() ?? "FOCUS AREA",
    title: frontmatter.title,
    subtitle: frontmatter.description,
  });
}
