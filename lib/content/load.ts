// lib/content/load.ts
//
// Cached MDX loader. Read a file under content/, separate frontmatter from
// body via gray-matter, validate the frontmatter against the type-specific
// zod schema, and return both. Throws on schema failure — pages should
// surface that as a build error, never silently render bad data.
//
// Pages should call these helpers from RSC only. The MDX body is returned as
// a raw string; pages use `next-mdx-remote` (or whatever future renderer) to
// turn it into elements.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import {
  type AboutFrontmatter,
  type ContentType,
  type FocusFrontmatter,
  FrontmatterByType,
  type JournalFrontmatter,
  type LegalFrontmatter,
  type LibraryFrontmatter,
  type ProgramFrontmatter,
} from "./types";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

export type LoadedDocument<T> = {
  frontmatter: T;
  body: string;
  filePath: string;
};

async function loadAndParse<T>(
  type: ContentType,
  relativePath: string,
): Promise<LoadedDocument<T>> {
  const filePath = path.join(CONTENT_ROOT, relativePath);
  const raw = await readFile(filePath, "utf8");
  const parsed = matter(raw);
  const schema = FrontmatterByType[type];
  const result = schema.safeParse(parsed.data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(
      `Invalid frontmatter in ${relativePath} (type=${type}): ${issues}`,
    );
  }
  return {
    frontmatter: result.data as T,
    body: parsed.content.trim(),
    filePath,
  };
}

export const loadProgram = cache(
  async (slug: string): Promise<LoadedDocument<ProgramFrontmatter>> =>
    loadAndParse<ProgramFrontmatter>("program", `programs/${slug}.mdx`),
);

export const loadFocus = cache(
  async (slug: string): Promise<LoadedDocument<FocusFrontmatter>> =>
    loadAndParse<FocusFrontmatter>("focus", `focus/${slug}.mdx`),
);

export const loadLibrary = cache(
  async (slug: string): Promise<LoadedDocument<LibraryFrontmatter>> =>
    loadAndParse<LibraryFrontmatter>("library", `library/${slug}.mdx`),
);

export const loadJournal = cache(
  async (slug: string): Promise<LoadedDocument<JournalFrontmatter>> =>
    loadAndParse<JournalFrontmatter>("journal", `journal/${slug}.mdx`),
);

export const loadLegal = cache(
  async (
    slug: "privacy" | "terms" | "refunds",
  ): Promise<LoadedDocument<LegalFrontmatter>> =>
    loadAndParse<LegalFrontmatter>("legal", `legal/${slug}.mdx`),
);

export const loadAbout = cache(
  async (): Promise<LoadedDocument<AboutFrontmatter>> =>
    loadAndParse<AboutFrontmatter>("about", "about.mdx"),
);

/**
 * List slugs in a content directory by reading filenames. Used by the page
 * components that need to enumerate (e.g. `/library` index, the static
 * `generateStaticParams` for `/programs/[slug]`).
 */
export async function listSlugs(
  dir: "programs" | "focus" | "library" | "journal" | "legal",
): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(path.join(CONTENT_ROOT, dir));
  return entries
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/u, ""))
    .sort();
}

/**
 * Resolve a media manifest entry to a srcSet-ready set of paths. Pages turn
 * this into `next/image`'s `src` + custom `srcSet`. Reads the JSON manifest
 * lazily.
 */
export async function loadMediaManifest(): Promise<
  Record<string, { avif: string[]; webp: string[]; widths: number[] }>
> {
  const file = path.join(process.cwd(), "content/media-manifest.json");
  const raw = await readFile(file, "utf8");
  return JSON.parse(raw) as Record<
    string,
    { avif: string[]; webp: string[]; widths: number[] }
  >;
}
