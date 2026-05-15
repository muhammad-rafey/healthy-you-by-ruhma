import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { EditPostForm } from "@/components/admin/edit-post-form";
import { isAdmin } from "@/lib/admin-auth";
import { getPostBySlug } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Edit blog post",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <Container width="narrow" as="main" className="py-20">
      <div className="flex flex-col gap-2">
        <Eyebrow>
          <Link href="/admin" className="hover:text-mauve-deep">
            ← Back to dashboard
          </Link>
        </Eyebrow>
        <Heading variant="h1">Edit post</Heading>
        <p className="text-ink/60 text-sm">{post.title}</p>
      </div>
      <div className="mt-10">
        <EditPostForm
          slug={post.slug}
          initialTitle={post.title}
          initialDescription={post.description}
          initialCategory={post.category}
          initialCoverImage={post.coverImage ?? ""}
        />
      </div>
    </Container>
  );
}
