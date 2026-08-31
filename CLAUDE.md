# Mathematador — Technical Guide for Agents

Mathematador is a math-practice mobile game ("El Coliseo de los Números" / *The Numbers Coliseum*) built as a two-workspace **npm workspaces monorepo**:

- **`mathematador-app/`** — React Native + Expo (SDK 56) client, targets iOS/Android/Web.
- **`server/`** — Express + Knex + PostgreSQL backend.

The gameplay theme: the player is a rookie *Torero* solving arithmetic "passes" (addition/subtraction/multiplication/division) with a friendly companion, the **Toro Numérico** (never an enemy — see `agents/instructions.md` §2 for the strict 0+ theming rules before touching any Toro-related UI). Full game design lives in [`docs/game_proposal.md`](docs/game_proposal.md) and [`docs/game_structure.md`](docs/game_structure.md) — read those for *what the game is*; this file is about *how the code is organized and what to watch out for*.

For workspace-specific detail, see the nested guides: [`mathematador-app/CLAUDE.md`](mathematador-app/CLAUDE.md) and [`server/CLAUDE.md`](server/CLAUDE.md).

## Current direction: the MVP epic

As of 2026-08-27, active work is driven by [issue #29](https://github.com/webstartapp/mathematador/issues/29) ("Epic: Mathematador MVP — mathematador.net") and its ~14 child issues — check it first for current priorities/status rather than assuming this file's architecture description is the target state. The MVP **deliberately reverses** some facts documented below:

- **Offline-first → mandatory login for the web MVP.** The app today has no login UI at all and is designed to work fully offline (see `agents/instructions.md` §2). The MVP requires a real authenticated session to enter at all (#30) — offline/anonymous play is explicitly out for the web target, though this file's "offline-first" architecture description still describes today's actual code until that lands.
- **No ads/consent/CMS/admin infra today** — the MVP adds all of it from scratch (consent gate #31, settings-with-history #32, CMS-backed `/info`/`/admin` pages #33–#36, ads #38). None of this exists yet in the codebase this file describes.
- **Only one minigame exists today** (`SingleLineMinigame`) — the MVP's game-modes rework (#37) is blocked on agreeing a roster of ~10 (#28) before it can proceed.

The rest of this file (and the nested workspace guides) describes the codebase **as it stands today**, which is still accurate for anything the MVP hasn't touched yet — just don't be surprised when auth, ads, or an admin panel show up; check the epic for what's landed.

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

A single OpenAPI spec, `analytics/_swaggers/be_fe.yaml`, drives **all** generated code on both sides via `orval.config.ts` (run with `npm run generate`). Never hand-edit anything under `_generated/` — edit the spec and regenerate. Keeping the generated code in sync with the spec is a developer responsibility, not a CI gate — `pr-checks.yml` deliberately does **not** run `npm run generate`/diff-check itself; run it locally before committing when you touch the spec or `orval.config.ts`.

## Dev commands (run from repo root)

```bash
npm run dev          # concurrently runs server (nodemon) + Expo app, via scripts/dev.js
npm run lint          # eslint . across both workspaces
npm test              # server tests, then app tests
npm run build          # server tsc build, then app `expo export -p web`
npm run generate       # regenerate all Orval clients/models/zod schemas from the OpenAPI spec
```

Each workspace loads its own `.env` independently — `server/.env` (see `server/.env.example`) and `mathematador-app/.env` (see `mathematador-app/.env.example`); there is no shared root `.env`. `npm run dev` ([scripts/dev.js](scripts/dev.js)) is pure orchestration (`concurrently` running both workspaces' own dev commands) with no env-handling logic of its own — this matches how production deploys already work (`deploy.yml` copies two separate env files, `server/.env` and `web/.env`, onto the server). `server/.env`'s `PORT` defaults to 4076 (read directly in `server/src/index.ts`, populated via `dotenv` in `server/src/knexWrapper.ts`); `mathematador-app/.env`'s `RCT_METRO_PORT` defaults to 4075 (the actual env var Expo's CLI reads natively for its dev-server port — picked up automatically by Expo's built-in `.env` support, no code needed). `DATABASE=stage|production` (in `server/.env`) switches which Postgres connection string `server/src/knexWrapper.ts` uses (not `NODE_ENV`).

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

Run `npx eslint <path>` on files you touch before considering a change done — `npm run lint` at the repo root is what CI actually runs. `pr-checks.yml` is deliberately minimal: install → lint → build (server, then app) → test → done. It does not run the OpenAPI-generate/diff check — keeping the generated code in sync with the spec is a developer responsibility, not a CI gate (see below).

## Git / PR workflow

Full policy is in [`agents/instructions.md`](agents/instructions.md) — summary:

1. Branch from `develop`: `issue-<number>-<short-description>`.
2. Implement, then verify locally (see below) — CI checks (`pr-checks.yml`) sometimes don't report on a PR promptly, so **run the equivalent commands locally before merging, don't rely on the PR's check status alone**: `npm run lint`, `npm run build --workspace=server`, `npm run build --workspace=mathematador-app`, `npm test` (this is the full extent of what CI runs). If you touched the OpenAPI spec or `orval.config.ts`, also run `npm run generate && git diff --exit-code` locally — CI does not check this.
3. Push directly — pushes to feature branches (`issue-*`) are pre-approved per `agents/instructions.md` §3.4. Pushes/merges to `develop`/`main` are not.
4. Open a PR targeting `develop` with `Closes #<number>` in the body.
5. This repo's convention has been **squash-merge**, with the feature branch deleted (locally and on origin) immediately after.
6. `agents/verify.js` / `agents/submit-pr.js` / `agents/issue-helper.js` automate steps 2/4 and branch setup respectively, if you'd rather run a script than the raw commands.

An automated review bot (`cubic-dev-ai`) comments on PRs — treat its findings as a real second opinion, verify each one against the code before dismissing or fixing.

## Known gotchas & pre-existing bugs

These were found while mapping the codebase (2026-08-27) and are **not** things you introduced — don't waste time re-discovering them, but do fix them if you're touching the affected area. Several are already tracked as part of the [MVP epic](https://github.com/webstartapp/mathematador/issues/29)'s child issues, noted below.

### 🔴 Gauntlet & Daily Challenge are completely broken (minigame-id mismatch)

`mathematador-app/src/configs/minigames.ts` registers its only minigame as `id: "SingleLineMinigame"`. Every other part of the system — the generated `Minigame` enum, the server, `server/src/utils/mathGenerator.ts`, and critically `mathematador-app/src/screens/GauntletScreen.tsx` (both its server-backed path and its offline fallback) — uses the string `"singleLine"`. `ChallengeGameScreen.tsx:241` looks up the component by exact string match, so **starting a Gauntlet run or the Daily Challenge always renders "Minigame component not found."** instead of the game. The normal per-operation practice flow is unaffected because it sources the id from the same config it looks it up in (`helpers/getChalengeByLevel.ts`). Fix: align on `"singleLine"` everywhere (that's what the DB/enum/server already use). Tracked as part of [#37](https://github.com/webstartapp/mathematador/issues/37).

### ⚠️ `operations.ts`'s subtraction/division `getResult` looks buggy but isn't

`mathematador-app/src/configs/operations.ts`: subtraction's `getResult` reduces with `+` (looks copy-pasted from addition); division's reduces with `*` (looks copy-pasted from multiplication). **This was flagged as an active bug during earlier mapping and turned out to be wrong** — worth recording so it isn't "fixed" into an actual bug later. Both operations have `resultIsFirst: true`, which changes how `Exercise.tsx`/`SingleLineMinigame.tsx` use `getResult`'s output entirely: for a raw exercise `[a, b]`, the displayed equation becomes `getResult([a,b]) - a = ?` (subtraction) or `getResult([a,b]) / a = ?` (division), and the expected answer checked is `exercise[exercise.length - 1]` (i.e. `b`) — `getResult` is **never** used as the expected answer for these two operations, only to compute the *other* displayed term. `a + b` is exactly the value that makes `(a+b) - a = b` true; `a * b` is exactly the value that makes `(a*b) / a = b` true. Hand-verified with concrete numbers (a=7, b=3 → displayed "10 − 7 = ?", correct answer 3). Swapping these to literal `-`/`/` would silently break both operations.

### 🟠 Auth is not wired up end-to-end

No `LoginScreen`/`RegisterScreen` exists — there is no UI path to obtain a JWT. Even if there were, `userSlice`'s `UserState` never stores the user's `id`, so `mathematador-app/src/utils/api-client.ts`'s `getPersistedViewerId()` always resolves to `undefined`, meaning a stored token would never be re-attached to requests anyway. Every screen that calls an authenticated endpoint (`GauntletScreen`, `TiendaScreen`) is written defensively with try/catch + local-Redux fallback specifically because of this — assume authenticated calls will 401 and silently fall back until this is fixed. Being built for real as part of [#30](https://github.com/webstartapp/mathematador/issues/30).

### 🔴 Unauthenticated password-reset endpoint (security)

`server/src/routes.ts` registers `PUT /user/login` (→ `userLoginPassword.ts`) **without** the `requireAuth` middleware every other sensitive route uses. The handler falls back to updating the *first row in the `users` table* (in practice the seeded root admin) when `request.userId` is unset — which it always is on this unauthenticated route. Anyone who knows the endpoint exists can reset the admin account's password. Needs a real fix (proper forgotten-password token flow, or at minimum `requireAuth` + scoping the update to the caller's own row). Tracked as part of [#30](https://github.com/webstartapp/mathematador/issues/30) since it's the same auth surface.

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

- **Current priorities & roadmap: [issue #29](https://github.com/webstartapp/mathematador/issues/29) (MVP epic) and its child issues.** Check this before assuming any other doc reflects where the project is headed.
- Game design & mechanics: [`docs/game_proposal.md`](docs/game_proposal.md), [`docs/game_structure.md`](docs/game_structure.md).
- Agent roles, theming rules, full git policy: [`agents/instructions.md`](agents/instructions.md).
- Frontend specifics: [`mathematador-app/CLAUDE.md`](mathematador-app/CLAUDE.md).
- Backend specifics: [`server/CLAUDE.md`](server/CLAUDE.md).
