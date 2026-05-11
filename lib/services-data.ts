// lib/services-data.ts
//
// Static data for the /services page. This module only owns FAQ copy and
// cross-page constants. Keep answers in second person, plain language, and
// no medical claims.

export type ServicesFaqItem = { q: string; a: string };

/** Six FAQs hits the 5–7 sweet spot from the master plan. Tuned to brand
 *  voice: warm, plain, specific. PKR throughout — practice is Faisalabad-based. */
export const SERVICES_FAQ: readonly ServicesFaqItem[] = [
  {
    q: "Which program is right for me?",
    a: "If you've tried plans before and the gap is the follow-through, the Coaching Program is the right fit — ninety days of weekly check-ins, plan adjustments, and accountability. If you're not sure where to start, the Consultation Call is the right first step.",
  },
  {
    q: "Do I need a referral?",
    a: "No referral is needed. You can book any program directly. If you're working with a doctor on a specific condition — thyroid, fertility, insulin resistance — bring those reports to the consultation and we'll factor them into the plan. Nutrition support sits alongside medical care, it doesn't replace it.",
  },
  {
    q: "How quickly can I start?",
    a: "Consultation calls are usually available within the same week. Coaching cohorts begin monthly. After you book, you'll get a short health and lifestyle form to fill in before the first session so we don't spend it on basics.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. Everything runs online — Zoom or WhatsApp video for sessions, email or WhatsApp for plans and check-ins. Clients work with me from across Pakistan, the Gulf, the UK, and North America. Pricing stays in PKR; international payments go through Wise or bank transfer.",
  },
  {
    q: "What payment options do you accept? (PKR)",
    a: "Bank transfer or Wise for international clients. For Pakistan-based clients, JazzCash and Easypaisa also work. Pricing for the Coaching Program is shared on the discovery call — every partnership is shaped to your situation.",
  },
  {
    q: "What if I'm dealing with PCOS or hormonal issues?",
    a: "These are core areas of the practice. Hormonal cases — PCOS, thyroid, insulin resistance, cortisol — usually need adjustment over time rather than a one-off plan, so the Coaching Program is the right fit for active cases. The PCOS Guidebook in the library covers the foundations and is a good starting point if you'd like to read first.",
  },
];
