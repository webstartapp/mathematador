import aiParticipationMeta from "@/content/pages/ai-participation.json";
import aiParticipationBody from "@/content/pages/ai-participation.md";
import cookiesPolicyMeta from "@/content/pages/cookies-policy.json";
import cookiesPolicyBody from "@/content/pages/cookies-policy.md";
import gdprMeta from "@/content/pages/gdpr.json";
import gdprBody from "@/content/pages/gdpr.md";
import termsAndConditionsMeta from "@/content/pages/terms-and-conditions.json";
import termsAndConditionsBody from "@/content/pages/terms-and-conditions.md";

export interface PageMetadata {
  title: string;
  updatedAt: string;
}

export interface PageContent extends PageMetadata {
  markdownContent: string;
}

const buildPage = (
  metadata: PageMetadata,
  markdownContent: string,
): PageContent => ({ ...metadata, markdownContent });

// Static, build-time content - no DB, no runtime fetch. Metadata (title,
// updatedAt) lives in JSON; the body is a plain .md file so edits render as
// readable prose diffs in GitHub instead of escaped-string JSON diffs (see
// metro.config.js for how Metro bundles the .md as a string). Editing
// happens via the standalone `content-editor` workspace, which writes
// directly to both files on disk; the change ships on the next normal build
// once committed. See root CLAUDE.md for the full reasoning.
export const pagesBySlug: Record<string, PageContent> = {
  "terms-and-conditions": buildPage(
    termsAndConditionsMeta,
    termsAndConditionsBody,
  ),
  gdpr: buildPage(gdprMeta, gdprBody),
  "cookies-policy": buildPage(cookiesPolicyMeta, cookiesPolicyBody),
  "ai-participation": buildPage(aiParticipationMeta, aiParticipationBody),
};
