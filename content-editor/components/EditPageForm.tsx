"use client";

import { ChangeEvent, JSX, useState } from "react";

import PagePreview from "@/components/PagePreview";
import { PageContent, PageContentSchema } from "@/lib/pageContentSchema";

interface EditPageFormProps {
  slug: string;
  initialPage: PageContent;
}

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
  const [updatedAt, setUpdatedAt] = useState(initialPage.updatedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleContentChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ): void => {
    setMarkdownContent(event.target.value);
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setSaveError(null);
    setShowSaved(false);
    try {
      const response = await fetch(`/api/content/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, markdownContent }),
      });
      if (!response.ok) {
        throw new Error(`Save failed with status ${response.status}`);
      }
      const parsedResponse = PageContentSchema.safeParse(await response.json());
      if (!parsedResponse.success) {
        throw new Error("Save response was not a valid page");
      }
      setUpdatedAt(parsedResponse.data.updatedAt);
      setShowSaved(true);
    } catch (caughtError) {
      setSaveError(
        caughtError instanceof Error ? caughtError.message : "Save failed",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <p>
        <a href="/content">&larr; Back to page list</a>
      </p>
      <h1>Editing: {slug}</h1>
      <p style={{ color: "#888" }}>
        Last saved: {new Date(updatedAt).toLocaleString()}
      </p>

      <label style={{ display: "block", marginTop: 16 }}>
        Title
        <input value={title} onChange={handleTitleChange} style={inputStyle} />
      </label>

      <label style={{ display: "block", marginTop: 16 }}>
        Markdown content
        <textarea
          value={markdownContent}
          onChange={handleContentChange}
          rows={16}
          style={{ ...inputStyle, fontFamily: "monospace" }}
        />
      </label>

      <button
        onClick={handleSave}
        disabled={isSaving}
        style={{ marginTop: 16, padding: "8px 16px" }}
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
      {showSaved && <p style={{ color: "green" }}>Saved.</p>}
      {saveError && <p style={{ color: "#c0392b" }}>{saveError}</p>}

      <h2 style={{ marginTop: 32 }}>Preview</h2>
      <PagePreview
        slug={slug}
        markdownContent={markdownContent}
        updatedAt={updatedAt}
      />
    </main>
  );
};

export default EditPageForm;
