// lib/contact-data.ts
//
// Static content for the /contact page. Topic options are also exported here
// so the Zod schema (server) and the form select (client) read the same source.

export const CONTACT_TOPICS = [
  "Diet Planning",
  "Coaching",
  "Consultation",
  "PCOS / Hormonal",
  "Weight Management",
  "General",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export type ContactFaqItem = { q: string; a: string };

export const CONTACT_FAQ: readonly ContactFaqItem[] = [
  {
    q: "How quickly do you respond?",
    a: "Within one business day, Monday through Friday. If your note arrives over the weekend, expect a reply on Monday. For anything urgent or clinical, please book a consultation directly — the inbox is not monitored after hours.",
  },
  {
    q: "Do I need to book a consultation before joining a program?",
    a: "Not always. If you already know which program fits, you can book it directly. If you're unsure between Diet Planning and Coaching, or you're managing a specific condition, the Consultation Call is the right first step — it's designed to recommend a path, not to sell one.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. Everything runs online over Zoom or WhatsApp video, with plans and check-ins by email or WhatsApp. Clients are based across Pakistan, the Gulf, the UK, and North America. Pricing stays in PKR; international payments go through Wise or bank transfer.",
  },
];
