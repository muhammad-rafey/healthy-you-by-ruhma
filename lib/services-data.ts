// lib/services-data.ts
//
// Static data for the /services page. Pricing source-of-truth lives with the
// program MDX files (frontmatter `priceFrom` + `currency`); this module only
// owns FAQ copy and cross-page constants. Keep answers in second person, plain
// language, and no medical claims.

export type ServicesFaqItem = { q: string; a: string };

/** Six FAQs hits the 5–7 sweet spot from the master plan. Tuned to brand
 *  voice: warm, plain, specific. PKR throughout — practice is Lahore-based. */
export const SERVICES_FAQ: readonly ServicesFaqItem[] = [
  {
    q: "Which program is right for me?",
    a: "If you mostly need a clear plan to follow, the Diet Planning Program is built for you — a personalised roadmap delivered after one consultation. If you've tried plans before and the gap is the follow-through, the Coaching Program is the right fit: ninety days of weekly check-ins, plan adjustments, and accountability. If you're not sure where to start, the Consultation Call is the right first step.",
  },
  {
    q: "Do I need a referral?",
    a: "No referral is needed. You can book any program directly. If you're working with a doctor on a specific condition — thyroid, fertility, insulin resistance — bring those reports to the consultation and we'll factor them into the plan. Nutrition support sits alongside medical care, it doesn't replace it.",
  },
  {
    q: "How quickly can I start?",
    a: "Consultation calls are usually available within the same week. Diet Planning slots open every two weeks; Coaching cohorts begin monthly. After you book, you'll get a short health and lifestyle form to fill in before the first session so we don't spend it on basics.",
  },
  {
    q: "Do you work with international clients?",
    a: "Yes. Everything runs online — Zoom or WhatsApp video for sessions, email or WhatsApp for plans and check-ins. Clients work with me from across Pakistan, the Gulf, the UK, and North America. Pricing stays in PKR; international payments go through Wise or bank transfer.",
  },
  {
    q: "What payment options do you accept? (PKR)",
    a: "Bank transfer or Wise for international clients. For Pakistan-based clients, JazzCash and Easypaisa also work. The Diet Planning and Coaching programs can be paid in monthly or fortnightly installments at no extra charge — just ask when you book.",
  },
  {
    q: "Can I switch programs partway through?",
    a: "Yes. If you start with Diet Planning and decide a few weeks in that you need the deeper support of Coaching, the fee you've paid is credited toward the upgrade. The reverse is rarer but works the same way — life shifts, and the program should shift with it.",
  },
  {
    q: "What if I'm dealing with PCOS or hormonal issues?",
    a: "These are core areas of the practice. Hormonal cases — PCOS, thyroid, insulin resistance, cortisol — usually need adjustment over time rather than a one-off plan, so the Coaching Program is the right fit for active cases. The PCOS Guidebook in the library covers the foundations and is a good starting point if you'd like to read first.",
  },
];
