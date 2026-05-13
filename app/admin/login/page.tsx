import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { LoginForm } from "@/components/admin/login-form";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }

  return (
    <Container width="narrow" as="main" className="py-24">
      <div className="flex flex-col gap-3">
        <Eyebrow>Admin</Eyebrow>
        <Heading variant="h1">Sign in</Heading>
        <p className="text-ink/70">Enter the admin password to manage blog posts.</p>
      </div>
      <div className="mt-10">
        <LoginForm />
      </div>
    </Container>
  );
}
