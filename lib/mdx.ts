// lib/mdx.ts
//
// Convenience re-exports of the MDX loaders + types. Page components can
// `import { loadProgram, type ProgramFrontmatter } from "@/lib/mdx"` without
// reaching into the lib/content/ subtree.

export {
  loadAbout,
  loadFocus,
  loadJournal,
  loadLegal,
  loadLibrary,
  loadMediaManifest,
  loadProgram,
  listSlugs,
  type LoadedDocument,
} from "./content/load";

export {
  type AboutFrontmatter,
  type ContentType,
  type FocusFrontmatter,
  type JournalFrontmatter,
  type LegalFrontmatter,
  type LibraryFrontmatter,
  type ProgramFrontmatter,
  FrontmatterByType,
} from "./content/types";
