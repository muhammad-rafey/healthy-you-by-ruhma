import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { UpdateBlogPostInput, deletePostBySlug, updatePostBySlug } from "@/lib/blog-data";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ slug: string }>;
}

export async function DELETE(_request: Request, ctx: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await ctx.params;
  const ok = await deletePostBySlug(slug);
  if (!ok) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, ctx: Context) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const json = await request.json().catch(() => null);
  const parsed = UpdateBlogPostInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const updated = await updatePostBySlug(slug, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ slug: updated.slug });
}
