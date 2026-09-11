import { notFound } from "next/navigation";
import { JSX } from "react";

import EditPageForm from "@/components/EditPageForm";
import { readPage } from "@/lib/pagesRepo";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

const EditPage = async ({ params }: EditPageProps): Promise<JSX.Element> => {
  const { slug } = await params;
  const page = await readPage(slug);

  if (!page) {
    notFound();
  }

  return <EditPageForm slug={slug} initialPage={page} />;
};

export default EditPage;
