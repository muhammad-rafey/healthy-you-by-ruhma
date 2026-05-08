// scripts/optimize-wordmark.ts
//
// One-shot svgo optimization of the brand wordmark.
// The wordmark file is `Artboard-4.svg` in the WP backup. Phase 02 may have
// authored its own wordmark.svg already; if so, we leave it alone unless
// invoked with --force.

import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { optimize } from "svgo";

const SRC = "/home/duh/Documents/website backup (1)/uploads/2024/06/Artboard-4.svg";
const OUT = path.resolve(process.cwd(), "public/wordmark.svg");
const FORCE = process.argv.includes("--force");

async function main(): Promise<void> {
  if (existsSync(OUT) && !FORCE) {
    const existing = await readFile(OUT, "utf8");
    console.log(
      `wordmark exists at ${path.relative(process.cwd(), OUT)} (${existing.length} bytes) — pass --force to overwrite`,
    );
    return;
  }
  if (!existsSync(SRC)) {
    console.error(`source not found: ${SRC}`);
    process.exit(1);
  }
  const raw = await readFile(SRC, "utf8");
  const result = optimize(raw, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
            mergePaths: false,
          },
        },
      },
      "removeDimensions",
      "sortAttrs",
    ],
  });
  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, result.data, "utf8");
  console.log(`wordmark: ${raw.length} → ${result.data.length} bytes`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
