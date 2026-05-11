// lib/contact-data.ts
//
// Static content for the /contact page. The form was retired in favour of a
// direct WhatsApp CTA, so the Topic enum is gone — only FAQ copy lives here.

export type ContactFaqItem = { q: string; a: string };

export const CONTACT_FAQ: readonly ContactFaqItem[] = [
  {
    q: "How quickly do you respond?",
    a: "Within one business day, Monday through Friday — direct WhatsApp messages get the fastest response. For anything urgent or clinical, please book a consultation call directly.",
  },
  {
    q: "Do I need to book a consultation before joining the Coaching Program?",
    a: "Not always. If you already know coaching is the fit, you can message me directly to start. If you're unsure or managing a specific condition, the Consultation Call is the right first step — it's designed to recommend a path, not to sell one.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. Everything runs online over Zoom or WhatsApp video, with plans and check-ins by email or WhatsApp. Clients are based across Pakistan, the Gulf, the UK, and North America. Pricing stays in PKR; international payments go through Wise or bank transfer.",
  },
];
