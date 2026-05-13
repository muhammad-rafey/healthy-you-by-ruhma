import { z } from "zod";

import { getDb } from "@/lib/mongodb";

const COLLECTION = "posts";

export const DEFAULT_COVER_IMAGE =
  "https://cdn.dribbble.com/userupload/23935150/file/original-c1ef5f86f928ecf4ac1c1683f0b2edb3.png?resize=752x&vertical=center";

export const BlogPostSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  coverImage: z.url().max(2048).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

export const CreateBlogPostInput = BlogPostSchema.pick({
  title: true,
  description: true,
  coverImage: true,
});
export type CreateBlogPostInput = z.infer<typeof CreateBlogPostInput>;

export const UpdateBlogPostInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  coverImage: z.url().max(2048).optional().nullable(),
});
export type UpdateBlogPostInput = z.infer<typeof UpdateBlogPostInput>;

export function getCoverImage(post: Pick<BlogPost, "coverImage">): string {
  return post.coverImage ?? DEFAULT_COVER_IMAGE;
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
  return docs;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const db = await getDb();
  return db.collection<BlogPost>(COLLECTION).findOne({ slug }, { projection: { _id: 0 } });
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
