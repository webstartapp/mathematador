import { JSX } from "react";

import BackLink from "@/components/BackLink";
import EditPageForm from "@/components/EditPageForm";
import Notice from "@/components/Notice";
import PageContainer from "@/components/PageContainer";
import { readPage } from "@/lib/pagesRepo";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

// Renders inline instead of calling next/navigation's notFound() - that
// swaps in Next's whole-page not-found boundary, which drops this tool's
// own chrome entirely (no way to navigate anywhere else without editing
// the URL by hand). A typo'd slug should be a recoverable dead end, not a
// blocked one. Composed entirely from the same shared pieces every other
// page here uses - not a one-off.
const UnknownSlugMessage = ({ slug }: { slug: string }): JSX.Element => (
  <PageContainer maxWidth={900}>
    <BackLink href="/content" label="page list" />
    <h1>Unknown page: {slug}</h1>
    <Notice tone="error">
      There&apos;s no page with this slug. This tool can only edit the pages
      listed on the page list - it has no add-new-page UI (see
      content-editor/README.md).
    </Notice>
  </PageContainer>
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
