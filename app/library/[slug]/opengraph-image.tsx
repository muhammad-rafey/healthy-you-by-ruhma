// Per-ebook OG image. Mauve eyebrow ("GUIDEBOOK 0n"), title, description.

import { loadLibrary } from "@/lib/content/load";
import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Healthy You By Ruhma — guidebook";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { frontmatter } = await loadLibrary(slug);
  return ogImageResponse({
    eyebrow: frontmatter.eyebrow.toUpperCase(),
    title: frontmatter.title,
    subtitle: frontmatter.description,
  });
}
