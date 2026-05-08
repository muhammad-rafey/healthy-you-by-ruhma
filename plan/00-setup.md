# Phase 0 — Project Setup & Tooling

> Implementation plan #00 of 15. Covers everything before any feature work: scaffold, language strictness, formatting, linting, hooks, CI, hosting wiring, and repo hygiene. Master plan reference: §4 (stack), §5 (repo & tooling), §8 phase 0.

---

## 1. Goal

Stand up an empty-but-rigorous Next.js 15 + TypeScript-strict + Tailwind v4 application at `/home/duh/Projects/healthy-you-by-ruhma/`, wired to GitHub (`muhammad-rafey/healthy-you-by-ruhma`, private) and Vercel, with formatting, linting, pre-commit hooks, and PR-time CI all green on a "hello world" home page. **No design tokens, no fonts, no content yet** — just the chassis.

---

## 2. Pre-requisites

None. This is plan #00. The only assumed state is:

- The clone exists at `/home/duh/Projects/healthy-you-by-ruhma/` and currently contains only `plan/` (with this file and the master plan).
- The GitHub repo `muhammad-rafey/healthy-you-by-ruhma` already exists and `origin` is set, OR `gh auth status` is logged in so we can create it. **Verify before scaffolding** (step 5.1).
- `node` ≥ 20.11 LTS is on `PATH` (Next.js 15 requires ≥ 18.18; we standardize on 20 LTS).
- `gh` CLI is installed and authenticated (`gh auth status` returns OK).
- The user has a Vercel account; `vercel` CLI will be installed via pnpm.

---

## 3. Dependencies

All packages installed as part of this phase. Versions are floor-pinned via `^` ranges in `package.json`; the lockfile (`pnpm-lock.yaml`) pins exact versions.

### Runtime (none yet beyond what `create-next-app` adds)

`create-next-app` will add: `next@^15`, `react@^19`, `react-dom@^19`. We add nothing else in this phase — Tailwind v4 is set up by the scaffold (`--tailwind` flag), but real tokens come in plan #01.

### Dev dependencies (added by this phase)

| Package                                           | Why                                                                                  |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `typescript@^5`                                   | Already added by scaffold; we tighten `tsconfig.json`.                               |
| `@types/node`, `@types/react`, `@types/react-dom` | Already added by scaffold.                                                           |
| `eslint@^9`, `eslint-config-next@^15`             | Already added by scaffold; we tighten and add `next/core-web-vitals` + strict rules. |
| `prettier@^3`                                     | Code formatting, single source of truth for whitespace.                              |
| `prettier-plugin-tailwindcss@^0.6`                | Auto-sorts Tailwind class lists deterministically.                                   |
| `eslint-config-prettier@^9`                       | Disables ESLint stylistic rules that would fight Prettier.                           |
| `husky@^9`                                        | Git hook installer; runs lint-staged on `pre-commit`.                                |
| `lint-staged@^15`                                 | Runs Prettier + ESLint only on staged files for fast pre-commit feedback.            |
| `@types/lint-staged`                              | Type hints for the rare programmatic config.                                         |
| `vercel@^39` (devDep)                             | Local `vercel link` / `vercel env pull`; CI doesn't need it.                         |

Tailwind v4's `@tailwindcss/postcss` is already added by the scaffold; we leave it untouched here.

**Not added in this phase** (deferred to later plans, listed here so future agents don't double-add):

- `motion`, `clsx`, `tailwind-variants`, `tailwind-merge` — plan #01 (design system)
- `next-mdx-remote`, `gray-matter`, `rehype-*`, `remark-*` — plan #06 (content pipeline)
- `react-hook-form`, `zod`, `resend` — plan #11 (contact)
- `@vercel/og`, `next-sitemap`, `schema-dts` — plan #13 (SEO/polish)
- `sharp` — plan #07 (image migration; Next bundles a copy at build time, so no runtime install needed before then)
- `shadcn/ui` (init via `pnpm dlx shadcn@latest init`) — plan #01

---

## 4. Files to create / modify

All paths absolute under `/home/duh/Projects/healthy-you-by-ruhma/`.

### 4.1 `.nvmrc`

```
20
```

### 4.2 `.npmrc`

```
engine-strict=true
auto-install-peers=true
strict-peer-dependencies=false
```

`engine-strict` makes `pnpm install` refuse to run on a Node that doesn't satisfy `package.json#engines.node`. `auto-install-peers` matches Next.js's expectations. `strict-peer-dependencies=false` because shadcn/ui's Radix peers will otherwise complain in plan #01.

### 4.3 `.gitignore` (create; the scaffold will write a baseline — append/replace with this)

```gitignore
# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem
Thumbs.db

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# local env files
.env
.env*.local
.env.development.local
.env.production.local

# typescript
*.tsbuildinfo
next-env.d.ts

# vercel
.vercel

# editor
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.zed/

# os
*~
.cache/

# tooling caches
.eslintcache
.prettiercache
```

### 4.4 `.env.example`

```dotenv
# Public site URL — used by sitemap, OG images, canonical tags. Set per environment in Vercel.
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Resend (server-side email for contact form). Plan #11 wires this up.
RESEND_API_KEY=

# Plausible (client analytics). Plan #13 wires this up.
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# Vercel Analytics requires no key (it's auto-injected on Vercel).
```

Real `.env.local` is never committed. Vercel Project Settings → Environment Variables holds production values.

### 4.5 `package.json` (post-scaffold, after our edits)

```json
{
  "name": "healthy-you-by-ruhma",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.11.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.12.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "ci": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm build",
    "prepare": "husky"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "^15",
    "eslint-config-prettier": "^9",
    "husky": "^9",
    "lint-staged": "^15",
    "prettier": "^3",
    "prettier-plugin-tailwindcss": "^0.6",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vercel": "^39"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["prettier --write", "eslint --fix --max-warnings=0"],
    "*.{json,md,mdx,yml,yaml,css}": ["prettier --write"]
  }
}
```

The exact version floors will be whatever `create-next-app` resolves at scaffold time; do not downgrade.

### 4.6 `tsconfig.json`

Override the scaffold's generated config with the strict version:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": false,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "verbatimModuleSyntax": false,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Notes:

- `strict: true` + `noUncheckedIndexedAccess` means `array[i]` is typed as `T | undefined`. This will surface real bugs in plan #06's MDX iteration; we accept it.
- `exactOptionalPropertyTypes` is **off** — Radix/shadcn props don't model `?: T | undefined` distinctly and we don't want the friction.
- `noPropertyAccessFromIndexSignature` is **off** so `process.env.FOO` stays ergonomic.

### 4.7 `eslint.config.mjs` (flat config — Next 15 + ESLint 9 default)

```js
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "import/order": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "out/**", "public/**", "next-env.d.ts", ".vercel/**"],
  },
];

export default config;
```

We rely on `next/typescript` to pull in the typescript-eslint plugin. `prettier` (last) disables stylistic rules that fight Prettier. `no-explicit-any` is `error` to enforce master §5 ("no `any`").

### 4.8 `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn", "clsx", "cva", "tw"]
}
```

`tailwindFunctions` is harmless now (those helpers don't exist yet); it's ready for plan #01.

### 4.9 `.prettierignore`

```
.next
node_modules
out
public
pnpm-lock.yaml
.vercel
content
*.min.*
*.tsbuildinfo
```

`content/` will hold MDX in plan #06 — Prettier's MDX support is finicky; we defer formatting that tree to a later, dedicated pass.

### 4.10 `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

### 4.11 `.husky/pre-commit`

```sh
pnpm exec lint-staged
```

(File is mode 0755. `husky` v9 no longer needs the shebang/sourcing dance — a single command line is enough.)

### 4.12 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    name: Typecheck · Lint · Format · Build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Format check
        run: pnpm format:check

      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

We pass a placeholder `NEXT_PUBLIC_SITE_URL` so any future code that imports it at build time doesn't blow up CI. Real values are pulled from Vercel for preview/prod builds.

### 4.13 `.github/workflows/codeql.yml` (optional, recommended)

Skipped in Phase 0 — we'll add CodeQL in plan #14 (security/polish) once there's enough first-party code to make the scan meaningful.

### 4.14 `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "unifiedjs.vscode-mdx",
    "editorconfig.editorconfig"
  ]
}
```

### 4.15 `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

### 4.16 `README.md` (skeleton — replaces the scaffold's default)

````md
# Healthy You By Ruhma

Next.js redesign of [dietitianruhma.com](https://dietitianruhma.com) for **Dr. Ruhma** — clinical dietitian, Lahore.
Brand: **Healthy You By Ruhma**. Currency: **PKR**.

> Editorial, photography-led, restrained motion. See `plan/redesign-plan.md` for the full design plan.

## Stack

- Next.js 15 (App Router, RSC) · TypeScript strict
- Tailwind CSS v4 (CSS-variable tokens)
- shadcn/ui (Radix-backed primitives)
- Motion v11 (three motion primitives only)
- MDX in repo for long-form content (`content/`)
- Hosted on Vercel

See `plan/redesign-plan.md` §4 for the full rationale.

## Requirements

- Node 20.11+
- pnpm 9+ (via `corepack enable`)

## Getting started

```bash
corepack enable
pnpm install
cp .env.example .env.local   # fill in values as needed
pnpm dev                     # http://localhost:3000
```
````

## Scripts

| Command             | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Dev server (Turbopack) on :3000                                |
| `pnpm build`        | Production build                                               |
| `pnpm start`        | Serve production build                                         |
| `pnpm lint`         | ESLint with `next/core-web-vitals` + strict rules              |
| `pnpm lint:fix`     | ESLint, auto-fix                                               |
| `pnpm format`       | Prettier write                                                 |
| `pnpm format:check` | Prettier check (CI uses this)                                  |
| `pnpm typecheck`    | `tsc --noEmit`, strict mode                                    |
| `pnpm ci`           | Run all of the above sequentially (parity with GitHub Actions) |

## Project structure

See `plan/redesign-plan.md` §5. In brief:

```
app/         routes
components/  ui (shadcn) · marketing · motion · layout
content/     mdx — programs · focus · library · journal · legal
lib/         tokens · seo · og helpers
public/      media · illustrations
plan/        15-file implementation plan
```

## Implementation status

Tracked across `plan/00-setup.md` … `plan/14-cutover.md`. This README will grow as phases complete.

## License

Private / unlicensed. All content © Healthy You By Ruhma.

````

---

## 5. Step-by-step tasks

Run all commands from `/home/duh/Projects/healthy-you-by-ruhma/` unless a different `cd` is shown. Every command is the literal string to execute.

### 5.1 Verify prereqs (do not skip)

```bash
node --version                                                 # expect v20.x
gh auth status                                                 # expect "Logged in to github.com"
gh repo view muhammad-rafey/healthy-you-by-ruhma --json name   # expect non-error; if error, see 5.2.b
ls /home/duh/Projects/healthy-you-by-ruhma/                    # expect: only "plan"
````

If `gh repo view` errors with "Could not resolve to a Repository", create it now:

```bash
gh repo create muhammad-rafey/healthy-you-by-ruhma --private --description "Healthy You By Ruhma — Next.js redesign"
```

### 5.2 Enable corepack + pnpm

```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm --version    # expect 9.12.x or newer
```

### 5.3 Stash the existing `plan/` directory so `create-next-app` doesn't refuse

`create-next-app` requires an empty directory. Move `plan/` aside, scaffold, then move it back.

```bash
cd /home/duh/Projects/healthy-you-by-ruhma
mv plan /tmp/healthy-you-plan-stash
ls -la                                                          # expect: empty (just . and ..)
```

### 5.4 Scaffold Next.js

```bash
cd /home/duh/Projects
pnpm dlx create-next-app@latest healthy-you-by-ruhma \
  --ts \
  --tailwind \
  --app \
  --eslint \
  --no-src-dir \
  --turbopack \
  --import-alias "@/*" \
  --use-pnpm \
  --skip-install
cd healthy-you-by-ruhma
mv /tmp/healthy-you-plan-stash plan
ls -la                                                          # expect: app/ public/ plan/ package.json tsconfig.json eslint.config.mjs postcss.config.mjs etc.
```

`--skip-install` lets us edit `package.json` before the first install so we don't churn the lockfile.

### 5.5 Initialize git (the scaffold may have done this; ensure clean state)

```bash
git init -b main 2>/dev/null || true
git remote get-url origin 2>/dev/null || \
  git remote add origin git@github.com:muhammad-rafey/healthy-you-by-ruhma.git
git remote -v                                                   # expect origin pointing at the GH repo
```

### 5.6 Write all phase-0 config files

Create / overwrite each file from §4 above:

- `.nvmrc`
- `.npmrc`
- `.gitignore` (replace the scaffold's default with §4.3)
- `.env.example`
- `tsconfig.json` (replace scaffold's with §4.6)
- `eslint.config.mjs` (replace with §4.7)
- `.prettierrc.json`
- `.prettierignore`
- `.editorconfig`
- `.github/workflows/ci.yml` (`mkdir -p .github/workflows` first)
- `.vscode/extensions.json`
- `.vscode/settings.json`
- `README.md` (replace scaffold's)

### 5.7 Patch `package.json`

Open `package.json` and merge in:

- `engines`, `packageManager` fields
- `scripts.format`, `scripts.format:check`, `scripts.typecheck`, `scripts.ci`, `scripts.prepare`, `scripts.lint:fix`
- `lint-staged` block

(Final shape per §4.5.)

### 5.8 Install everything

```bash
pnpm install
```

The lockfile (`pnpm-lock.yaml`) is created here. Commit it.

### 5.9 Add the dev tooling that the scaffold didn't include

```bash
pnpm add -D \
  prettier \
  prettier-plugin-tailwindcss \
  eslint-config-prettier \
  husky \
  lint-staged \
  vercel
```

### 5.10 Initialize Husky

```bash
pnpm exec husky init
```

This creates `.husky/pre-commit` containing `pnpm test`. Replace its contents with the single line from §4.11 (`pnpm exec lint-staged`). The `prepare` script we added makes Husky reinstall on every fresh `pnpm install`.

### 5.11 Sanity-check locally

```bash
pnpm typecheck                                                  # expect: no errors
pnpm lint                                                       # expect: no errors
pnpm format                                                     # writes Prettier defaults
pnpm format:check                                               # expect: "All matched files use Prettier code style!"
pnpm build                                                      # expect: success, generates .next/
pnpm dev &                                                      # background; visit http://localhost:3000
sleep 5 && curl -sI http://localhost:3000 | head -1            # expect: "HTTP/1.1 200 OK"
kill %1                                                         # stop dev server
```

If any step fails, fix before proceeding.

### 5.12 First commit

```bash
git add .
git status --short                                              # sanity-check what's about to land
git commit -m "chore: scaffold Next.js 15 app with strict TS, Tailwind v4, ESLint, Prettier, Husky, CI

- create-next-app@latest with --ts --tailwind --app --eslint --turbopack
- TypeScript strict + noUncheckedIndexedAccess
- ESLint flat config: next/core-web-vitals + next/typescript + prettier
- Prettier with prettier-plugin-tailwindcss
- Husky + lint-staged pre-commit (Prettier + ESLint --fix)
- GitHub Actions: typecheck, lint, format:check, build on PR/push to main
- pnpm via corepack (engine-strict, lockfile committed)
- .env.example, README skeleton, .vscode recommendations"
```

### 5.13 Push to GitHub

```bash
git push -u origin main
```

Wait for the first CI run:

```bash
gh run watch --exit-status
```

Expect green. If it fails, fix locally, recommit, repush — **never** disable a check to make CI green.

### 5.14 Link Vercel project

```bash
pnpm exec vercel login                                          # interactive, opens browser
pnpm exec vercel link \
  --yes \
  --project healthy-you-by-ruhma
```

Accept the defaults except: framework = Next.js (auto-detected), root directory = `./`.

This creates `.vercel/project.json` (gitignored). Now configure the project from the dashboard or CLI:

```bash
pnpm exec vercel env add NEXT_PUBLIC_SITE_URL production
# paste: https://healthy-you-by-ruhma.vercel.app   (or final domain when known)
pnpm exec vercel env add NEXT_PUBLIC_SITE_URL preview
# paste: https://$VERCEL_URL  — Vercel auto-substitutes for preview
pnpm exec vercel env add NEXT_PUBLIC_SITE_URL development
# paste: http://localhost:3000
```

Confirm production branch in the dashboard: **Settings → Git → Production Branch = `main`**. Auto-deploys on push to `main`; preview deploys on every PR.

Trigger a first preview to verify wiring:

```bash
pnpm exec vercel deploy
```

Note the URL it prints. Verify the page loads.

### 5.15 Branch protection (one-time, via GitHub UI or CLI)

Set up `main` to require:

- PRs (no direct pushes)
- The `verify` CI job to pass
- Up-to-date branch before merge

Via CLI:

```bash
gh api -X PUT repos/muhammad-rafey/healthy-you-by-ruhma/branches/main/protection \
  -F required_status_checks.strict=true \
  -F 'required_status_checks.contexts[]=verify' \
  -F enforce_admins=false \
  -F required_pull_request_reviews.required_approving_review_count=0 \
  -F restrictions= \
  -F allow_force_pushes=false \
  -F allow_deletions=false
```

(Zero approving reviews because this is a solo repo. Tighten later if collaborators join.)

### 5.16 Smoke test the pre-commit hook

```bash
git checkout -b chore/test-precommit
echo "// trailing-space test   " >> app/page.tsx
git add app/page.tsx
git commit -m "test: precommit hook"                            # expect: lint-staged runs, Prettier strips the trailing space, commit succeeds
git checkout main
git branch -D chore/test-precommit
```

### 5.17 Tag the phase

```bash
git tag -a phase-0-complete -m "Phase 0: project setup & tooling complete"
git push origin phase-0-complete
```

---

## 6. Acceptance criteria

Each is independently testable. Phase is "done" only when **every** bullet is true.

- [ ] `node --version` ≥ v20.11.0; `pnpm --version` ≥ 9.0.0; `corepack` is enabled.
- [ ] Running `pnpm install` from a clean clone (`rm -rf node_modules && pnpm install`) completes with no warnings about missing peers, in under 60s on a warm pnpm store.
- [ ] `pnpm dev` serves http://localhost:3000 and returns HTTP 200 on `curl -sI`.
- [ ] `pnpm build` exits 0 and produces `.next/`. Build log shows no warnings.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm lint` exits 0 with zero warnings (CI uses `--max-warnings=0` semantics implicitly via the `eslint --fix --max-warnings=0` in `lint-staged`).
- [ ] `pnpm format:check` exits 0.
- [ ] `pnpm ci` exits 0 end-to-end.
- [ ] Editing a TS file with trailing whitespace and committing it triggers `lint-staged` and the commit lands cleaned (verified in 5.16).
- [ ] Attempting to commit a file with `let x: any = 1` fails the pre-commit hook with an ESLint error from `@typescript-eslint/no-explicit-any`.
- [ ] `git push` to a feature branch + `gh pr create` triggers the GitHub Actions `verify` job, which runs typecheck, lint, format:check, build — all pass.
- [ ] `main` branch protection requires the `verify` check before merging.
- [ ] `vercel deploy` produces a working preview URL whose homepage renders the Next.js boilerplate `app/page.tsx`.
- [ ] Vercel project's Production Branch is `main`; pushing to `main` auto-deploys.
- [ ] `.vercel/`, `.env.local`, `node_modules`, `.next`, `pnpm-debug.log*` are all gitignored. `pnpm-lock.yaml` is **committed**.
- [ ] `.env.example` exists with `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` documented (empty values).
- [ ] `README.md` lists all scripts and points at `plan/redesign-plan.md`.
- [ ] `tsconfig.json` has `"strict": true` and `"noUncheckedIndexedAccess": true`.
- [ ] `git tag --list phase-0-complete` returns the tag and it's pushed (`git ls-remote --tags origin | grep phase-0-complete`).

---

## 7. Out of scope

Explicitly **not** in this phase. Each is owned by a numbered later plan; do not preempt them.

- **Design tokens, CSS variables, fonts.** No colors beyond Tailwind defaults; no `next/font`; `globals.css` is the scaffold's default. → Plan #01 (design system).
- **Tailwind v4 token configuration in `globals.css` (`@theme`, custom utilities).** Skeleton-only here; the file structure exists but tokens are deferred. → Plan #01.
- **shadcn/ui init and primitives.** No `components/ui/`. → Plan #01.
- **Motion utilities (`<FadeUp>`, `<ImageReveal>`, `<LetterStagger>`).** Package not installed yet. → Plan #02 (motion primitives).
- **Layout shell (Nav, Footer, `app/layout.tsx` customizations beyond scaffold).** → Plan #03.
- **MDX pipeline.** No `next-mdx-remote`, no `gray-matter`, no `content/` directory. → Plan #06.
- **Image optimization / asset migration.** No `sharp`, no `public/media/` populated. → Plan #07.
- **Page implementations.** `app/page.tsx` stays as the scaffold default. → Plans #04 (home), #05 (about/services), #08 (programs), #09 (focus), #10 (library), #11 (journal/contact/legal).
- **301 redirects in `next.config.js`.** → Plan #03 (layout shell).
- **SEO: sitemap, robots, OG images, JSON-LD.** → Plan #13.
- **Forms (contact form, newsletter).** No `react-hook-form`, no `zod`, no `resend`. → Plan #11.
- **Analytics.** Vercel Analytics + Plausible wiring deferred. → Plan #13.
- **Production domain cutover.** Site is on `*.vercel.app` until master §8 phase 7. → Plan #14.
- **Visual regression / E2E tests.** No Playwright, no Chromatic. → Plan #14 if added at all (master plan does not require automated visual regression; Lighthouse + manual review is the bar).
- **Storybook / `/_kit` route.** The kit page is mentioned in master §8 phase 1 — owned by plan #01.
- **CodeQL / dependabot.** Optional security scanning — plan #14.

---

## Appendix A — If something goes wrong

| Symptom                                                                  | Fix                                                                                                                                                                           |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `create-next-app` complains the directory isn't empty                    | Step 5.3 wasn't run; move `plan/` aside.                                                                                                                                      |
| `pnpm install` fails with `ERR_PNPM_UNSUPPORTED_ENGINE`                  | `engine-strict=true` + wrong Node. `nvm use 20` or install Node 20.11+.                                                                                                       |
| Husky hook doesn't run                                                   | `pnpm prepare` to reinstall hooks. Verify `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`.                                                                    |
| ESLint flat config errors with "Cannot find module 'eslint-config-next'" | The scaffold may have generated a legacy `.eslintrc.json`; delete it — flat config (`eslint.config.mjs`) is the only source.                                                  |
| Vercel build fails with `NEXT_PUBLIC_SITE_URL is undefined`              | Add it under all three environments via `vercel env add` (step 5.14).                                                                                                         |
| GH Actions `pnpm install --frozen-lockfile` fails                        | Lockfile drift. Run `pnpm install` locally, commit the updated `pnpm-lock.yaml`, push.                                                                                        |
| Branch protection blocks the very first push to `main`                   | Set protection **after** the first push (5.13 before 5.15). The order in this plan is correct; if you ran them out of order, temporarily disable protection, push, re-enable. |

---

## Appendix B — Why these specific choices

- **pnpm over npm/yarn**: faster cold installs, content-addressed store, strict by default. Master §5 calls it out explicitly.
- **Turbopack `dev`**: stable in Next 15, materially faster HMR; production `build` still uses webpack (Turbopack build is preview-only as of Next 15.0).
- **ESLint flat config**: Next 15 + ESLint 9 default. Avoids the legacy `.eslintrc.json` deprecation path.
- **`noUncheckedIndexedAccess`**: catches a real category of bug (MDX iteration, redirect lookup tables, dynamic route params) at type-check time. Master plan §9 demands "0 axe violations" and a quality bar — this is the type-system equivalent.
- **No Husky shebang/sourcing**: v9 simplified hooks to single-line scripts; the older `. "$(dirname -- "$0")/_/husky.sh"` line is no longer needed and is a deprecation noise source if added.
- **`prettier-plugin-tailwindcss` from day one**: deterministic class ordering means diffs in plan #01+ are about _intent_, not _order_. Cheap to add now, expensive to retrofit later.
- **CI = typecheck + lint + format:check + build** (in that order): fast feedback first (typecheck ~5s) before the slow step (build ~60s). Matches `pnpm ci` so local parity is exact.
- **Branch protection requires `verify` only**: solo repo, zero reviewer requirement. Tighten when a second contributor joins.
- **Vercel project linked early**: every PR gets a preview URL automatically — invaluable for design QA across plans #04–#13.
