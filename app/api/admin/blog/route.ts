import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin-auth";
import { CreateBlogPostInput, createPost, getAllPosts } from "@/lib/blog-data";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const posts = await getAllPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = CreateBlogPostInput.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const post = await createPost(parsed.data);
  return NextResponse.json({ slug: post.slug }, { status: 201 });
}
