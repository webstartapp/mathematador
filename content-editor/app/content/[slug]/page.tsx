import { JSX } from "react";

import EditPageForm from "@/components/EditPageForm";
import { readPage } from "@/lib/pagesRepo";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

// Renders an inline message instead of calling next/navigation's
// notFound() - that swaps in Next's whole-page not-found boundary, which
// drops this tool's own chrome entirely (no "back to page list" link, no
// way to navigate anywhere else without editing the URL by hand). A typo'd
// slug should be a recoverable dead end, not a blocked one.
const UnknownSlugMessage = ({ slug }: { slug: string }): JSX.Element => (
  <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
    <p>
      <a href="/content">&larr; Back to page list</a>
    </p>
    <h1>Unknown page: {slug}</h1>
    <p style={{ color: "#c0392b" }}>
      There&apos;s no page with this slug. This tool can only edit the pages
      listed on the page list - it has no add-new-page UI (see
      content-editor/README.md).
    </p>
  </main>
);

const EditPage = async ({ params }: EditPageProps): Promise<JSX.Element> => {
  const { slug } = await params;
  const page = await readPage(slug);

  if (!page) {
    return <UnknownSlugMessage slug={slug} />;
  }

  return <EditPageForm slug={slug} initialPage={page} />;
};

export default EditPage;
