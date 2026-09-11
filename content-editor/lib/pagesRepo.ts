import { promises as fsPromises } from "fs";
import path from "path";

import { PageContent, PageContentSchema } from "@/lib/pageContentSchema";

export type { PageContent };

// This tool only ever runs on a developer's own machine, as a sibling
// checkout of the same monorepo - it edits mathematador-app's bundled
// content directly on disk, never over a network. See root CLAUDE.md.
const PAGES_DIRECTORY = path.resolve(
  process.cwd(),
  "../mathematador-app/src/content/pages",
);

const JSON_EXTENSION = ".json";
const MARKDOWN_EXTENSION = ".md";

// Metadata (title, updatedAt) is JSON; the body is a sibling .md file so
// content edits render as readable prose diffs in GitHub instead of
// escaped-string JSON diffs - see mathematador-app/metro.config.js for how
// the app bundles that .md file as a plain string at build time.
const PageMetadataSchema = PageContentSchema.omit({ markdownContent: true });

// The set of pages this tool can edit is fixed, matching the static
// registry `mathematador-app/src/content/pages/index.ts` actually imports
// (that file can't be read directly from here - it statically imports .md
// files through a Metro-only transform content-editor's plain Node/Next.js
// runtime doesn't have). This list - not "whatever .json/.md files happen
// to currently exist on disk" - is the source of truth for which slugs are
// editable, so a page whose files were accidentally deleted stays
// reachable and recoverable here instead of 404ing forever. Adding a truly
// new page (a fifth slug) needs a matching entry added to both this map and
// that real registry - this tool alone can't make a new page show up in
// the actual game.
const KNOWN_PAGE_TITLES: Record<string, string> = {
  "terms-and-conditions": "Terms & Conditions",
  gdpr: "Privacy Policy (GDPR)",
  "cookies-policy": "Cookies Policy",
  "ai-participation": "AI Participation",
};

export const listPageSlugs = async (): Promise<string[]> =>
  Object.keys(KNOWN_PAGE_TITLES);

// Sentinel `updatedAt` for a known page whose files don't exist (or don't
// parse) yet, so callers - the list page in particular - can tell "empty,
// never written" apart from a real save timestamp without a magic date
// literal duplicated elsewhere.
export const EMPTY_PAGE_UPDATED_AT = new Date(0).toISOString();

export const readPage = async (slug: string): Promise<PageContent | null> => {
  if (!(slug in KNOWN_PAGE_TITLES)) {
    return null;
  }

  const metadataPath = path.join(PAGES_DIRECTORY, `${slug}${JSON_EXTENSION}`);
  const markdownPath = path.join(
    PAGES_DIRECTORY,
    `${slug}${MARKDOWN_EXTENSION}`,
  );

  try {
    const [rawMetadata, markdownContent] = await Promise.all([
      fsPromises.readFile(metadataPath, "utf8"),
      fsPromises.readFile(markdownPath, "utf8"),
    ]);
    const parsedMetadata = PageMetadataSchema.safeParse(
      JSON.parse(rawMetadata),
    );
    if (parsedMetadata.success) {
      return { ...parsedMetadata.data, markdownContent };
    }
  } catch {
    // One or both files are missing, unreadable, or corrupted - fall
    // through to a recoverable empty draft below rather than failing.
  }

  return {
    title: KNOWN_PAGE_TITLES[slug],
    markdownContent: "",
    updatedAt: EMPTY_PAGE_UPDATED_AT,
  };
};

export interface PageContentUpdate {
  title: string;
  markdownContent: string;
}

// Edit-only, deliberately: writing a slug outside KNOWN_PAGE_TITLES throws
// rather than silently creating an arbitrary new page - this tool has no
// add/remove-page UI, and a wholly new slug wouldn't render in the real
// game anyway without also being added to its static registry.
export const writePage = async (
  slug: string,
  update: PageContentUpdate,
): Promise<PageContent> => {
  if (!(slug in KNOWN_PAGE_TITLES)) {
    throw new Error(`Unknown page slug: ${slug}`);
  }

  const updatedAt = new Date().toISOString();
  const metadataPath = path.join(PAGES_DIRECTORY, `${slug}${JSON_EXTENSION}`);
  const markdownPath = path.join(
    PAGES_DIRECTORY,
    `${slug}${MARKDOWN_EXTENSION}`,
  );
  // Submitting a <form> normalizes textarea line breaks to CRLF per the
  // HTML spec, regardless of OS - normalize back to LF before writing so
  // saves never silently reintroduce CRLF into a file that's meant to keep
  // clean, readable git diffs.
  const normalizedMarkdown = update.markdownContent.replace(/\r\n/g, "\n");
  const markdownContent = normalizedMarkdown.endsWith("\n")
    ? normalizedMarkdown
    : `${normalizedMarkdown}\n`;

  await Promise.all([
    fsPromises.writeFile(
      metadataPath,
      `${JSON.stringify({ title: update.title, updatedAt }, null, 2)}\n`,
      "utf8",
    ),
    fsPromises.writeFile(markdownPath, markdownContent, "utf8"),
  ]);

  return { title: update.title, markdownContent, updatedAt };
};
