import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { NewPostForm } from "@/components/admin/new-post-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "New blog post",
  robots: { index: false, follow: false },
};

export const runtime = "nodejs";

export default async function NewPostPage() {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return (
    <Container width="narrow" as="main" className="py-20">
      <div className="flex flex-col gap-2">
        <Eyebrow>
          <Link href="/admin" className="hover:text-mauve-deep">
            ← Back to dashboard
          </Link>
        </Eyebrow>
        <Heading variant="h1">New blog post</Heading>
      </div>
      <div className="mt-10">
        <NewPostForm />
      </div>
    </Container>
  );
}
