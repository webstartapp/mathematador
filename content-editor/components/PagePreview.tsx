"use client";

import { JSX, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

interface PagePreviewProps {
  slug: string;
  markdownContent: string;
  updatedAt: string;
}

type PreviewTab = "raw" | "game";

const tabButtonStyle = (isActive: boolean): object => ({
  padding: "6px 14px",
  border: "1px solid #ccc",
  borderBottom: isActive ? "1px solid #fff" : "1px solid #ccc",
  borderRadius: "6px 6px 0 0",
  background: isActive ? "#fff" : "#eee",
  fontWeight: isActive ? "bold" : "normal",
  cursor: "pointer",
});

// The real /info/[slug] screen is a React Native/Expo view with its own
// game styling (background art, themed card, brand buttons) - approximating
// that by hand in plain web CSS here drifted out of sync the moment the
// real screen's styles changed. Embedding the actual running Expo web dev
// server is accurate by construction instead. mathematador-app's dev server
// always runs on this fixed port (see root CLAUDE.md) alongside this tool.
const GAME_APP_ORIGIN = "http://localhost:4075";

// This page's own content links to the other three pages (e.g.
// /info/gdpr) using paths that only resolve inside mathematador-app, not
// this Next.js app - left as plain <a> tags, clicking one here would
// either 404 in content-editor itself or (worse) navigate this tab away
// entirely, discarding unsaved edits. Resolves an in-game-looking link
// against the real app's origin and opens every link in a new tab instead,
// so this preview is never a dead end or a data-loss trap.
// react-markdown passes its own internal HAST `node` as an extra prop to
// custom renderers - destructured out here (and named, not spread) so it
// never reaches the native <a> as an invalid DOM attribute.
const PreviewLink: Components["a"] = ({
  href,
  children,
  node: _node,
  ...rest
}) => (
  <a
    {...rest}
    href={href?.startsWith("/") ? `${GAME_APP_ORIGIN}${href}` : href}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

const previewComponents: Components = { a: PreviewLink };

const PagePreview = ({
  slug,
  markdownContent,
  updatedAt,
}: PagePreviewProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<PreviewTab>("raw");

  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => setActiveTab("raw")}
          style={tabButtonStyle(activeTab === "raw")}
        >
          Live preview
        </button>
        <button
          onClick={() => setActiveTab("game")}
          style={tabButtonStyle(activeTab === "game")}
        >
          In-game preview
        </button>
      </div>

      {activeTab === "raw" && (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={previewComponents}
          >
            {markdownContent}
          </ReactMarkdown>
        </div>
      )}

      {activeTab === "game" && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <p
            style={{
              margin: 0,
              padding: "8px 12px",
              fontSize: 12,
              color: "#888",
              borderBottom: "1px solid #ddd",
            }}
          >
            Showing the last <strong>saved</strong> version, live from{" "}
            {GAME_APP_ORIGIN} - save your edits above to update it.
          </p>
          {/* Remounted on every save (updatedAt changes) to force a fresh
              load instead of showing a stale cached iframe. */}
          <iframe
            key={updatedAt}
            src={`${GAME_APP_ORIGIN}/info/${slug}`}
            title="In-game preview"
            style={{
              width: "100%",
              height: 700,
              border: "none",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PagePreview;
