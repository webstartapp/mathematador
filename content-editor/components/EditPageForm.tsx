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
  const updatedAt = state.page?.updatedAt ?? initialPage.updatedAt;

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
      <Notice tone="muted">
        Last saved: {new Date(updatedAt).toLocaleString()}
      </Notice>

      <form action={formAction}>
        <label style={{ display: "block", marginTop: 16 }}>
          Title
          <input
            name="title"
            value={title}
            onChange={handleTitleChange}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: 16 }}>
          Markdown content
          <textarea
            name="markdownContent"
            value={markdownContent}
            onChange={handleContentChange}
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
      {state.page && !state.error && <Notice tone="success">Saved.</Notice>}
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
