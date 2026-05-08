# Editing site content

All long-form copy lives as MDX under `content/`:

| Path                       | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `content/about.mdx`        | Bio paragraphs imported by `app/about/page.tsx` |
| `content/programs/*.mdx`   | Diet Planning / Coaching / Consultation pages  |
| `content/focus/*.mdx`      | Hormonal Health / Weight Management long-form  |
| `content/library/*.mdx`    | Three ebook detail pages                       |
| `content/journal/*.mdx`    | Blog posts                                     |
| `content/legal/*.mdx`      | Privacy / terms / refunds                      |
| `content/site.ts`          | Global nav + footer + meta (TS, not MDX)       |

## Frontmatter

Every MDX file begins with YAML frontmatter. The first key is always
`type:` — it tells `pnpm content:check` which schema to validate against.

See `lib/content/types.ts` for the full schema per type. Run
`pnpm content:check` after every edit; it will tell you exactly what is
missing or wrong.

## Adding a journal post

```bash
cp content/journal/welcome.mdx content/journal/your-slug.mdx
```

Then edit the frontmatter — at minimum `slug`, `title`, `description`,
`category`, `publishedAt`, and `readingTime`. Set `status: published`
once it is ready to ship.

## Adding an image

1. Drop the source file somewhere convenient on disk.
2. Add a row to `scripts/media-manifest.ts` pointing at the source and
   choosing a target slug + category.
3. Run `pnpm media:migrate` to encode AVIF + WEBP at five sizes.
4. Reference the largest output in MDX as
   `/media/<category>/<slug>-2400.avif`.

## Editing legal / refund text

Just edit the MDX body. Don't forget to bump `lastUpdated` in the
frontmatter — the legal page footer renders that date.
