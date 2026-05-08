// app/contact/schema.ts
//
// Single source of truth for the contact form schema. Imported by both the
// client form (via @hookform/resolvers/zod) and the server action so the
// validation rules cannot drift between the two surfaces.

import { z } from "zod";
import { CONTACT_TOPICS } from "@/lib/contact-data";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please share your name.")
    .max(80, "That looks too long — keep it under 80 characters."),
  email: z
    .string()
    .trim()
    .email("That email does not look right.")
    .max(160, "Please use a shorter email address."),
  topic: z.enum(CONTACT_TOPICS, {
    message: "Pick a topic so we can route this correctly.",
  }),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(2000, "Please keep it under 2000 characters."),
  newsletter: z.boolean().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: ContactFieldErrors };

export const initialContactState: ContactState = { status: "idle" };
