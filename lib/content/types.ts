// lib/content/types.ts
//
// Frontmatter schemas for every content type under content/. Validated by
// scripts/check-content.ts and consumed (via lib/content/load.ts) by the
// page components added in plans 04–12.
//
// Schemas are zod v4. Each MDX frontmatter starts with `type: <kind>` so the
// validator can pick the right schema.

import { z } from "zod";

const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, "kebab-case only");

const mediaPath = z
  .string()
  .regex(
    /^\/media\/.+\.(avif|webp|png|jpg|svg)$/u,
    "must be a /media/... image path",
  );

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "YYYY-MM-DD");

// ───────────────────────── programs/*.mdx
export const ProgramFrontmatter = z.object({
  type: z.literal("program"),
  slug,
  title: z.string(),
  eyebrow: z.string(),
  description: z.string().max(220),
  heroImage: mediaPath,
  ogImage: mediaPath.optional(),
  priceFrom: z.number().int().positive(),
  currency: z.literal("PKR"),
  ctaLabel: z.string().default("Book your slot"),
  ctaHref: z
    .string()
    .refine((v) => v.startsWith("/") || /^https?:\/\//u.test(v), {
      message: "must be an absolute URL or a path starting with /",
    }),
  whatsIncluded: z
    .array(
      z.object({
        icon: z.enum([
          "fennel",
          "mint",
          "citrus",
          "leaf",
          "seed",
          "sprig",
          "root",
          "pestle",
        ]),
        label: z.string(),
      }),
    )
    .min(3)
    .max(8)
    .optional(),
  steps: z
    .array(
      z.object({
        n: z.string().regex(/^\d{2}$/u),
        title: z.string(),
        body: z.string(),
      }),
    )
    .optional(),
});
export type ProgramFrontmatter = z.infer<typeof ProgramFrontmatter>;

// ───────────────────────── focus/*.mdx
export const FocusFrontmatter = z.object({
  type: z.literal("focus"),
  slug,
  title: z.string(),
  eyebrow: z.literal("Focus area"),
  description: z.string().max(220),
  heroImage: mediaPath.optional(),
  ogImage: mediaPath.optional(),
  related: z
    .object({
      program: slug.optional(),
      library: slug.optional(),
    })
    .optional(),
});
export type FocusFrontmatter = z.infer<typeof FocusFrontmatter>;

// ───────────────────────── library/*.mdx (master §3.10 contract)
export const LibraryFrontmatter = z
  .object({
    type: z.literal("library"),
    slug,
    title: z.string(),
    eyebrow: z.string(),
    description: z.string().max(280),
    price: z.number().int().positive(),
    salePrice: z.number().int().positive().optional(),
    currency: z.literal("PKR"),
    buyUrl: z.string().url(),
    cover: mediaPath,
    ogImage: mediaPath.optional(),
    format: z.string().default("Digital · PDF"),
    pages: z.number().int().positive().optional(),
    sampleSpreads: z.array(mediaPath).min(1).max(5),
    toc: z.array(z.string()).min(3).max(20),
  })
  .refine((d) => d.salePrice === undefined || d.salePrice < d.price, {
    message: "salePrice must be less than price",
  });
export type LibraryFrontmatter = z.infer<typeof LibraryFrontmatter>;

// ───────────────────────── journal/*.mdx
export const JournalFrontmatter = z.object({
  type: z.literal("journal"),
  slug,
  title: z.string(),
  description: z.string().max(280),
  category: z.enum([
    "nutrition",
    "hormones",
    "lifestyle",
    "recipes",
    "case-notes",
  ]),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  readingTime: z.number().int().positive(),
  heroImage: mediaPath.optional(),
  ogImage: mediaPath.optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  author: z.literal("Dr. Ruhma").default("Dr. Ruhma"),
});
export type JournalFrontmatter = z.infer<typeof JournalFrontmatter>;

// ───────────────────────── legal/*.mdx
export const LegalFrontmatter = z.object({
  type: z.literal("legal"),
  slug: z.enum(["privacy", "terms", "refunds"]),
  title: z.string(),
  lastUpdated: isoDate,
  description: z.string().max(220),
});
export type LegalFrontmatter = z.infer<typeof LegalFrontmatter>;

// ───────────────────────── about.mdx (long-form bio paragraphs)
export const AboutFrontmatter = z.object({
  type: z.literal("about"),
  slug: z.literal("about"),
  title: z.string(),
  eyebrow: z.string(),
  description: z.string().max(220),
  heroImage: mediaPath.optional(),
  ogImage: mediaPath.optional(),
});
export type AboutFrontmatter = z.infer<typeof AboutFrontmatter>;

export const FrontmatterByType = {
  program: ProgramFrontmatter,
  focus: FocusFrontmatter,
  library: LibraryFrontmatter,
  journal: JournalFrontmatter,
  legal: LegalFrontmatter,
  about: AboutFrontmatter,
} as const;

export type ContentType = keyof typeof FrontmatterByType;
