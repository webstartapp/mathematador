import Link from "next/link";
import { JSX } from "react";

import {
  EMPTY_PAGE_UPDATED_AT,
  listPageSlugs,
  readPage,
} from "@/lib/pagesRepo";

interface PageListEntry {
  slug: string;
  title: string;
  updatedAt: string;
}

const loadPageListEntries = async (): Promise<PageListEntry[]> => {
  const slugs = await listPageSlugs();
  const entries: PageListEntry[] = [];
  for (const slug of slugs) {
    const page = await readPage(slug);
    if (page) {
      entries.push({ slug, title: page.title, updatedAt: page.updatedAt });
    }
  }
  return entries;
};

const ContentListPage = async (): Promise<JSX.Element> => {
  const entries = await loadPageListEntries();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <p>
        <a href="/">&larr; Back to dashboard</a>
      </p>
      <h1>Public Page Content</h1>
      <p>
        Local-only tool for editing static public page content. Saving writes
        directly to the JSON files in <code>mathematador-app</code> - commit the
        change yourself afterward through your normal git workflow.
      </p>
      <ul>
        {entries.map((entry) => (
          <li key={entry.slug} style={{ marginBottom: 8 }}>
            <Link href={`/content/${entry.slug}`}>{entry.title}</Link>
            {entry.updatedAt === EMPTY_PAGE_UPDATED_AT ? (
              <span style={{ color: "#c0392b" }}>
                {" — not yet created, click to add content"}
              </span>
            ) : (
              <>
                {" — last updated "}
                {new Date(entry.updatedAt).toLocaleString()}
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ContentListPage;
