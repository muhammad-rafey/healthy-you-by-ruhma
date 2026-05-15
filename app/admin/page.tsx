import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { LogoutButton } from "@/components/admin/logout-button";
import { isAdmin } from "@/lib/admin-auth";
import { formatPostDate, getAllPosts, getCoverImage } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const posts = await getAllPosts();

  return (
    <Container as="main" className="py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>Admin</Eyebrow>
          <Heading variant="h1">Blog posts</Heading>
          <p className="text-ink/70">
            {posts.length} post{posts.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/admin/blog/new">New post</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <div className="border-ink/10 mt-12 overflow-hidden rounded-2xl border">
        {posts.length === 0 ? (
          <div className="bg-cream/50 p-10 text-center">
            <p className="text-ink/70">
              No posts yet. Click <strong>New post</strong> to publish your first one.
            </p>
          </div>
        ) : (
          <ul className="divide-ink/10 divide-y">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="bg-cream/30 flex flex-wrap items-center justify-between gap-4 px-6 py-5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getCoverImage(post)}
                  alt=""
                  className="border-ink/10 h-12 w-12 shrink-0 rounded-lg border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/journal/${post.slug}`}
                    className="text-ink hover:text-mauve-deep block truncate font-medium"
                  >
                    {post.title}
                  </Link>
                  <p className="text-ink/60 mt-1 text-sm">{formatPostDate(post.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/journal/${post.slug}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/blog/${post.slug}/edit`}>Edit</Link>
                  </Button>
                  <DeleteButton slug={post.slug} title={post.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
