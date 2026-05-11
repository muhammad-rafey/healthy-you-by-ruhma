import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { loadAllJournal } from "@/lib/journal-data";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "monthly" },
  { path: "/about", priority: 0.9, changeFrequency: "yearly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/transformations", priority: 0.5, changeFrequency: "monthly" },
  { path: "/programs/coaching", priority: 0.8, changeFrequency: "monthly" },
  { path: "/programs/consultation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/focus/hormonal-health", priority: 0.7, changeFrequency: "monthly" },
  { path: "/focus/weight-management", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library", priority: 0.8, changeFrequency: "monthly" },
  { path: "/library/diabetes-essentials", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library/pcos-guidebook", priority: 0.7, changeFrequency: "monthly" },
  { path: "/library/skin-secrets", priority: 0.7, changeFrequency: "monthly" },
  { path: "/journal", priority: 0.6, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/refunds", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const base = STATIC_ROUTES.map((r) => ({
    url: `${site.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Phase 10: read journal entries dynamically from the visible MDX
  // catalogue (drafts hidden in production via loadAllJournal()).
  const journalDocs = await loadAllJournal();
  const journal = journalDocs.map((d) => ({
    url: `${site.url}/journal/${d.frontmatter.slug}`,
    lastModified: new Date(d.frontmatter.updatedAt ?? d.frontmatter.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...base, ...journal];
}
