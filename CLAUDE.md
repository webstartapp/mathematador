# Mathematador — Technical Guide for Agents

Mathematador is a math-practice mobile game ("El Coliseo de los Números" / *The Numbers Coliseum*) built as a two-workspace **npm workspaces monorepo**:

- **`mathematador-app/`** — React Native + Expo (SDK 56) client, targets iOS/Android/Web.
- **`server/`** — Express + Knex + PostgreSQL backend.

The gameplay theme: the player is a rookie *Torero* solving arithmetic "passes" (addition/subtraction/multiplication/division) with a friendly companion, the **Toro Numérico** (never an enemy — see `agents/instructions.md` §2 for the strict 0+ theming rules before touching any Toro-related UI). Full game design lives in [`docs/game_proposal.md`](docs/game_proposal.md) and [`docs/game_structure.md`](docs/game_structure.md) — read those for *what the game is*; this file is about *how the code is organized and what to watch out for*.

For workspace-specific detail, see the nested guides: [`mathematador-app/CLAUDE.md`](mathematador-app/CLAUDE.md) and [`server/CLAUDE.md`](server/CLAUDE.md).

## Architecture at a glance

```
mathematador-app (Redux + redux-persist/AsyncStorage, offline-first)
    │  Orval-generated client (src/_generated/api.ts), axios
    ▼
server (Express, requireAuth middleware, restAPICall wrapper)
    │  Knex
    ▼
PostgreSQL
```

A single OpenAPI spec, `analytics/_swaggers/be_fe.yaml`, drives **all** generated code on both sides via `orval.config.ts` (run with `npm run generate`). Never hand-edit anything under `_generated/` — edit the spec and regenerate. CI (`.github/workflows/pr-checks.yml`) fails the build if `npm run generate` produces a diff, i.e. the generated code and the spec must always be in sync in every commit.

## Dev commands (run from repo root)

```bash
npm run dev          # concurrently runs server (nodemon) + Expo app, via scripts/dev.js
npm run lint          # eslint . across both workspaces
npm test              # server tests, then app tests
npm run build          # server tsc build, then app `expo export -p web`
npm run generate       # regenerate all Orval clients/models/zod schemas from the OpenAPI spec
```

Ports and DB connection come from `.env` (see `.env.example`) — `PORT`/`EXPO_PORT` default to 4076/4075, `DATABASE=stage|production` switches which Postgres connection string `server/src/knexWrapper.ts` uses (not `NODE_ENV`).

## Coding conventions (enforced by `eslint.config.js`, not just style advice)

- **No relative imports.** Only `@/...` path aliases (`@/*` maps to each workspace's `src/*` and `./*`). This is a hard ESLint error (`no-restricted-imports`).
- **No default-exported function/class declarations.** Always `const Foo = () => {...}; export default Foo;`.
- **Arrow functions only** (`func-style: expression`) — no `function` declarations.
- **Explicit return types required** on every function.
- `max-lines: 150` per file (configs/ dir is exempted), `complexity: 10`, `max-depth: 4`, `max-params: 4`.
- **`id-length: min 4`** — no single/double-letter variable names except a short allow-list (`id`, `row`, `x`, `y`, `min`, `max`, etc.). Use `firstNumber`/`secondNumber`, not `a`/`b`.
- No `console.log` in app code (`no-console`, except `server/src/migrations/**`).
- `unknown` and `as` type assertions are banned; `any` is a lint error too.
- Prettier runs as an ESLint rule (`prettier/prettier`) — `npx eslint --fix` resolves most formatting nits.

Run `npx eslint <path>` on files you touch before considering a change done — `npm run lint` at the repo root is what CI actually runs.

## Git / PR workflow

Full policy is in [`agents/instructions.md`](agents/instructions.md) — summary:

1. Branch from `develop`: `issue-<number>-<short-description>`.
2. Implement, then verify locally (see below) — CI checks (`pr-checks.yml`) sometimes don't report on a PR promptly, so **run the equivalent commands locally before merging, don't rely on the PR's check status alone**: `npm run generate && git diff --exit-code`, `npm run lint`, `npm run build --workspace=server`, `npm run build --workspace=mathematador-app`, `npm test`.
3. Push directly — pushes to feature branches (`issue-*`) are pre-approved per `agents/instructions.md` §3.4. Pushes/merges to `develop`/`main` are not.
4. Open a PR targeting `develop` with `Closes #<number>` in the body.
5. This repo's convention has been **squash-merge**, with the feature branch deleted (locally and on origin) immediately after.
6. `agents/verify.js` / `agents/submit-pr.js` / `agents/issue-helper.js` automate steps 2/4 and branch setup respectively, if you'd rather run a script than the raw commands.

An automated review bot (`cubic-dev-ai`) comments on PRs — treat its findings as a real second opinion, verify each one against the code before dismissing or fixing.

## Known gotchas & pre-existing bugs

These were found while mapping the codebase (2026-08-27) and are **not** things you introduced — don't waste time re-discovering them, but do fix them if you're touching the affected area (or check the standing follow-up task chips in this session for three of them already queued up).

### 🔴 Gauntlet & Daily Challenge are completely broken (minigame-id mismatch)

`mathematador-app/src/configs/minigames.ts` registers its only minigame as `id: "SingleLineMinigame"`. Every other part of the system — the generated `Minigame` enum, the server, `server/src/utils/mathGenerator.ts`, and critically `mathematador-app/src/screens/GauntletScreen.tsx` (both its server-backed path and its offline fallback) — uses the string `"singleLine"`. `ChallengeGameScreen.tsx:241` looks up the component by exact string match, so **starting a Gauntlet run or the Daily Challenge always renders "Minigame component not found."** instead of the game. The normal per-operation practice flow is unaffected because it sources the id from the same config it looks it up in (`helpers/getChalengeByLevel.ts`). Fix: align on `"singleLine"` everywhere (that's what the DB/enum/server already use).

### 🔴 Subtraction and division give wrong answers in the main practice flow

`mathematador-app/src/configs/operations.ts`: subtraction's `getResult` reduces with `+` (copy-pasted from addition); division's reduces with `*` (copy-pasted from multiplication). This is usually masked because most exercises carry a server-computed `.result` field, but the **main "Operation Select → Challenge Select → Start" loop** generates exercises via `helpers/getChalengeByLevel.ts`, which never sets `.result` — so for that flow, subtraction/division challenges compute the wrong expected answer and are effectively unplayable.

### 🟠 Auth is not wired up end-to-end

No `LoginScreen`/`RegisterScreen` exists — there is no UI path to obtain a JWT. Even if there were, `userSlice`'s `UserState` never stores the user's `id`, so `mathematador-app/src/utils/api-client.ts`'s `getPersistedViewerId()` always resolves to `undefined`, meaning a stored token would never be re-attached to requests anyway. Every screen that calls an authenticated endpoint (`GauntletScreen`, `TiendaScreen`) is written defensively with try/catch + local-Redux fallback specifically because of this — assume authenticated calls will 401 and silently fall back until this is fixed.

### 🔴 Unauthenticated password-reset endpoint (security)

`server/src/routes.ts` registers `PUT /user/login` (→ `userLoginPassword.ts`) **without** the `requireAuth` middleware every other sensitive route uses. The handler falls back to updating the *first row in the `users` table* (in practice the seeded root admin) when `request.userId` is unset — which it always is on this unauthenticated route. Anyone who knows the endpoint exists can reset the admin account's password. Needs a real fix (proper forgotten-password token flow, or at minimum `requireAuth` + scoping the update to the caller's own row) — see the standing follow-up task for this.

### Dead / vestigial code worth knowing about (so you don't build on it by mistake)

- `redux/slices/gameSlice.ts` — not read or dispatched by any live screen; real state lives in `userSlice.ts`.
- `configs/challengeExercises.ts` (1568 lines, hardcoded exercise table) — superseded by `helpers/getChalengeByLevel.ts`; appears unused.
- `types/enums.ts` (both `mathematador-app` and `server` copies) — unused leftover boilerplate from a different project template.
- `mathematador-app/src/hooks/useTypedSelector.ts` — empty file.
- `HeaderModule` (`components/common/HeaderEvents.ts`) — no such native module is registered anywhere; always a no-op.
- `expo-jwt` dependency and `EXPO_PUBLIC_JWT_SECRET` env var — unused (JWT signing is server-only).
- `server/src/_generated/serverAPI.ts` — type-extraction plumbing only, never called at runtime; real routing is 100% hand-written in `server/src/routes.ts`.
- `server/src/migrations/20241109002335_gameData.js` — a no-op migration (empty `up`/`down`).
- `GauntletScreen.tsx`'s leaderboard — fully hardcoded/fake, not backed by any API.
- `QueryClientProvider` is set up in `app/_layout.tsx` but no screen uses the generated `use*` react-query hooks — all screens call the plain async fetchers directly.

### Alert.alert is a no-op on the Expo web export

React Native's `Alert.alert` (used for "Time's Up!" and the Toro Hint popup) doesn't render anything when the app is built/run as `expo export -p web` / `expo start --web`. Fine on native, silently does nothing on web — don't rely on it for critical web-reachable flows without a fallback.

## Where to look next

- Game design & mechanics: [`docs/game_proposal.md`](docs/game_proposal.md), [`docs/game_structure.md`](docs/game_structure.md).
- Agent roles, theming rules, full git policy: [`agents/instructions.md`](agents/instructions.md).
- Frontend specifics: [`mathematador-app/CLAUDE.md`](mathematador-app/CLAUDE.md).
- Backend specifics: [`server/CLAUDE.md`](server/CLAUDE.md).
