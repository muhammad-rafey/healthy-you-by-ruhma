import { site } from "@/content/site";
import { loadAllJournal } from "@/lib/journal-data";

export const dynamic = "force-static";
export const revalidate = 3600;

type Link = { path: string; title: string; description: string };

const PRACTICE: Link[] = [
  { path: "/", title: "Home", description: "Overview of the practice and how to start." },
  {
    path: "/about",
    title: "About Dr. Ruhma",
    description: "Background, credentials, and clinical philosophy.",
  },
  {
    path: "/services",
    title: "Services",
    description: "All consultation and coaching offerings at a glance.",
  },
  {
    path: "/transformations",
    title: "Transformations",
    description: "Client outcomes and case stories.",
  },
  {
    path: "/contact",
    title: "Contact",
    description: "Book a consultation or send a question.",
  },
];

const PROGRAMS: Link[] = [
  {
    path: "/programs/coaching",
    title: "Coaching",
    description: "Multi-week coaching program for sustained change.",
  },
  {
    path: "/programs/consultation",
    title: "Consultation Call",
    description: "One-off clinical consultation with Dr. Ruhma.",
  },
];

const FOCUS: Link[] = [
  {
    path: "/focus/hormonal-health",
    title: "Hormonal Health",
    description: "PCOS, thyroid, and hormone-driven nutrition support.",
  },
  {
    path: "/focus/weight-management",
    title: "Weight Management",
    description: "Sustainable, clinically-grounded weight management.",
  },
];

const LIBRARY: Link[] = [
  {
    path: "/library",
    title: "The Library",
    description: "Guidebooks and reference resources.",
  },
  {
    path: "/library/diabetes-essentials",
    title: "Diabetes Essentials",
    description: "Practical guidebook for living with and managing diabetes.",
  },
  {
    path: "/library/pcos-guidebook",
    title: "PCOS Guidebook",
    description: "Nutrition and lifestyle reference for PCOS.",
  },
  {
    path: "/library/skin-secrets",
    title: "Skin Secrets",
    description: "Nutrition-led approach to skin health.",
  },
];

const LEGAL: Link[] = [
  { path: "/legal/privacy", title: "Privacy", description: "Privacy policy." },
  { path: "/legal/terms", title: "Terms", description: "Terms of service." },
  { path: "/legal/refunds", title: "Refunds", description: "Refund policy." },
];

function renderSection(heading: string, links: Link[]): string[] {
  const lines = [`## ${heading}`, ""];
  for (const l of links) {
    lines.push(`- [${l.title}](${site.url}${l.path}): ${l.description}`);
  }
  lines.push("");
  return lines;
}

export async function GET() {
  const lines: string[] = [];
  lines.push(`# ${site.name}`, "");
  lines.push(`> ${site.description}`, "");
  lines.push(`Full editorial content for ingestion: ${site.url}/llms-full.txt`, "");

  lines.push(...renderSection("Practice", PRACTICE));
  lines.push(...renderSection("Programs", PROGRAMS));
  lines.push(...renderSection("Focus areas", FOCUS));
  lines.push(...renderSection("Library", LIBRARY));
  lines.push(...renderSection("Legal", LEGAL));

  const journal = await loadAllJournal();
  if (journal.length > 0) {
    lines.push("## Journal", "");
    for (const d of journal) {
      lines.push(
        `- [${d.frontmatter.title}](${site.url}/journal/${d.frontmatter.slug}): ${d.frontmatter.description}`,
      );
    }
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
