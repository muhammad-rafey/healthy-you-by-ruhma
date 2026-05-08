// scripts/media-manifest.ts
//
// Source-image manifest. Hand-curated during Phase 03 pass B.
// Each entry maps an absolute path under the WP backup uploads tree to a
// destination category + slug under public/media/. Run `pnpm media:migrate`
// to (re-)encode AVIF + WEBP at the standard widths (400/800/1200/1600/2400),
// capped to the source's own width.
//
// Add a new image: drop the source on disk, add an entry below, re-run.
// The script is idempotent — encodes only when the source is newer than the
// most recent output.

export type MediaCategory = "home" | "about" | "programs" | "focus" | "library" | "journal";

export interface MediaEntry {
  /** Absolute path under the WP backup. */
  src: string;
  /** Top-level folder under public/media/. */
  category: MediaCategory;
  /** Filename slug — no extension, kebab-case. */
  slug: string;
  /** Short alt-text default; pages may override per-usage. */
  alt: string;
  /** Skip the largest size if the source is small. */
  maxSize?: 400 | 800 | 1200 | 1600 | 2400;
}

const UPLOADS = "/home/duh/Documents/website backup (1)/uploads";

export const MANIFEST: MediaEntry[] = [
  // ── HOME ────────────────────────────────────────────────────────────
  // Practitioner portrait (1080×1080) — primary hero on the homepage.
  {
    src: `${UPLOADS}/2024/02/coach-1.png`,
    category: "home",
    slug: "hero-portrait",
    alt: "Dr. Ruhma, clinical dietitian, in studio portrait.",
  },
  // About teaser (1001×616) — half-bleed below the hero.
  {
    src: `${UPLOADS}/2024/02/HomePage-AboutUs-1.jpg`,
    category: "home",
    slug: "about-teaser",
    alt: "Dr. Ruhma at her practice in Lahore.",
  },
  // Three pillar tiles (327×293) — small editorial cards.
  {
    src: `${UPLOADS}/2024/02/HomePage-Offers_1-1.jpg`,
    category: "home",
    slug: "pillar-hormonal",
    alt: "Considered ingredients for hormonal-supportive cooking.",
  },
  {
    src: `${UPLOADS}/2024/02/HomePage-Offers_2-1.jpg`,
    category: "home",
    slug: "pillar-weight",
    alt: "Whole grains and seasonal produce on a wooden surface.",
  },
  {
    src: `${UPLOADS}/2024/02/HomePage-Offers_3-1.jpg`,
    category: "home",
    slug: "pillar-diet",
    alt: "Plated meal showing the macronutrient balance Ruhma recommends.",
  },
  // Lifestyle gallery (482×497).
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_1-1.jpg`,
    category: "home",
    slug: "lifestyle-1",
    alt: "Cooking notes and a glass of water on a kitchen counter.",
  },
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_2-1.jpg`,
    category: "home",
    slug: "lifestyle-2",
    alt: "A plated breakfast in soft morning light.",
  },
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_3-1.jpg`,
    category: "home",
    slug: "lifestyle-3",
    alt: "Fresh herbs and lemons on a stone surface.",
  },
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_4-1.jpg`,
    category: "home",
    slug: "lifestyle-4",
    alt: "A vegetable bowl with grains and roasted vegetables.",
  },

  // ── ABOUT ──────────────────────────────────────────────────────────
  // About hero (750×860).
  {
    src: `${UPLOADS}/2024/02/AboutPage-Hero-1.jpg`,
    category: "about",
    slug: "hero",
    alt: "Dr. Ruhma in her clinic, consulting at her desk.",
  },
  // Secondary about photo (1001×616).
  {
    src: `${UPLOADS}/2024/02/AboutPage-AboutSection-1.jpg`,
    category: "about",
    slug: "secondary",
    alt: "Dr. Ruhma reviewing a patient's notes.",
  },
  // Secondary portrait (1080×1080).
  {
    src: `${UPLOADS}/2024/02/call1-1.png`,
    category: "about",
    slug: "portrait-secondary",
    alt: "Dr. Ruhma on a consultation call.",
  },

  // ── PROGRAMS ────────────────────────────────────────────────────────
  // Diet planning hero (750×860 — same person as About hero, contextually fine).
  {
    src: `${UPLOADS}/2024/02/HomePage-Hero-1.jpg`,
    category: "programs",
    slug: "diet-planning-hero",
    alt: "Sample weekly meal plan laid out on a wooden table.",
  },
  // Coaching hero — uses the (1001×616) About-Section photo for variety.
  {
    src: `${UPLOADS}/2024/02/AboutPage-AboutSection-1.jpg`,
    category: "programs",
    slug: "coaching-hero",
    alt: "Dr. Ruhma walking with a client during a coaching session.",
  },
  // Consultation hero (1080×1080) — uses the call1-1 portrait.
  {
    src: `${UPLOADS}/2024/02/call1-1.png`,
    category: "programs",
    slug: "consultation-hero",
    alt: "Dr. Ruhma on a video consultation call.",
  },
  // Diet-planning sample shot (482×497).
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_3-1.jpg`,
    category: "programs",
    slug: "diet-planning-sample",
    alt: "A balanced plate showing macronutrient distribution.",
  },
  // Coaching sample shot (482×497).
  {
    src: `${UPLOADS}/2024/02/HomePage-WorkGallery-img_4-1.jpg`,
    category: "programs",
    slug: "coaching-sample",
    alt: "A printed coaching workbook open on a desk.",
  },

  // ── FOCUS ───────────────────────────────────────────────────────────
  // Hormonal-health hero (1280×853 — sample-3 from skin ebook reused as
  // editorial photography, not as a sample spread).
  {
    src: `${UPLOADS}/2024/06/smartmockups_lwwdw1dv.jpg`,
    category: "focus",
    slug: "hormonal-health-hero",
    alt: "Herbs and citrus arranged for a hormone-supportive meal.",
  },
  // Weight management hero (1280×853).
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5um2m9.jpg`,
    category: "focus",
    slug: "weight-management-hero",
    alt: "A measured plate of whole grains, vegetables and lean protein.",
  },

  // ── LIBRARY ─────────────────────────────────────────────────────────
  // Diabetes Essentials cover (1080×1080).
  {
    src: `${UPLOADS}/2024/06/Copy-of-ebook1.png`,
    category: "library",
    slug: "diabetes-cover",
    alt: "Diabetes Essentials ebook cover.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lwwcywtw.jpg`,
    category: "library",
    slug: "diabetes-sample-1",
    alt: "Sample spread from the Diabetes Essentials ebook.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lwwdu2n0.jpg`,
    category: "library",
    slug: "diabetes-sample-2",
    alt: "Sample spread showing diabetes-friendly meal ideas.",
  },
  {
    src: `${UPLOADS}/2024/05/Diabetes-Essentials-Ebook.png`,
    category: "library",
    slug: "diabetes-sample-3",
    alt: "Sample spread covering diabetes lifestyle modifications.",
  },

  // PCOS Guidebook cover (1920×2742).
  {
    src: `${UPLOADS}/2024/06/smartmockups_lwwe107j.jpg`,
    category: "library",
    slug: "pcos-cover",
    alt: "PCOS Guidebook cover.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5udh5u.jpg`,
    category: "library",
    slug: "pcos-sample-1",
    alt: "Sample spread from the PCOS Guidebook.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5uiucm.jpg`,
    category: "library",
    slug: "pcos-sample-2",
    alt: "PCOS Guidebook sample showing meal-planning principles.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5um2m9.jpg`,
    category: "library",
    slug: "pcos-sample-3",
    alt: "PCOS Guidebook sample on lifestyle and supplements.",
  },

  // Skin Secrets cover (1280×853).
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5u5k3d.jpg`,
    category: "library",
    slug: "skin-cover",
    alt: "Skin Secrets ebook cover.",
  },
  {
    src: `${UPLOADS}/2024/06/smartmockups_lx5upwey.jpg`,
    category: "library",
    slug: "skin-sample-1",
    alt: "Sample spread from the Skin Secrets ebook.",
  },
  {
    src: `${UPLOADS}/2024/06/Skin-EBook-Cover.png`,
    category: "library",
    slug: "skin-sample-2",
    alt: "Skin Secrets sample showing the food-skin connection.",
  },
  {
    src: `${UPLOADS}/2024/05/ebook1.png`,
    category: "library",
    slug: "skin-sample-3",
    alt: "Skin Secrets sample on hormonal acne strategies.",
  },

  // ── JOURNAL ─────────────────────────────────────────────────────────
  // Welcome-post hero (905×1280).
  {
    src: `${UPLOADS}/2024/12/WhatsApp-Image-2024-12-28-at-6.43.58-PM.jpeg`,
    category: "journal",
    slug: "welcome-hero",
    alt: "An open notebook beside a glass of water and seasonal fruit.",
  },
];
