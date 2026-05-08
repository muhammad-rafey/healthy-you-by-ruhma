import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Production-only indexing. Preview/dev disallow everything so accidentally-
// publicly-reachable preview deploys don't leak to search engines.
export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === "production";
  return {
    rules: isProd ? [{ userAgent: "*", allow: "/" }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: isProd ? `${site.url}/sitemap.xml` : undefined,
    host: isProd ? site.url : undefined,
  };
}
