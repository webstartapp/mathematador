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

const slugFromFilename = (filename: string): string | null =>
  filename.endsWith(JSON_EXTENSION)
    ? filename.slice(0, -JSON_EXTENSION.length)
    : null;

export const listPageSlugs = async (): Promise<string[]> => {
  const entries = await fsPromises.readdir(PAGES_DIRECTORY);
  const slugs: string[] = [];
  for (const filename of entries) {
    const slug = slugFromFilename(filename);
    if (slug !== null) {
      slugs.push(slug);
    }
  }
  return slugs;
};

export const readPage = async (slug: string): Promise<PageContent | null> => {
  const metadataPath = path.join(PAGES_DIRECTORY, `${slug}${JSON_EXTENSION}`);
  const markdownPath = path.join(
    PAGES_DIRECTORY,
    `${slug}${MARKDOWN_EXTENSION}`,
  );
  let rawMetadata: string;
  let markdownContent: string;
  try {
    [rawMetadata, markdownContent] = await Promise.all([
      fsPromises.readFile(metadataPath, "utf8"),
      fsPromises.readFile(markdownPath, "utf8"),
    ]);
  } catch {
    return null;
  }

  const parsedMetadata = PageMetadataSchema.safeParse(JSON.parse(rawMetadata));
  return parsedMetadata.success
    ? { ...parsedMetadata.data, markdownContent }
    : null;
};

export interface PageContentUpdate {
  title: string;
  markdownContent: string;
}

// Edit-only, deliberately: writing an unknown slug throws rather than
// silently creating a new page - this tool has no add/remove-page UI.
export const writePage = async (
  slug: string,
  update: PageContentUpdate,
): Promise<PageContent> => {
  const knownSlugs = await listPageSlugs();
  if (!knownSlugs.includes(slug)) {
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
