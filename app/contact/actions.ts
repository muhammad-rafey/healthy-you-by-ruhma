"use server";

// app/contact/actions.ts
//
// Server action that backs the /contact form. The plan calls for Resend
// transactional email, but Phase 11 ships a STUB: input is validated with
// Zod, the payload is logged for local inspection, and the action sleeps
// briefly so the client can render its pending state honestly.
//
// TODO(infra): wire Resend before launch. The Resend snippet (kept ready to
// drop in below) will need RESEND_API_KEY and CONTACT_TO_EMAIL in env, plus
// a verified sender domain in the Resend dashboard. Replace the `// STUB:`
// block with the commented `// LIVE:` block once those are in place.

import { contactSchema, type ContactFieldErrors, type ContactState } from "./schema";

const STUB_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
    newsletter: formData.get("newsletter") === "on" || formData.get("newsletter") === "true",
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ContactFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof ContactFieldErrors] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const data = parsed.data;

  // STUB: log + simulated network. Replace with the LIVE block below.
  await delay(STUB_DELAY_MS);
  // eslint-disable-next-line no-console -- intentional dev log; replaced when wiring Resend (TODO above).
  console.log("[contact]", {
    name: data.name,
    email: data.email,
    topic: data.topic,
    message: data.message,
    newsletter: data.newsletter,
    receivedAt: new Date().toISOString(),
  });

  /*
  // TODO(infra): LIVE — drop in once `resend` is installed and the sender
  // domain is verified in the Resend dashboard.
  //
  // import { Resend } from "resend";
  //
  // const apiKey = process.env.RESEND_API_KEY;
  // const to = process.env.CONTACT_TO_EMAIL ?? "info@dietitianruhma.com";
  // if (!apiKey) {
  //   console.error("[contact] RESEND_API_KEY missing");
  //   return {
  //     status: "error",
  //     message:
  //       "The form is temporarily unavailable. Please email us directly at info@dietitianruhma.com.",
  //   };
  // }
  // const resend = new Resend(apiKey);
  // const { error } = await resend.emails.send({
  //   from: "Healthy You Contact <contact@mail.dietitianruhma.com>",
  //   to: [to],
  //   replyTo: data.email,
  //   subject: `[${data.topic}] ${data.name} via dietitianruhma.com`,
  //   text: [
  //     `From: ${data.name} <${data.email}>`,
  //     `Topic: ${data.topic}`,
  //     `Newsletter opt-in: ${data.newsletter ? "yes" : "no"}`,
  //     "",
  //     data.message,
  //   ].join("\n"),
  // });
  // if (error) {
  //   console.error("[contact] resend error:", error);
  //   return {
  //     status: "error",
  //     message:
  //       "Something went wrong sending your message. Please try again or email info@dietitianruhma.com.",
  //   };
  // }
  */

  return { status: "success" };
}
