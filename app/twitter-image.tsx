// Root /twitter-image — mirrors the OG image so summary_large_image
// cards on X / Twitter render with the same branding.

import { ogImageResponse, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const runtime = "nodejs";
export const alt = "Healthy You By Ruhma — Clinical dietitian in Faisalabad";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return ogImageResponse({
    eyebrow: "Healthy You By Ruhma",
    title: "Nourishing you inside out for healthy you throughout.",
    subtitle:
      "Editorial nutrition practice with Dr. Ruhma — programs, focus areas, and guidebooks for hormonal health and weight management.",
  });
}
