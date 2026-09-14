"use client";

import { ChangeEvent, JSX, useActionState, useState } from "react";

import BackLink from "@/components/BackLink";
import Notice from "@/components/Notice";
import PageContainer from "@/components/PageContainer";
import PagePreview from "@/components/PagePreview";
import { savePageAction, SavePageState } from "@/lib/actions";
import { PageContent } from "@/lib/pageContentSchema";

interface EditPageFormProps {
  slug: string;
  initialPage: PageContent;
}

const initialActionState: SavePageState = { page: null, error: null };

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 8,
  marginTop: 4,
  fontSize: 14,
};

const EditPageForm = ({
  slug,
  initialPage,
}: EditPageFormProps): JSX.Element => {
  const [title, setTitle] = useState(initialPage.title);
  const [markdownContent, setMarkdownContent] = useState(
    initialPage.markdownContent,
  );
  const [state, formAction, isSaving] = useActionState(
    savePageAction.bind(null, slug),
    initialActionState,
  );
  const savedPage = state.page ?? initialPage;
  const updatedAt = savedPage.updatedAt;
  const hasUnsavedChanges =
    title !== savedPage.title || markdownContent !== savedPage.markdownContent;

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleContentChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setMarkdownContent(event.target.value);
  };

  return (
    <PageContainer maxWidth={900}>
      <BackLink href="/content" label="page list" />
      <h1>Editing: {slug}</h1>
      {/* This tool only ever runs on the developer's own machine, so the
          browser and this server render in the same locale/timezone in
          practice - suppressHydrationWarning is Next's documented escape
          hatch for a value that can legitimately differ between server and
          client renders (see its own docs), rather than restructuring this
          into a client-only-rendered date for a mismatch that isn't
          actually reachable here. */}
      <Notice tone="muted">
        <span suppressHydrationWarning>
          Last saved: {new Date(updatedAt).toLocaleString()}
        </span>
      </Notice>

      <form action={formAction}>
        <label style={{ display: "block", marginTop: 16 }}>
          Title
          <input
            name="title"
            value={title}
            onChange={handleTitleChange}
            disabled={isSaving}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: 16 }}>
          Markdown content
          <textarea
            name="markdownContent"
            value={markdownContent}
            onChange={handleContentChange}
            disabled={isSaving}
            rows={16}
            style={{ ...inputStyle, fontFamily: "monospace" }}
          />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          style={{ marginTop: 16, padding: "8px 16px" }}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </form>
      {state.page && !state.error && !hasUnsavedChanges && (
        <Notice tone="success">Saved.</Notice>
      )}
      {state.error && <Notice tone="error">{state.error}</Notice>}

      <h2 style={{ marginTop: 32 }}>Preview</h2>
      <PagePreview
        slug={slug}
        markdownContent={markdownContent}
        updatedAt={updatedAt}
      />
    </PageContainer>
  );
};

export default EditPageForm;
