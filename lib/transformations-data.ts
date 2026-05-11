// lib/transformations-data.ts
//
// Real client transformation stories. Empty until Dr. Ruhma sends the photos
// + narratives — the page renders an empty state in the meantime.

export type Transformation = {
  slug: string;
  name: string;
  condition: string;
  durationWeeks: number;
  summary: string;
  quote?: string;
  beforeImage?: string;
  afterImage?: string;
};

export const TRANSFORMATIONS: readonly Transformation[] = [];
