// lib/blog-categories.ts
//
// Category vocabulary for the Mongo-backed posts that now surface on
// /journal. Kept dependency-free (no Mongo driver) so client components
// (the admin forms) and the server data layer share one source of truth.
// A subset of the JournalFrontmatter.category enum (lib/content/types.ts)
// minus "case-notes", which stays MDX-only.

export const BLOG_CATEGORIES = ["hormones", "nutrition", "lifestyle", "recipes"] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
export const DEFAULT_BLOG_CATEGORY: BlogCategory = "lifestyle";

const LABELS: Record<BlogCategory, string> = {
  hormones: "Hormones",
  nutrition: "Nutrition",
  lifestyle: "Lifestyle",
  recipes: "Recipes",
};

export function blogCategoryLabel(value: BlogCategory): string {
  return LABELS[value];
}
