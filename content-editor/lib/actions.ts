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
  previousState: SavePageState,
  formData: FormData,
): Promise<SavePageState> => {
  const title = formData.get("title");
  const markdownContent = formData.get("markdownContent");

  if (typeof title !== "string" || typeof markdownContent !== "string") {
    return { page: previousState.page, error: "Invalid form submission" };
  }

  try {
    const page = await writePage(slug, { title, markdownContent });
    return { page, error: null };
  } catch (caughtError) {
    // Keep whatever page was last successfully saved (rather than
    // discarding it to null) so a failed save doesn't make the UI forget
    // the real last-saved timestamp/content. Report the actual failure
    // instead of a hardcoded guess - writePage only ever throws for an
    // unknown slug, but a real filesystem error (permissions, a read-only
    // checkout, disk full) would otherwise be misreported as that.
    const message =
      caughtError instanceof Error ? caughtError.message : "Save failed";
    return { page: previousState.page, error: message };
  }
};
