import type { Metadata } from "next";
import Link from "next/link";

import { site } from "@/content/site";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { formatPostDate, getAllPosts, getCoverImage } from "@/lib/blog-data";

export const runtime = "nodejs";
export const revalidate = 0;

const PAGE_DESCRIPTION = "Short notes from Dr. Ruhma — published as they're written.";

export const metadata: Metadata = {
  title: `Blog · ${site.name}`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog · ${site.name}`,
    description: PAGE_DESCRIPTION,
    url: "/blog",
    type: "website",
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <Container as="main" className="py-20">
      <div className="flex flex-col gap-3">
        <Eyebrow>Blog</Eyebrow>
        <Heading variant="display">Notes from the practice</Heading>
        <p className="text-ink/70 max-w-[640px]">{PAGE_DESCRIPTION}</p>
      </div>

      {posts.length === 0 ? (
        <div className="border-ink/10 bg-cream/50 mt-16 rounded-2xl border p-16 text-center">
          <p className="text-ink/70">No posts yet — check back soon.</p>
        </div>
      ) : (
        <ul className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const isLong = post.description.length > 50;
            return (
              <li
                key={post.slug}
                className="border-ink/10 hover:border-mauve/40 group bg-cream/40 overflow-hidden rounded-2xl border transition-colors"
              >
                <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCoverImage(post)}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <p className="type-eyebrow text-ink/60">{formatPostDate(post.createdAt)}</p>
                    <h2 className="type-h2 text-ink group-hover:text-mauve-deep transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-ink/70 line-clamp-3">{post.description}</p>
                    {isLong && (
                      <span className="text-mauve-deep mt-1 text-sm font-medium group-hover:underline">
                        Read more →
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
