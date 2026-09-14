import { JSX } from "react";

import EditPageForm from "@/components/EditPageForm";
import NotFoundMessage from "@/components/NotFoundMessage";
import { readPage } from "@/lib/pagesRepo";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

const EditPage = async ({ params }: EditPageProps): Promise<JSX.Element> => {
  const { slug } = await params;
  const page = await readPage(slug);

  if (!page) {
    return (
      <NotFoundMessage title="Not found">
        There&apos;s no content for &quot;{slug}&quot;.
      </NotFoundMessage>
    );
  }

  return <EditPageForm slug={slug} initialPage={page} />;
};

export default EditPage;
