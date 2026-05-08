// scripts/check-content.ts
//
// Hard-fails on:
//   1. Any MDX file under content/ whose frontmatter doesn't validate
//      against its `type`'s zod schema.
//   2. Any image path referenced from MDX (frontmatter `heroImage`, `cover`,
//      `ogImage`, `sampleSpreads[]`, or inline `![](…)`) that doesn't exist
//      under public/.
//   3. Any leftover typo (`harmone`, `manue`, `plannig`, `conultation`).
//   4. Any duplicate slug within a content type.
//   5. Any Elementor leakage (`elementor-`, `data-elementor`, `wp-content/uploads`).

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";
import { FrontmatterByType } from "../lib/content/types";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");

const FORBIDDEN_TYPOS = ["harmone", "manue", "plannig", "conultation"];
const ELEMENTOR_LEAKS = ["elementor-", "data-elementor", "wp-content/uploads"] as const;
const IMAGE_KEYS = ["heroImage", "cover", "ogImage"] as const;
const INLINE_IMG = /!\[[^\]]*\]\((\/media\/[^)\s]+)\)/g;

interface Finding {
  file: string;
  message: string;
}

async function main(): Promise<void> {
  const files = await glob("content/**/*.mdx", { cwd: ROOT, absolute: true });
  const findings: Finding[] = [];
  const seenSlugs = new Map<string, string>();

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const raw = await readFile(file, "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as { type?: keyof typeof FrontmatterByType };

    if (!fm.type || !(fm.type in FrontmatterByType)) {
      findings.push({
        file: rel,
        message: `frontmatter.type missing or unknown: ${String(fm.type)}`,
      });
      continue;
    }

    const schema = FrontmatterByType[fm.type];
    const result = schema.safeParse(fm);
    if (!result.success) {
      for (const issue of result.error.issues) {
        findings.push({
          file: rel,
          message: `frontmatter ${issue.path.join(".") || "<root>"}: ${issue.message}`,
        });
      }
      continue;
    }

    const fmd = result.data as { type: string; slug: string };
    const key = `${fmd.type}:${fmd.slug}`;
    const prior = seenSlugs.get(key);
    if (prior) {
      findings.push({ file: rel, message: `duplicate slug — also in ${prior}` });
    }
    seenSlugs.set(key, rel);

    for (const k of IMAGE_KEYS) {
      const v = (fm as Record<string, unknown>)[k];
      if (typeof v === "string" && !existsSync(path.join(PUBLIC_DIR, v))) {
        findings.push({
          file: rel,
          message: `image not found: ${v} (frontmatter.${k})`,
        });
      }
    }
    const sampleSpreads = (fm as { sampleSpreads?: unknown[] }).sampleSpreads;
    if (Array.isArray(sampleSpreads)) {
      for (const v of sampleSpreads) {
        if (typeof v === "string" && !existsSync(path.join(PUBLIC_DIR, v))) {
          findings.push({
            file: rel,
            message: `image not found: ${v} (sampleSpreads)`,
          });
        }
      }
    }

    for (const m of parsed.content.matchAll(INLINE_IMG)) {
      const ref = m[1];
      if (!ref) continue;
      if (!existsSync(path.join(PUBLIC_DIR, ref))) {
        findings.push({
          file: rel,
          message: `image not found: ${ref} (inline)`,
        });
      }
    }

    const lower = raw.toLowerCase();
    for (const t of FORBIDDEN_TYPOS) {
      if (lower.includes(t)) {
        findings.push({ file: rel, message: `forbidden typo: "${t}"` });
      }
    }
    for (const t of ELEMENTOR_LEAKS) {
      if (lower.includes(t)) {
        findings.push({ file: rel, message: `elementor leakage: "${t}"` });
      }
    }
  }

  if (findings.length === 0) {
    console.log(`content:check ✓ ${files.length} files, all valid`);
    return;
  }
  console.error(`content:check ✗ ${findings.length} issues across ${files.length} files`);
  for (const f of findings) console.error(`  ${f.file}: ${f.message}`);
  process.exit(1);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
