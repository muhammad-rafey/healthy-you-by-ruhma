// lib/programs-data.ts
//
// Per-program structured data — FAQs, testimonials, signature-section
// content (sample week / 8-week timeline / booking placeholder, plus the
// consultation page's "What to expect" + "How to prepare" rails).
//
// Long-form prose lives in the MDX body; the page renders it conditionally
// only when present. The structured shapes below are what the program pages
// consume directly.

export type ProgramSlug = "diet-planning" | "coaching" | "consultation";

export type FaqItem = { q: string; a: string };

export const PROGRAMS_FAQ: Record<ProgramSlug, readonly FaqItem[]> = {
  "diet-planning": [
    {
      q: "How is the plan delivered?",
      a: "A full PDF lands in your inbox within five days of the intake call, plus a shared document we revise together as the month progresses. You'll have a per-week grocery list, a recipe pack, and the full calendar of meals to refer to.",
    },
    {
      q: "Do you accommodate vegetarian, halal, or allergy-aware plans?",
      a: "Always. Preferences and restrictions are inputs to the plan, not constraints to design around. Tell me what you eat, what you avoid, and what your kitchen looks like — the plan is built from there.",
    },
    {
      q: "How often does the plan change?",
      a: "Usually every fifteen days. Some clients need updates more often, some less — we tune the cadence to what your body is telling us. There are no extra fees for revisions during the active month.",
    },
    {
      q: "Can I pay in installments?",
      a: "Yes — monthly or fortnightly, with no interest or extra fees. Bank transfer, JazzCash, and Easypaisa work for Pakistan-based clients; Wise for international.",
    },
    {
      q: "What if I don't see results?",
      a: "If you've followed the plan and don't see meaningful change within forty days, you can stop and I'll return half the fee, no questions asked. Most clients feel real differences inside three weeks.",
    },
    {
      q: "What happens after the program ends?",
      a: "You keep the plan, the recipes, and the grocery template. Most clients return for a check-in plan two months later — but the goal is for you to know how to plan your own week without me.",
    },
  ],
  coaching: [
    {
      q: "How is coaching different from diet planning?",
      a: "Diet Planning gives you a roadmap. Coaching gives you a coach in your corner for ninety days — weekly check-ins, plan adjustments as your body responds, and unlimited messaging when life gets in the way. It's the right fit when the gap isn't the plan, it's the follow-through.",
    },
    {
      q: "What conditions do you cover in coaching?",
      a: "Hormonal health (PCOS, thyroid, insulin resistance, cortisol), gut health, weight management, and the mental wellbeing that holds the rest together. If you're working with a doctor on a specific condition, bring those reports — coaching sits alongside medical care, not in place of it.",
    },
    {
      q: "How often do we meet?",
      a: "Weekly twenty-minute calls, plus unlimited WhatsApp access during business hours. Some weeks we'll talk longer; others we'll skip the call if everything is steady. The rhythm bends to what you need.",
    },
    {
      q: "Can I do coaching internationally?",
      a: "Yes — calls run on Zoom or WhatsApp video, plans go over email, payments via Wise. Clients work with me from Pakistan, the Gulf, the UK, and North America.",
    },
    {
      q: "What if I need to pause partway through?",
      a: "Life is uncertain. We'll pause the program, hold your slot for up to four weeks, and pick up where we left off. If you need to stop entirely, refer to the same forty-day guarantee — half the fee returned, no questions.",
    },
    {
      q: "Do I get the ebook library too?",
      a: "Yes — the Diabetes Essentials, PCOS Guidebook, and Skin Secrets are included with the program at no extra cost. They're a useful reference between calls, not a substitute for the work.",
    },
  ],
  consultation: [
    {
      q: "Is the call refundable?",
      a: "If the call doesn't happen because of my schedule, the fee is returned in full. If you cancel within twelve hours of the booked time, the fee is non-refundable but transferable to a friend or family member.",
    },
    {
      q: "Will you diagnose anything on the call?",
      a: "No — diagnosis is a clinician's job. What I can do is read your reports, point out what looks worth investigating, and help you ask better questions of your doctor. Nutrition support sits alongside medical care.",
    },
    {
      q: "Can I bring my lab reports?",
      a: "Please do. Send them when you book and I'll review before the call so we don't spend the thirty-five minutes catching up on paperwork.",
    },
    {
      q: "Do you take international clients?",
      a: "Yes — calls run on Zoom or WhatsApp video, payments through Wise or bank transfer. The fee stays in PKR.",
    },
    {
      q: "What happens after the call?",
      a: "You'll get a short written summary by the next day with the three or four practical actions we agreed, plus the full ebook library to keep reading on your own time. If a longer program is the right next step, we'll talk about that on the call — never as a sales pitch.",
    },
  ],
} as const;

// ──────────────────────────────────────────────────────────────────
// Testimonials — two long-form pull-quotes per program. Paraphrased
// composites of common wellness-coaching outcomes, not real patients.

export type Testimonial = { quote: string; name: string; context: string };

export const PROGRAMS_TESTIMONIALS: Record<ProgramSlug, readonly Testimonial[]> = {
  "diet-planning": [
    {
      quote:
        "I thought I knew how to eat. After four weeks I knew how to eat for me — bloating gone, energy steady through the afternoon, and the plan finally felt like food I'd actually cook on a Tuesday.",
      name: "S. Khan",
      context: "Karachi · four-month follow-up",
    },
    {
      quote:
        "What surprised me wasn't the meals, it was the structure. Knowing what was for dinner before I left for work made the whole week feel quieter. The weight came off as a side effect.",
      name: "H. Mahmood",
      context: "Lahore · PCOS, six months in",
    },
  ],
  coaching: [
    {
      quote:
        "I came in for weight. By week eight my sleep was different, my cycle was regular for the first time in three years, and the weight had taken care of itself. The weekly call was the part I didn't know I needed.",
      name: "A. Siddiqui",
      context: "Islamabad · PCOS, ninety-day program",
    },
    {
      quote:
        "Three other plans had failed me before this. The difference here was that Ruhma actually listened — to my schedule, to what was on my plate, to the bits I wasn't proud of. The plan adapted around real life, not the other way around.",
      name: "F. Akhtar",
      context: "Dubai · weight management, eight months in",
    },
  ],
  consultation: [
    {
      quote:
        "Thirty-five minutes saved me a year of Googling. I left the call with three things to change that week and the calm of knowing what to ignore.",
      name: "Z. Bhatti",
      context: "Lahore · pre-program consultation",
    },
    {
      quote:
        "I expected a sales pitch and got a clinician. Ruhma told me I didn't need a program yet — and what to do instead. That's why I came back six months later.",
      name: "M. Rauf",
      context: "London · returning client",
    },
  ],
} as const;

// ──────────────────────────────────────────────────────────────────
// Diet Planning — sample week. Seven day-cards, each with three meals
// (breakfast / lunch / dinner). Hardcoded representative menu.

export type SampleDay = {
  day: string;
  short: string;
  breakfast: string;
  lunch: string;
  dinner: string;
};

export const SAMPLE_WEEK: readonly SampleDay[] = [
  {
    day: "Monday",
    short: "Mon",
    breakfast: "Soaked oats with chia, almonds, and seasonal fruit",
    lunch: "Lentil dal, brown rice, cucumber raita",
    dinner: "Grilled fish, sautéed greens, small portion of jeera rice",
  },
  {
    day: "Tuesday",
    short: "Tue",
    breakfast: "Two-egg omelette with spinach and feta",
    lunch: "Chicken karahi with roti and a side salad",
    dinner: "Daal chawal with kachumber salad",
  },
  {
    day: "Wednesday",
    short: "Wed",
    breakfast: "Greek yoghurt with walnuts and a drizzle of honey",
    lunch: "Vegetable biryani (controlled portion) with raita",
    dinner: "Seekh kebabs with grilled vegetables and a small naan",
  },
  {
    day: "Thursday",
    short: "Thu",
    breakfast: "Smoothie with banana, oats, milk, and flax",
    lunch: "Palak paneer with roti, kachumber on the side",
    dinner: "Grilled chicken with quinoa and roasted vegetables",
  },
  {
    day: "Friday",
    short: "Fri",
    breakfast: "Egg paratha (whole-wheat) with mint chutney",
    lunch: "Mixed daal with rice and a salad",
    dinner: "Whole-fish curry with steamed greens",
  },
  {
    day: "Saturday",
    short: "Sat",
    breakfast: "A small breakfast — your choice",
    lunch: "A flex meal: a wedding, a friend's plate of biryani, dinner out",
    dinner: "Light and early — soup, salad, water before bed",
  },
  {
    day: "Sunday",
    short: "Sun",
    breakfast: "Overnight oats with chia, berries, and seeds",
    lunch: "Roast chicken with mash, gravy, and seasonal vegetables",
    dinner: "A reset bowl — broth, greens, a hard-boiled egg",
  },
] as const;

// ──────────────────────────────────────────────────────────────────
// Coaching — eight-week timeline. Eight milestones with milestone flags
// at weeks 1, 4, and 8.

export type TimelineWeek = {
  week: number;
  title: string;
  body: string;
  milestone?: boolean;
};

export const COACHING_TIMELINE: readonly TimelineWeek[] = [
  {
    week: 1,
    title: "Intake and orientation",
    body: "Full health assessment, lab review, lifestyle audit, and the first plan delivered by the end of the week.",
    milestone: true,
  },
  {
    week: 2,
    title: "Settling the rhythm",
    body: "First-week feedback. We adjust meal timing and portions where the plan rubbed up against your schedule.",
  },
  {
    week: 3,
    title: "First signs",
    body: "Energy steadier through the afternoon, bloating reducing, sleep starting to deepen. We name what's changing.",
  },
  {
    week: 4,
    title: "Mid-program review",
    body: "A longer call — what's working, what isn't, and the second-half plan informed by four weeks of real data.",
    milestone: true,
  },
  {
    week: 5,
    title: "Building strength",
    body: "Workouts layered in or refined. Hormonal markers (cycle, mood, recovery) factored into the new plan.",
  },
  {
    week: 6,
    title: "Real-life testing",
    body: "Weddings, work trips, family meals — we plan for the weeks that derail other programs and design through them.",
  },
  {
    week: 7,
    title: "Sustainability strategies",
    body: "The handoff begins. You start running the week yourself, with me as a check rather than the source.",
  },
  {
    week: 8,
    title: "Transition plan",
    body: "We close out with a long-term blueprint — a plan you can keep for years, not weeks. The goal: not needing a coach for this again.",
    milestone: true,
  },
] as const;

// ──────────────────────────────────────────────────────────────────
// Consultation — "What to expect" (3 steps) and "How to prepare" cards.

export type ConsultationStep = { n: string; title: string; body: string };

export const CONSULTATION_EXPECT: readonly ConsultationStep[] = [
  {
    n: "01",
    title: "A short intake form",
    body: "After booking, you'll get a brief health and lifestyle questionnaire. Five minutes to fill in. Helps us not spend the call on basics.",
  },
  {
    n: "02",
    title: "Thirty-five minutes on video",
    body: "Zoom or WhatsApp video. We'll cover what you're working on, what's been tried, and a candid read of whether the practice is a fit.",
  },
  {
    n: "03",
    title: "A written summary",
    body: "Within twenty-four hours of the call you'll have a summary of the three or four practical actions we agreed, plus the full ebook library.",
  },
] as const;

export const CONSULTATION_PREPARE: readonly ConsultationStep[] = [
  {
    n: "01",
    title: "Bring your reports",
    body: "Recent lab work, medical notes, prescriptions. Send them when you book and they'll be reviewed before the call.",
  },
  {
    n: "02",
    title: "Note your week",
    body: "A rough log of what you ate and when, two or three days before the call. Honesty serves the work better than a curated version.",
  },
  {
    n: "03",
    title: "Write your one question",
    body: "The one thing you most want a clear answer to. We'll always cover it, even if the conversation goes elsewhere first.",
  },
] as const;

// ──────────────────────────────────────────────────────────────────
// Booking — placeholder copy for the consultation widget. Real Cal.com
// or Calendly link wiring is deferred (master plan §3.6).

export const BOOKING_PLACEHOLDER = {
  status: "placeholder" as const,
  headline: "Booking widget — wired to Calendly when configured.",
  note: "Final integration awaits the practice's Cal.com or Calendly account.",
  fallbackLabel: "Send a message instead",
  fallbackHref: "/contact?topic=consultation",
};
