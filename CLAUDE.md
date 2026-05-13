# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

The warning above is load-bearing — APIs in this Next.js release differ from training-data conventions. Consult `node_modules/next/dist/docs/` before touching framework features (params, cookies, redirect, route handlers, image, metadata).

## Commands that matter

| Command              | When                                                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`           | Dev server with Turbopack on `:3000`. `.env.local` is read once at startup — restart after editing it.                                                                                                                                                 |
| `pnpm typecheck`     | Must exit 0 before claiming a task done.                                                                                                                                                                                                               |
| `pnpm lint`          | `eslint --max-warnings=0` — a single warning fails the run. Common gotchas: Tailwind suggests canonical classes (`aspect-[16/9]` → `aspect-video`, `min-h-[280px]` → `min-h-70`); `@typescript-eslint/no-unused-vars` ignores names prefixed with `_`. |
| `pnpm ci`            | Runs typecheck + lint + format:check + build sequentially.                                                                                                                                                                                             |
| `pnpm content:check` | Validates every `content/**/*.mdx` against its Zod frontmatter schema. Run after editing MDX.                                                                                                                                                          |

There is no test suite — there are no tests configured. Don't propose running them.

## Two parallel "blogs" — don't confuse them

- **`/journal`** — static, MDX-backed, author-only. Posts are `.mdx` files in `content/journal/` parsed by [lib/content/load.ts](lib/content/load.ts) using schemas in [lib/content/types.ts](lib/content/types.ts). To add a journal post, drop a file in `content/journal/` and that's it.
- **`/blog`** — dynamic, MongoDB-backed, admin UI at `/admin`. Wired up in [lib/mongodb.ts](lib/mongodb.ts), [lib/blog-data.ts](lib/blog-data.ts), [lib/admin-auth.ts](lib/admin-auth.ts), [app/blog/](app/blog/), [app/admin/](app/admin/), [app/api/admin/](app/api/admin/). Auth = single `ADMIN_PASSWORD` env var → cookie `admin_session`.

When the user says "blog", **ask** which one — they often mean the MDX journal.

## Content pipeline (the MDX side)

The static content layer is a small, opinionated thing worth understanding before editing it:

- [content/site.ts](content/site.ts) — **single source of truth** for nav, footer, site name, contact info. Any nav/footer change goes here, not in `components/layout/nav.tsx`.
- [content/<section>/\*.mdx](content/) — each MDX file has frontmatter validated against a schema in [lib/content/types.ts](lib/content/types.ts). Schemas key off the `type:` field (`"program" | "focus" | "journal" | "library" | "legal" | "about"`).
- [lib/content/load.ts](lib/content/load.ts) — `loadAndParse` reads + validates an MDX file. Wrapped in `react.cache` so per-request reads are deduped.
- [lib/<section>-data.ts](lib/) — per-section helpers built on top of `loadAndParse` (e.g. `loadAllJournal`, `loadRelatedJournal`). Pages call these; pages never read filesystem directly.
- Drafts are visible in dev, hidden in prod via `NODE_ENV` checks inside the loaders.

## Mongo-backed blog architecture

- [lib/mongodb.ts](lib/mongodb.ts) caches the `MongoClient` promise on `globalThis` in dev (so HMR doesn't leak pools) and module-scope in prod. **Reuse `getDb()`** — never instantiate a new client.
- [lib/blog-data.ts](lib/blog-data.ts) holds the Zod schema (`BlogPostSchema`), CRUD helpers, `slugify`, `formatPostDate`, `getCoverImage`, `DEFAULT_COVER_IMAGE`. Naming follows the existing `<section>-data.ts` convention.
- All Mongo-touching pages and route handlers **must** set `export const runtime = "nodejs"` — the `mongodb` driver doesn't run on Edge.
- All Mongo-backed pages set `export const revalidate = 0` so new/deleted posts show up immediately.
- Every admin route handler starts with `if (!(await isAdmin())) return 401`.
- The current cover-image story: post documents store a **URL string**, not a file. Plain `<img src={getCoverImage(post)} />` (not `next/image` — would require whitelisting every remote host).

## Next 16 quirks to keep in mind

- `params`, `searchParams`, and `cookies()` are **Promises** — `await` them. Type page props as `params: Promise<{...}>`.
- `redirect()` and `notFound()` in streaming RSC don't return 3xx/404 over the wire. The server emits a `<meta http-equiv="refresh">` for redirects and a not-found body with HTTP 200. This is fine for UX; don't be confused when `curl` shows 200.
- Route Handler files (`app/**/route.ts`) export one function per HTTP verb. Unexported verbs → automatic 405. Use this to constrain admin actions to POST/DELETE only.

## Tailwind v4 + design tokens

- Brand tokens are CSS variables: `mauve`, `mauve-deep`, `ink`, `cream`, `moss`. Use `text-ink`, `bg-mauve`, `border-ink/20`, etc.
- Type utilities: `type-display-xl`, `type-display`, `type-h1`, `type-h2`, `type-eyebrow`. Pair with [components/ui/heading.tsx](components/ui/heading.tsx) and [components/ui/eyebrow.tsx](components/ui/eyebrow.tsx) rather than hard-coding sizes.
- Reuse [components/ui/](components/ui/) primitives (`Container`, `Heading`, `Eyebrow`, `Button`, `Prose`) — they encode the editorial spacing/scale decisions made in plans 02–08.

## Zod 4

`z.string().url()` is deprecated — use `z.url()`. Same pattern for `z.email()`, `z.uuid()`, etc. The MDX schema file [lib/content/types.ts](lib/content/types.ts) is Zod 4 and is the reference for shape conventions.

## Where to look for project history

`PHASE_00_REPORT.md` … `PHASE_14_REPORT.md` (with paired `_REVIEW.md`) document each implementation phase. Don't read them unless investigating _why_ a specific decision was made — the code is the source of truth for _what_ exists.
