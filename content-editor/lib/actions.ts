"use server";

import { PageContent } from "@/lib/pageContentSchema";
import { writePage } from "@/lib/pagesRepo";

export interface SavePageState {
  page: PageContent | null;
  error: string | null;
}

// Bound to a specific slug per edit page (`savePageAction.bind(null, slug)`)
// before being passed to useActionState, so the slug travels as a closed-
// over server-side argument rather than a hidden form field.
export const savePageAction = async (
  slug: string,
  _previousState: SavePageState,
  formData: FormData,
): Promise<SavePageState> => {
  const title = formData.get("title");
  const markdownContent = formData.get("markdownContent");

  if (typeof title !== "string" || typeof markdownContent !== "string") {
    return { page: null, error: "Invalid form submission" };
  }

  try {
    const page = await writePage(slug, { title, markdownContent });
    return { page, error: null };
  } catch {
    return { page: null, error: "Unknown page slug" };
  }
};
