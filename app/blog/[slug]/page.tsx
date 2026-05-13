import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { site } from "@/content/site";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { Prose } from "@/components/ui/prose";
import { formatPostDate, getAllPosts, getCoverImage, getPostBySlug } from "@/lib/blog-data";

export const runtime = "nodejs";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  const description = post.description.slice(0, 200);
  const image = getCoverImage(post);

  return {
    title: `${post.title} · ${site.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      publishedTime: new Date(post.createdAt).toISOString(),
      modifiedTime: new Date(post.updatedAt).toISOString(),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPosts()]);
  if (!post) notFound();
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug);

  return (
    <Container as="main" className="py-20">
      <div className="flex flex-col gap-3">
        <Eyebrow>
          <Link href="/blog" className="hover:text-mauve-deep">
            ← Back to blog
          </Link>
        </Eyebrow>
        <Heading variant="display">{post.title}</Heading>
        <p className="text-ink/60 text-sm">Published {formatPostDate(post.createdAt)}</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={getCoverImage(post)}
        alt=""
        className="border-ink/10 mt-10 aspect-video w-full rounded-2xl border object-cover"
      />

      <Prose as="article" className="mt-12 max-w-none">
        <p className="whitespace-pre-line">{post.description}</p>
      </Prose>

      {otherPosts.length > 0 && (
        <section className="border-ink/10 mt-20 border-t pt-12">
          <div className="flex items-end justify-between gap-4">
            <Heading variant="h2">More on the blog</Heading>
            <Link href="/blog" className="text-mauve-deep text-sm font-medium hover:underline">
              See all →
            </Link>
          </div>
          <ul className="-mx-6 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4">
            {otherPosts.map((other) => (
              <li
                key={other.slug}
                className="border-ink/10 hover:border-mauve/40 group bg-cream/40 w-72 shrink-0 snap-start overflow-hidden rounded-2xl border transition-colors"
              >
                <Link href={`/blog/${other.slug}`} className="flex h-full flex-col">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCoverImage(other)}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="type-eyebrow text-ink/60">{formatPostDate(other.createdAt)}</p>
                    <h3 className="text-ink group-hover:text-mauve-deep line-clamp-2 font-medium transition-colors">
                      {other.title}
                    </h3>
                    <p className="text-ink/70 line-clamp-2 text-sm">{other.description}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
