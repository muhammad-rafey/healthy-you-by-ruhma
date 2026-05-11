// lib/og.tsx
//
// Shared <ImageResponse> template for branded 1200×630 Open Graph images.
// Cream background, ink text, mauve accent line and eyebrow, page title,
// and the "Healthy You By Ruhma" wordmark in the bottom-left.
//
// Used by app/opengraph-image.tsx (root fallback) and per-route
// opengraph-image.tsx files. We deliberately rely on the bundled default
// font shipping with @vercel/og so OG generation works offline / in CI
// without extra font-fetching infra.

import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export interface OgTemplateInput {
  /** Top-left small-caps eyebrow (e.g. "PROGRAM 01"). */
  eyebrow: string;
  /** Headline. Wrapped to 2–3 lines by Satori. */
  title: string;
  /** Short subtitle / description (≤180 chars works best). */
  subtitle?: string;
  /** Bottom-right wordmark line (defaults to site name). */
  wordmark?: string;
}

export function ogImageResponse({
  eyebrow,
  title,
  subtitle,
  wordmark = "Healthy You By Ruhma",
}: OgTemplateInput): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#F4F0EE",
        color: "#1A1A1A",
        fontFamily: "sans-serif",
      }}
    >
      {/* Top: eyebrow + accent line */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#6E3F5C",
            fontSize: "22px",
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              display: "block",
              width: "48px",
              height: "2px",
              background: "#895575",
            }}
          />
          <span>{eyebrow}</span>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: "56px",
            fontSize: "84px",
            fontWeight: 600,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            color: "#1A1A1A",
            maxWidth: "960px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              marginTop: "32px",
              fontSize: "26px",
              lineHeight: 1.45,
              color: "#3E3E3E",
              maxWidth: "880px",
              display: "flex",
            }}
          >
            {subtitle.length > 180 ? `${subtitle.slice(0, 177)}…` : subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom: wordmark + decorative dot */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "#1A1A1A",
          }}
        >
          {wordmark}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#895575",
            fontSize: "20px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span>Faisalabad · Online</span>
          <span
            style={{
              display: "block",
              width: "10px",
              height: "10px",
              borderRadius: "9999px",
              background: "#895575",
            }}
          />
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
    },
  );
}
