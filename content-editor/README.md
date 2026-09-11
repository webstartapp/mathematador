# Mathematador Content Editor

A local-only tool for editing static content that gets bundled into the app
at build time. The homepage (`/`) is a dashboard linking to each content
section; today there's one section, **Public Page Content** (`/content`),
for the static pages in `mathematador-app/src/content/pages/` (Terms &
Conditions, GDPR, Cookies Policy, AI Participation - see issues #34/#35).
Each page is two files: `<slug>.json` holds metadata (`title`, `updatedAt`)
and `<slug>.md` holds the body - split so the actual legal-text edits show
up as readable prose diffs in GitHub instead of escaped-string diffs inside
JSON.
More sections (e.g. minigame content) are expected to be added the same way
later - each gets its own route under `app/`, its own entry in the
dashboard's section list (`app/page.tsx`), and its own save API route.

**This is never built, deployed, or exposed anywhere but a developer's own
machine.** It requires no login: whoever can run it already has the repo
cloned and could hand-edit the JSON files directly in a text editor, so the
game's own admin-role auth would be redundant here. `deploy.yml` never
references this workspace at all - that's what actually keeps it off any
real server, not any runtime check inside the tool itself.

## Usage

```bash
npm run dev --workspace=content-editor
```

(or just `npm run dev` from the repo root, which starts this alongside the
backend and the Expo app) then open <http://localhost:4077>.

- The dashboard shows each content section - currently just "Public Page
  Content".
- `/content` lists all known pages with their last-updated time.
- Opening one lets you edit its title and markdown content, with a live
  preview, and save.
- Saving writes both `mathematador-app/src/content/pages/<slug>.json`
  (title + a freshly bumped `updatedAt`) and `<slug>.md` (the body) straight
  to disk - it does **not** commit anything. Review the diff and commit it
  yourself through your normal git workflow once you're happy with the
  change.

There's no way to add or remove a page from this tool - only the four
pages that already exist can be edited.
