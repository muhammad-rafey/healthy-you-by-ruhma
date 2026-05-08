// scripts/migrate-media.ts
//
// One-shot AVIF + WEBP pipeline. Reads MANIFEST, encodes each source at
// five widths (400, 800, 1200, 1600, 2400) into AVIF + WEBP, and writes
// to public/media/<category>/<slug>-<width>.<ext>. Idempotent: skips an
// output if it's newer than the source.
//
// Usage: pnpm media:migrate
//        pnpm media:migrate -- --force   (re-encode everything)

import { mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MANIFEST, type MediaEntry } from "./media-manifest";

const SIZES = [400, 800, 1200, 1600, 2400] as const;
const FORMATS = ["avif", "webp"] as const;
const PUBLIC_MEDIA = path.resolve(process.cwd(), "public/media");
const MANIFEST_OUT = path.resolve(process.cwd(), "content/media-manifest.json");

const FORCE = process.argv.includes("--force");

interface EncodePlan {
  entry: MediaEntry;
  width: number;
  format: (typeof FORMATS)[number];
  outPath: string;
}

interface ManifestRow {
  category: MediaEntry["category"];
  slug: string;
  alt: string;
  widths: number[];
  avif: string[];
  webp: string[];
}

async function isOutdated(srcPath: string, outPath: string): Promise<boolean> {
  if (FORCE) return true;
  if (!existsSync(outPath)) return true;
  const [s, o] = await Promise.all([stat(srcPath), stat(outPath)]);
  return s.mtimeMs > o.mtimeMs;
}

async function encode(plan: EncodePlan): Promise<{ skipped: boolean; bytes: number }> {
  const { entry, width, format, outPath } = plan;
  if (!(await isOutdated(entry.src, outPath))) {
    return { skipped: true, bytes: 0 };
  }
  await mkdir(path.dirname(outPath), { recursive: true });

  const pipeline = sharp(entry.src, { failOn: "warning" })
    .rotate()
    .resize({ width, withoutEnlargement: true, fit: "inside" });

  const encoded =
    format === "avif"
      ? pipeline.avif({ quality: 55, effort: 6, chromaSubsampling: "4:2:0" })
      : pipeline.webp({ quality: 78, effort: 5 });

  const { size } = await encoded.toFile(outPath);
  return { skipped: false, bytes: size };
}

async function planFor(entry: MediaEntry): Promise<EncodePlan[]> {
  const meta = await sharp(entry.src).metadata();
  const sourceWidth = meta.width ?? 0;
  const ceiling = entry.maxSize ?? 2400;
  const cap = Math.min(sourceWidth, ceiling);
  const widths: number[] = SIZES.filter((w) => w <= cap);
  // Always include the actual cap (source width or maxSize) as the largest
  // encoded width — otherwise a 750px source generates only 400px output
  // because 800 > 750.
  if (cap > 0 && !widths.includes(cap)) widths.push(cap);
  widths.sort((a, b) => a - b);
  const plans: EncodePlan[] = [];
  for (const width of widths) {
    for (const format of FORMATS) {
      plans.push({
        entry,
        width,
        format,
        outPath: path.join(PUBLIC_MEDIA, entry.category, `${entry.slug}-${width}.${format}`),
      });
    }
  }
  return plans;
}

async function main(): Promise<void> {
  if (MANIFEST.length === 0) {
    console.error("media-manifest.ts is empty — populate it before running");
    process.exit(2);
  }

  const errors: string[] = [];
  let totalEncoded = 0;
  let totalSkipped = 0;
  let totalBytes = 0;
  const start = Date.now();

  const manifestOut: Record<string, ManifestRow> = {};

  for (const entry of MANIFEST) {
    if (!existsSync(entry.src)) {
      errors.push(`missing source: ${entry.src} (${entry.category}/${entry.slug})`);
      continue;
    }
    const plans = await planFor(entry);
    const results = await Promise.all(plans.map(encode));
    const encoded = results.filter((r) => !r.skipped).length;
    const skipped = results.length - encoded;
    const bytes = results.reduce((acc, r) => acc + r.bytes, 0);
    totalEncoded += encoded;
    totalSkipped += skipped;
    totalBytes += bytes;
    console.log(`  ${entry.category}/${entry.slug}: ${encoded} encoded, ${skipped} cached`);

    const widths = Array.from(new Set(plans.map((p) => p.width))).sort((a, b) => a - b);
    manifestOut[`${entry.category}/${entry.slug}`] = {
      category: entry.category,
      slug: entry.slug,
      alt: entry.alt,
      widths,
      avif: widths.map((w) => `/media/${entry.category}/${entry.slug}-${w}.avif`),
      webp: widths.map((w) => `/media/${entry.category}/${entry.slug}-${w}.webp`),
    };
  }

  await mkdir(path.dirname(MANIFEST_OUT), { recursive: true });
  await writeFile(MANIFEST_OUT, `${JSON.stringify(manifestOut, null, 2)}\n`, "utf8");

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `\nDone in ${elapsed}s — ${totalEncoded} encoded, ${totalSkipped} cached, ` +
      `${(totalBytes / 1024 / 1024).toFixed(2)} MB written`,
  );
  console.log(`Wrote manifest: ${path.relative(process.cwd(), MANIFEST_OUT)}`);

  if (errors.length > 0) {
    console.error(`\n${errors.length} errors:`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
