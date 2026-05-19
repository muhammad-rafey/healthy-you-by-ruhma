import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

export const runtime = "nodejs";

const Body = z.object({
  subject: z.string().min(1).max(200),
  email: z.email().max(254),
  description: z.string().min(1).max(8000),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { subject, description, company } = parsed.data;
  const email = parsed.data.email.trim();
  if (company && company.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail = process.env.RESEND_TO_EMAIL;
  if (!apiKey || !fromEmail || !toEmail) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail.split(",").map((address) => address.trim()),
    replyTo: email,
    subject: `[Contact] ${subject}`,
    text: `From: ${email}\nSubject: ${subject}\n\n${description}`,
  });

  if (error) {
    console.error("[contact] Resend send failed:", error);
    return NextResponse.json(
      {
        error: "Could not send message",
        ...(process.env.NODE_ENV !== "production" ? { detail: error.message } : {}),
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
