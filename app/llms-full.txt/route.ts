import { site } from "@/content/site";
import {
  listSlugs,
  loadAbout,
  loadFocus,
  loadLibrary,
  loadProgram,
  type LoadedDocument,
} from "@/lib/mdx";
import { loadAllJournal } from "@/lib/journal-data";

export const dynamic = "force-static";
export const revalidate = 3600;

type AnyDoc = LoadedDocument<{ title: string; description?: string }>;

function renderDoc(url: string, doc: AnyDoc): string {
  const fm = doc.frontmatter;
  const parts = [`## ${fm.title}`, "", `Source: ${url}`, ""];
  if (fm.description) {
    parts.push(`> ${fm.description}`, "");
  }
  parts.push(doc.body, "", "---", "");
  return parts.join("\n");
}

export async function GET() {
  const sections: string[] = [];

  sections.push(`# ${site.name} — Full Content`, "");
  sections.push(`> ${site.description}`, "");
  sections.push(
    "This file contains the full editorial content of the site (about page, programs, focus areas, library guidebooks, and journal posts) for ingestion by language models. The shorter index lives at /llms.txt.",
    "",
    "---",
    "",
  );

  const about = (await loadAbout()) as AnyDoc;
  sections.push(renderDoc(`${site.url}/about`, about));

  const programSlugs = await listSlugs("programs");
  for (const slug of programSlugs) {
    const doc = (await loadProgram(slug)) as AnyDoc;
    sections.push(renderDoc(`${site.url}/programs/${slug}`, doc));
  }

  const focusSlugs = await listSlugs("focus");
  for (const slug of focusSlugs) {
    const doc = (await loadFocus(slug)) as AnyDoc;
    sections.push(renderDoc(`${site.url}/focus/${slug}`, doc));
  }

  const librarySlugs = await listSlugs("library");
  for (const slug of librarySlugs) {
    const doc = (await loadLibrary(slug)) as AnyDoc;
    sections.push(renderDoc(`${site.url}/library/${slug}`, doc));
  }

  const journal = await loadAllJournal();
  for (const doc of journal) {
    sections.push(renderDoc(`${site.url}/journal/${doc.frontmatter.slug}`, doc as AnyDoc));
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

//now the deploy issue fix
