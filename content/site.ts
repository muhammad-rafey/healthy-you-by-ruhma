// content/site.ts
// Single source of truth for site metadata, navigation, and footer structure.
// Every Nav/Footer/SEO consumer imports from here.

export type NavItem = {
  label: string;
  href: string;
  /** When true, the link is rendered as the CTA pill rather than a text link. */
  cta?: boolean;
};

export type FooterColumn = {
  heading: string;
  items: { label: string; href: string; external?: boolean }[];
};

export const site = {
  name: "Healthy You By Ruhma",
  shortName: "Healthy You",
  practitioner: "Dr. Ruhma",
  tagline: "Nourishing You Inside Out For Healthy You Throughout",
  description:
    "Editorial nutrition practice with Dr. Ruhma — clinical dietitian based in Faisalabad. Programs, focus areas, and guidebooks for hormonal health, weight management, and considered eating.",
  locale: "en",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_ENV === "production"
      ? "https://dietitianruhma.com"
      : "http://localhost:3000"),
  contact: {
    // Placeholders sourced from the legacy WordPress install. Replace at content
    // cutover if anything changes.
    email: "info@dietitianruhma.com",
    whatsapp: "+923176296025", // E.164
    whatsappDisplay: "+92 317 6296025",
    instagram: "ruhma_nazeer",
    instagramUrl: "https://instagram.com/ruhma_nazeer",
  },
  nav: [
    { label: "Programs", href: "/services" },
    { label: "Focus", href: "/focus/hormonal-health" },
    { label: "Stories", href: "/transformations" },
    { label: "Library", href: "/library" },
    { label: "Journal", href: "/journal" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact", cta: true },
  ] satisfies NavItem[],
  footerColumns: [
    {
      heading: "Practice",
      items: [
        { label: "About Dr. Ruhma", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Success Stories", href: "/transformations" },
        { label: "Contact", href: "/contact" },
        { label: "Journal", href: "/journal" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      heading: "Programs",
      items: [
        { label: "Coaching", href: "/programs/coaching" },
        { label: "Consultation Call", href: "/programs/consultation" },
      ],
    },
    {
      heading: "Resources",
      items: [
        { label: "The Library", href: "/library" },
        { label: "Hormonal Health", href: "/focus/hormonal-health" },
        { label: "Weight Management", href: "/focus/weight-management" },
      ],
    },
    {
      heading: "Legal",
      items: [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Refunds", href: "/legal/refunds" },
      ],
    },
  ] satisfies FooterColumn[],
} as const;

export type Site = typeof site;
