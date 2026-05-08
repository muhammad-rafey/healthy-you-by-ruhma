// lib/focus-data.ts
//
// Static structured data for the two focus areas — the "Where this shows up"
// conditions list and the "Related" link cards. Long-form prose lives in the
// MDX body; the structured shapes below are what the route consumes.
//
// Per master §3.7 (Hormonal Health) and §3.8 (Weight Management).

import type { LibraryFrontmatter, ProgramFrontmatter } from "@/lib/mdx";
import { loadLibrary, loadProgram } from "@/lib/mdx";

export type FocusSlug = "hormonal-health" | "weight-management";

export const FOCUS_SLUGS: readonly FocusSlug[] = ["hormonal-health", "weight-management"] as const;

export type Condition = {
  title: string;
  summary: string;
};

/**
 * Three conditions per focus area. Hormonal Health follows master §3.7
 * (PCOS / thyroid / cortisol). Weight Management uses an analogous trio of
 * physiological levers — metabolic flexibility, insulin sensitivity, satiety.
 */
export const FOCUS_CONDITIONS: Record<FocusSlug, readonly Condition[]> = {
  "hormonal-health": [
    {
      title: "PCOS",
      summary:
        "Insulin resistance and androgen excess. The diet patterns that lower fasting insulin do most of the heavy lifting.",
    },
    {
      title: "Thyroid",
      summary:
        "Under- and over-active patterns shift metabolic rate, body temperature, and the patience the rest of you has for the day.",
    },
    {
      title: "Cortisol & stress",
      summary:
        "Sleep, blood-sugar variability, and chronic restriction quietly write the cortisol curve. So does breakfast.",
    },
  ],
  "weight-management": [
    {
      title: "Metabolic flexibility",
      summary:
        "How readily the body switches between burning carbs and fat. Steady meals, strength work, and sleep widen the range.",
    },
    {
      title: "Insulin sensitivity",
      summary:
        "The lever underneath stalled loss for most women in my practice. Protein at breakfast and fewer naked carbs move it first.",
    },
    {
      title: "Satiety & cravings",
      summary:
        "Leptin and ghrelin run this. Underslept, under-protein, or in chronic deficit, both go in the wrong direction within a fortnight.",
    },
  ],
};

export type RelatedKind = "program" | "library";

export type RelatedRef = {
  kind: RelatedKind;
  slug: string;
};

/**
 * Two related cards per focus area. Hormonal Health → PCOS Guidebook +
 * Coaching Program (master §3.7). Weight Management → Diet Planning Program
 * + Diabetes Essentials guidebook (its frontmatter calls these out
 * explicitly).
 */
export const FOCUS_RELATED: Record<FocusSlug, readonly RelatedRef[]> = {
  "hormonal-health": [
    { kind: "library", slug: "pcos-guidebook" },
    { kind: "program", slug: "coaching" },
  ],
  "weight-management": [
    { kind: "program", slug: "diet-planning" },
    { kind: "library", slug: "diabetes-essentials" },
  ],
};

export type RelatedCard = {
  kind: RelatedKind;
  href: string;
  eyebrow: string;
  title: string;
  description: string;
};

/**
 * Resolve the `RelatedRef[]` for a focus slug into rendered card data,
 * pulling title/description/eyebrow from the source MDX frontmatter so the
 * cards stay in sync with the canonical content.
 */
export async function loadRelatedCards(slug: FocusSlug): Promise<RelatedCard[]> {
  const refs = FOCUS_RELATED[slug];
  const cards = await Promise.all(
    refs.map(async (ref): Promise<RelatedCard> => {
      if (ref.kind === "program") {
        const { frontmatter } = await loadProgram(ref.slug as ProgramFrontmatter["slug"]);
        return {
          kind: "program",
          href: `/programs/${ref.slug}`,
          eyebrow: frontmatter.eyebrow,
          title: frontmatter.title,
          description: frontmatter.description,
        };
      }
      const { frontmatter } = await loadLibrary(ref.slug as LibraryFrontmatter["slug"]);
      return {
        kind: "library",
        href: `/library/${ref.slug}`,
        eyebrow: frontmatter.eyebrow,
        title: frontmatter.title,
        description: frontmatter.description,
      };
    }),
  );
  return cards;
}

/** Hero subhead per focus area — kept in code (not frontmatter) because the
 *  current FocusFrontmatter schema does not include a `subhead` field, and
 *  this phase is "no schema changes."
 */
export const FOCUS_SUBHEAD: Record<FocusSlug, string> = {
  "hormonal-health":
    "Hormones are the body's quiet operators — and the difference between feeling like yourself and feeling untranslated. The long version of the conversation I have most weeks.",
  "weight-management":
    "There are faster ways to lose weight than this. There are very few that work twice. The patient view, from a clinical practice, of what actually moves and what doesn't.",
};

export function isFocusSlug(s: string): s is FocusSlug {
  return (FOCUS_SLUGS as readonly string[]).includes(s);
}
