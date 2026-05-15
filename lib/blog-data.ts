import { z } from "zod";

import { getDb } from "@/lib/mongodb";
import { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from "@/lib/blog-categories";
import type { BlogCategory } from "@/lib/blog-categories";

export { BLOG_CATEGORIES, DEFAULT_BLOG_CATEGORY } from "@/lib/blog-categories";
export type { BlogCategory } from "@/lib/blog-categories";

const COLLECTION = "posts";

// Per-category fallback covers — warm, editorial Unsplash stills that sit
// well next to the cream/mauve palette. Used when a post has no cover so a
// recipes entry doesn't get a hormones image, etc. (Blog covers render via
// plain <img>, so no remote-host whitelisting is needed.)
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export const DEFAULT_COVER_BY_CATEGORY: Record<BlogCategory, string> = {
  recipes: UNSPLASH("photo-1495521821757-a1efb6729352"), // ingredients on board
  nutrition: UNSPLASH("photo-1512621776951-a57141f2eefd"), // fresh salad bowl
  hormones: UNSPLASH("photo-1556679343-c7306c1976bc"), // calm herbal tea
  lifestyle: UNSPLASH("photo-1499209974431-9dddcece7f88"), // soft morning light
};

// Generic fallback for legacy docs whose category can't be resolved.
export const DEFAULT_COVER_IMAGE = DEFAULT_COVER_BY_CATEGORY[DEFAULT_BLOG_CATEGORY];

export function defaultCoverFor(category: BlogCategory | undefined): string {
  return (category && DEFAULT_COVER_BY_CATEGORY[category]) || DEFAULT_COVER_IMAGE;
}

export const BlogPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  category: z.enum(BLOG_CATEGORIES),
  coverImage: z.url().max(2048).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const CreateBlogPostInput = BlogPostSchema.pick({
  title: true,
  description: true,
  category: true,
  coverImage: true,
});
export type CreateBlogPostInput = z.infer<typeof CreateBlogPostInput>;

export const UpdateBlogPostInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  category: z.enum(BLOG_CATEGORIES),
  coverImage: z.url().max(2048).optional().nullable(),
});
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostInput>;

// Legacy documents predate the category field. Default them so reads never
// surface an undefined category to the journal merge layer.
function withCategory(post: BlogPost): BlogPost {
  const stored = post.category as BlogCategory | undefined;
  return { ...post, category: stored ?? DEFAULT_BLOG_CATEGORY };
}

export function getCoverImage(post: Pick<BlogPost, "coverImage" | "category">): string {
  return post.coverImage ?? defaultCoverFor(post.category);
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : suffix;
}

export function formatPostDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const db = await getDb();
  const docs = await db
    .collection<BlogPost>(COLLECTION)
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(withCategory);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await getDb();
  const post = await db
    .collection<BlogPost>(COLLECTION)
    .findOne({ slug }, { projection: { _id: 0 } });
  return post ? withCategory(post) : null;
}

export async function createPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const db = await getDb();
  const now = new Date();
  const post: BlogPost = {
    ...input,
    slug: slugify(input.title),
    createdAt: now,
    updatedAt: now,
  };
  await db.collection<BlogPost>(COLLECTION).insertOne(post);
  return post;
}

export async function deletePostBySlug(slug: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection(COLLECTION).deleteOne({ slug });
  return result.deletedCount === 1;
}

export async function updatePostBySlug(
  slug: string,
  input: UpdateBlogPostInput,
): Promise<BlogPost | null> {
  const db = await getDb();
  const now = new Date();

  // null coverImage from the form means "clear the field" → use $unset.
  // undefined / missing means "leave it alone" → omit from $set.
  const $set: Partial<BlogPost> = {
    title: input.title,
    description: input.description,
    category: input.category,
    updatedAt: now,
  };
  const update: { $set: Partial<BlogPost>; $unset?: Record<string, ""> } = { $set };
  if (input.coverImage === null) {
    update.$unset = { coverImage: "" };
  } else if (typeof input.coverImage === "string") {
    $set.coverImage = input.coverImage;
  }

  const result = await db.collection<BlogPost>(COLLECTION).findOneAndUpdate({ slug }, update, {
    returnDocument: "after",
    projection: { _id: 0 },
  });
  return result;
}
