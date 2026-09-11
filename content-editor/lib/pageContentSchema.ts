import { z } from "zod";

// No `fs`/`path` imports here deliberately - this file is shared by both
// server-only code (pagesRepo.ts) and the client-side edit form, so it must
// stay safe to bundle into the browser.
export const PageContentSchema = z.object({
  title: z.string(),
  markdownContent: z.string(),
  updatedAt: z.string(),
});

export type PageContent = z.infer<typeof PageContentSchema>;
