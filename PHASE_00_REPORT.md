# Phase 00 — Project Setup & Tooling — Report

Status: **COMPLETE**. All local verifications green. Nothing committed (left staged for review per user instruction).

## What was implemented

### Created (new)

- `.nvmrc` — pins Node 20 (per plan)
- `.npmrc` — `engine-strict`, `auto-install-peers`, `strict-peer-dependencies=false`
- `.env.example` — `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- `.prettierrc.json` — print width 100, `prettier-plugin-tailwindcss`, `tailwindFunctions` for cn/clsx/cva/tw
- `.prettierignore` — ignores `.next`, `node_modules`, `out`, `public`, lockfile, `.vercel`, `content`
- `.editorconfig` — 2-space, LF, UTF-8, trim trailing whitespace
- `.husky/pre-commit` — runs `pnpm exec lint-staged` (chmod 0755)
- `.github/workflows/ci.yml` — checkout → pnpm setup → Node from `.nvmrc` → install (frozen) → typecheck → lint → format:check → build
- `.vscode/extensions.json` — eslint, prettier, tailwind, mdx, editorconfig
- `.vscode/settings.json` — formatOnSave + ESLint code action + tailwind classRegex
- `app/page.tsx` (rewritten) — minimal "Healthy You By Ruhma" hello-world page
- `PHASE_00_REPORT.md` (this file)

### Modified (scaffold output overridden)

- `package.json` — added `engines`, `packageManager: pnpm@11.0.8`, scripts (`dev` with `--turbopack`, `lint:fix`, `format`, `format:check`, `typecheck`, `ci`, `prepare`), `lint-staged` block, dev deps (prettier, prettier-plugin-tailwindcss, eslint-config-prettier, husky, lint-staged)
- `tsconfig.json` — strict + `noUncheckedIndexedAccess` + `noImplicitOverride` + `noFallthroughCasesInSwitch` + `forceConsistentCasingInFileNames`. Note: `jsx` was set to `react-jsx` by Next 16 (it requires automatic runtime; the plan said `preserve` but Next 16 mandates `react-jsx` and rewrote it on first build — accepted).
- `eslint.config.mjs` — extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript` + `eslint-config-prettier` rules; adds the strict rules from §4.7 (`no-explicit-any: error`, `consistent-type-imports`, `no-unused-vars` with `^_` pattern, `jsx-curly-brace-presence`, `no-console: warn`, `import/order: off`); ignores list per plan.
- `.gitignore` — replaced scaffold default with the plan's full version
- `README.md` — replaced scaffold default with the plan's brand-aware skeleton (script table got wider columns after Prettier formatted it; content unchanged)
- `pnpm-workspace.yaml` — replaced the scaffold's `ignoredBuiltDependencies` placeholder block with `allowBuilds: { sharp: true, unrs-resolver: true }` so pnpm 11 doesn't error on `ERR_PNPM_IGNORED_BUILDS`

### Untouched scaffold files

- `app/layout.tsx`, `app/globals.css`, `next.config.ts`, `postcss.config.mjs`, `next-env.d.ts`, `public/*`, `AGENTS.md`, `CLAUDE.md`

## Verification — `pnpm typecheck && pnpm lint && pnpm build`

```
$ tsc --noEmit
---typecheck OK---
$ eslint
---lint OK---
✓ Generating static pages using 5 workers (4/4) in 275ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
---build OK---
```

Additional checks performed:

- `pnpm format:check` → "All matched files use Prettier code style!"
- `pnpm run ci` (full pipeline: typecheck + lint + format:check + build) → exit 0
- Dev server smoke test: `pnpm dev` → `curl -sI http://localhost:3000` → `HTTP/1.1 200 OK`
- `pnpm install` second run is clean (no warnings, sharp + unrs-resolver build successfully)

## Skipped / stubbed (per user constraints)

| Item                                                                    | Reason                                                                                                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh repo create`, `git push`, `gh run watch`                            | User instructed: skip GitHub infra. Repo will be wired in a later session.                                                                                                |
| `vercel login`, `vercel link`, `vercel env add`, `vercel deploy`        | User instructed: skip Vercel infra. Vercel devDep also omitted from `package.json` until then.                                                                            |
| Branch protection (`gh api`)                                            | Skipped with GitHub.                                                                                                                                                      |
| Pre-commit smoke test (`5.16`)                                          | User instructed: do not commit yet. Hook is installed (`.husky/pre-commit`, mode 0755) and `lint-staged` config is in `package.json`; first real commit will exercise it. |
| `phase-0-complete` git tag                                              | Skipped — no commit.                                                                                                                                                      |
| `gh auth status` / `corepack prepare pnpm@9.12.0 --activate` (5.1, 5.2) | User confirmed pnpm 11.0.8 already activated; node 24.14.1 in use (system). Plan said pin Node 20 in `.nvmrc` (done) but use system node for install (also done).         |

No `TODO(infra):` comments were needed — all skipped items are external infra wiring, not in-tree code.

## Deviations from the plan

1. **Next.js version**: scaffold pulled `next@16.2.5` (latest), not `15`. The plan was written when 15 was current. Floor pin in `package.json` is `16.2.5`. No code changes required — App Router + Turbopack flags are unchanged.
2. **`lint` script**: plan specified `next lint`, which Next 16 has deprecated. Now `eslint` (matches what `create-next-app@16` generated; ESLint flat config does the work). `lint:fix` is `eslint --fix`.
3. **`packageManager` field**: plan said `pnpm@9.12.0`; user has pnpm 11.0.8 activated, so set to `pnpm@11.0.8`. `engines.pnpm` left at `>=9.0.0` per plan.
4. **ESLint config style**: plan used legacy `FlatCompat` + `compat.extends("next/core-web-vitals", "next/typescript", "prettier")`. The new `eslint-config-next@16` ships native flat configs at `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` (the scaffold's pattern). Adopted the new style — strict rules from §4.7 are applied identically. `eslint-config-prettier@9` does not have a `/flat` subpath, so we apply `prettier.rules` directly inside a flat-config block (equivalent effect — disables the stylistic rules Prettier handles).
5. **`tsconfig.json#jsx`**: plan said `"preserve"`. Next 16 mandates `"react-jsx"` (automatic runtime) and silently rewrites the file on first `next build`. Accepted; this is a Next-16-specific change and does not affect the strict-mode goals of the plan.
6. **`pnpm-workspace.yaml`**: pnpm 11 changed the build-script approval flow. The scaffold writes a placeholder `ignoredBuiltDependencies` block that pnpm 11 then errors on with `ERR_PNPM_IGNORED_BUILDS`. Replaced with `allowBuilds: { sharp: true, unrs-resolver: true }` so install completes. This file isn't mentioned in the plan because pnpm 9 didn't need it.
7. **`vercel` devDep omitted**: plan §4.5 lists it; user instructed to skip Vercel wiring. The dep is only needed when running `vercel link` / `vercel env pull` locally; CI doesn't need it. Easy to add later.
8. **Plan files were Prettier-formatted**: `pnpm format` reformatted markdown in `plan/` (the plan ignores `content/` but not `plan/`). Content of all plan documents is unchanged — only line-wrapping/table-alignment whitespace was adjusted to satisfy `format:check`. If you want plan files preserved verbatim, add `plan` to `.prettierignore` before the next `pnpm format` run.

## What's staged for review

`git status` (un-tracked + modifications) is left as-is. Recommended commit when satisfied:

```
chore: scaffold Next.js 16 app with strict TS, Tailwind v4, ESLint, Prettier, Husky, CI

- create-next-app@latest (Next 16.2.5) with --ts --tailwind --app --eslint --turbopack --no-src-dir
- TypeScript strict + noUncheckedIndexedAccess + noImplicitOverride
- ESLint flat config: next/core-web-vitals + next/typescript + prettier; no-explicit-any: error
- Prettier with prettier-plugin-tailwindcss
- Husky + lint-staged pre-commit (Prettier + ESLint --fix --max-warnings=0)
- GitHub Actions: typecheck, lint, format:check, build on PR/push to main
- pnpm via corepack (engine-strict, lockfile committed; allowBuilds for sharp + unrs-resolver)
- .env.example, README skeleton, .vscode recommendations
```

Then in a follow-up session: `gh repo create`, `vercel link`, branch protection, tag.
