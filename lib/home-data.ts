// lib/home-data.ts
//
// Static content the homepage composes around. Pillars, testimonials, and the
// journal placeholder cards live here so that copy edits do not require
// touching component code. When real journal posts and real testimonials land,
// these arrays become the only thing that changes.

export type Pillar = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  illustration: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail?: string;
  context?: string;
};

export type JournalCard = {
  slug: string;
  eyebrow: string;
  title: string;
  excerpt: string;
  cover?: string;
  placeholder?: boolean;
};

export const pillars: Pillar[] = [
  {
    slug: "hormonal-health",
    eyebrow: "Focus · 01",
    title: "Hormonal Health",
    description:
      "PCOS, thyroid, cortisol — the slow, evidence-based work of bringing the body back into rhythm.",
    href: "/focus/hormonal-health",
    illustration: "/illustrations/fennel.svg",
  },
  {
    slug: "weight-management",
    eyebrow: "Focus · 02",
    title: "Weight Management",
    description:
      "Sustainable change, not deprivation. Plans built around your week, your kitchen, and your taste.",
    href: "/focus/weight-management",
    illustration: "/illustrations/citrus.svg",
  },
  {
    slug: "diet-planning",
    eyebrow: "Program · 03",
    title: "Diet Planning",
    description:
      "A structured, personal program: assessment, plan, weekly check-ins, and tools you can keep.",
    href: "/programs/diet-planning",
    illustration: "/illustrations/mint.svg",
  },
];

// TODO(content): confirm all three with Dr. Ruhma — these are placeholders
// in her audience's voice. There are no real testimonials in the WP backup;
// the existing "quote" PNGs are decorative IG marketing tiles, not client
// quotes. Pull real ones from IG DMs / WhatsApp / program follow-up forms
// before launch.
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Three months in and my cycle is regular for the first time in eight years. Nothing about the plan felt like a punishment.",
    name: "S. Ahmed",
    detail: "PCOS · Lahore",
  },
  {
    id: "t2",
    quote:
      "I came in wanting to lose weight and left with something more useful — a way of eating that fits my life and my family's table.",
    name: "M. Khan",
    detail: "Weight Management · Lahore",
  },
  {
    id: "t3",
    quote:
      "Dr. Ruhma is the first dietitian who actually listened before prescribing. Calm, clinical, kind.",
    name: "N. Rauf",
    detail: "Consultation · Karachi",
  },
];

export const journalPlaceholders: JournalCard[] = [
  {
    slug: "placeholder-1",
    eyebrow: "Coming soon",
    title: "What we mean when we say 'hormonal'.",
    excerpt:
      "A plain-language unpacking of the words that get used too loosely in wellness — and what is actually going on under them.",
    placeholder: true,
  },
  {
    slug: "placeholder-2",
    eyebrow: "Coming soon",
    title: "A week of unfussy meals.",
    excerpt:
      "Seven days of the kind of cooking that holds up on a Tuesday. Pakistani pantry first, supermarket second.",
    placeholder: true,
  },
];
