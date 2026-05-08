# Phase 00 Review

## CRITICAL

- [ ] (none)

## MAJOR

- [ ] **CI will fail: pnpm version mismatch between workflow and project.** `/home/duh/Projects/healthy-you-by-ruhma/.github/workflows/ci.yml:26` pins `pnpm/action-setup@v4` to `version: 9`, but `package.json:9` declares `"packageManager": "pnpm@11.0.8"` and the local install was performed with pnpm 11. `pnpm/action-setup` honors the `packageManager` field — when both are specified, behavior depends on action version, and at minimum the pnpm 11 lockfile features and `pnpm-workspace.yaml` `allowBuilds:` syntax (pnpm 10+) won't be understood by pnpm 9. Fix: bump CI to `version: 11` (or remove the `version` input so it reads `packageManager`), and align `engines.pnpm` to `>=10.0.0`.

- [ ] **`pnpm-workspace.yaml` uses pnpm-10+ `allowBuilds:` syntax but CI runs pnpm 9.** `/home/duh/Projects/healthy-you-by-ruhma/pnpm-workspace.yaml:1` uses `allowBuilds:` for sharp/unrs-resolver. pnpm 9 doesn't recognize this key and will either ignore it (then fail with `ERR_PNPM_IGNORED_BUILDS` during `pnpm install --frozen-lockfile`) or warn. Same fix as above — pin CI to pnpm 11. (This is the same root cause as the previous finding but deserves separate mention because it's the concrete failure mode.)

- [ ] **README stack section still says "Next.js 15".** `/home/duh/Projects/healthy-you-by-ruhma/README.md:10` claims "Next.js 15 (App Router, RSC)" but the project ships Next 16.2.5 (`package.json:23`). Minor doc drift but it'll mislead future agents reading the README to orient themselves. Fix: update the line to "Next.js 16".

- [ ] **`vercel` devDep omitted from `package.json`.** Plan §4.5 lists `vercel@^39` as a devDep. Implementer skipped because Vercel wiring was descoped, but the dep itself is independent of doing the wiring (it just enables future `vercel link` / `vercel env pull` runs). This is borderline — listing it in the report under "deviations" is acceptable, and re-adding it is a one-liner when Vercel work resumes. Flagging as MAJOR-leaning-MINOR; a future agent expecting `pnpm exec vercel` to work locally will hit a missing-binary error. Fix: `pnpm add -D vercel` (one line) when Vercel phase begins; not blocking now.

- [ ] **`lint-staged` runs `eslint --fix --max-warnings=0` but the `lint` script does not.** `package.json:14` is `"lint": "eslint"` (no `--max-warnings=0`). Plan acceptance criterion in §6 requires "`pnpm lint` exits 0 with zero warnings". As-is, warnings (e.g., from `no-console`) will not fail `pnpm lint` or CI's lint step, only the pre-commit hook. Fix: change `lint` to `eslint --max-warnings=0` (and `lint:fix` accordingly) so CI and the hook agree.

## VERIFIED PASSING

- typecheck: PASS
- lint: PASS
- format:check: PASS
- build: PASS

## Verdict

APPROVE_WITH_FIXES
