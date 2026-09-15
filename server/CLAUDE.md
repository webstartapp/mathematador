# server — Backend Guide

Express + TypeScript + Knex (PostgreSQL). Single entry point `src/index.ts` → `src/routes.ts` (all routing is hand-written; nothing is auto-registered from the OpenAPI spec). See the [root `CLAUDE.md`](../CLAUDE.md) first for monorepo-wide conventions, dev commands, and known gotchas — this file only covers what's specific to this workspace.

## Request lifecycle

1. `src/index.ts` — Express app, permissive CORS (`exposedHeaders: ["Authorization"]`, no `origin` restriction configured), 100mb JSON/urlencoded body limit.
2. `src/routes.ts` — every route registered explicitly. Public: `POST /user/login`, `POST /user/register`, `POST /user/forgotten`, `POST /user/forgotten-password`, and **`PUT /user/login`** (password update — see the root gotchas, this one is missing `requireAuth` and is a real security hole). Everything else (`/challenges/*`, `/cosmetics`, `/user/cosmetics/*`, `/subscriptions`, `/game/progress`) is wrapped in `requireAuth`.
3. `src/middlewares/auth.ts` (`requireAuth`) — parses the `Authorization: Bearer <token>` header, verifies+decodes the JWT, re-fetches the user row to confirm it still exists, attaches `request.userId`/`request.userRole`.
4. Each resolver is built with `src/utils/restAPI.ts`'s `restAPICall(apiName, path, resolver, { params?, body? })` — this is what type-checks each resolver's request/response shape against the Orval-generated `IRestAPI` type (`src/utils/apiProxy.ts`), zod-validates `params`/`body` when a schema is given (returning 400 on failure and **overwriting** `request.params`/`request.body` with the parsed/coerced values), and catches any uncaught exception into a 500. It does not read `userId` itself — that's always `requireAuth`'s job upstream.

`src/_generated/serverAPI.ts` looks like route registration but isn't — it's a type-only fetch-client used purely so `apiProxy.ts` can constrain `restAPICall`'s generics. Real routing is 100% `routes.ts` + the `apiPaths/` resolvers.

## Resolvers (`src/resolvers/apiPaths/`)

| File | Route | Notes |
|---|---|---|
| `userLogin.ts` | `POST /user/login` | bcrypt compare, signs JWT (no expiry set), sets `Authorization` response header. |
| `userLoginPassword.ts` | `PUT /user/login` | **Not auth-gated** — see root gotchas, this is a real vulnerability. |
| `userRegister.ts` | `POST /user/register` | Rejects duplicate email, hashes password, signs JWT. |
| `userForgotten.ts` / `userForgottenPassword.ts` | `POST /user/forgotten`, `POST /user/forgotten-password` | Stubs — no email is actually sent by either. |
| `challengeStartNew.ts` | `POST /challenges/:operationId` | Ensures `operation_progress` exists, generates exercises via `mathGenerator.ts`, defaults `minigame` to `"singleLine"` if omitted. |
| `challengeGet.ts` / `challengeGetAll.ts` | `GET /challenges/:operationId[/:id]` | Note `challengeGet.ts` hardcodes `maxTime`/xp/coin constants rather than reading `challengeConfig.ts` — worth reconciling if you touch challenge-config values. |
| `challengeUpdateResult.ts` | `PUT /challenges/:operationId/:id` | Scoring/XP/coin authority — inspired-streak bonus logic lives here, mirrored client-side in `getChallengeResult.ts`. Keep the two in sync; the server is the source of truth for what's actually persisted. |
| `cosmeticsGet.ts` / `cosmeticsBuy.ts` / `cosmeticsEquip.ts` | `GET /cosmetics`, `POST /user/cosmetics/buy`, `POST /user/cosmetics/equip` | Buy/equip run inside a `rawKnex.transaction` with a row lock (`forUpdate()`); coin balance is *never stored*, always derived from completed-challenge `result.coins` minus spent cosmetic prices. |
| `gameProgress.ts` | `GET /game/progress` | Thin wrapper around `getUserProgress()` (`utils/gameProgress.ts`), the shared aggregator also used by the cosmetics resolvers. |
| `subscriptionUpdate.ts` / `subscriptionCancelImmediately.ts` | `POST` / `DELETE /subscriptions` | Upsert / delete the user's single subscription row. |

## Database (`src/migrations/`)

A single consolidated migration, `20260915100000_initial_schema.js`, creates the entire current schema in one file — `users`, `subscriptions`, `challenges`, `operation_progress`, `cosmetics`, `user_cosmetics` (unique `(user_id, cosmetic_id)` + a **partial unique index** enforcing one equipped item per `cosmetic_type`), `minigame_progress` (unique `(user_id, minigame_id)`), and `user_settings_history` (append-only settings/consent change log, #32 — its oldest `ads_consent`/`gdpr_consent` row per account also serves as that account's original consent proof, #31), plus seed data (a root/admin user — this is the row `userLoginPassword.ts`'s bug can hijack — and the cosmetics shop inventory `TiendaScreen.tsx`'s `FALLBACK_COSMETICS` mirrors). This replaced a chain of incremental migrations now that the MVP has never gone live — nothing exists yet that a real migration history would need to preserve, so collapsing it removed noise rather than losing anything. Once real data exists anywhere that matters, go back to one migration per change.

Row types live in `src/types/KnexDBType.ts` (`IDBType` maps table name → row type, used to parametrize the typed `knex()` helper from `knexWrapper.ts`).

## Connection config (`src/knexWrapper.ts`)

Dev vs. prod is switched by the `DATABASE` env var (`"stage"` → `STAGE_DATABASE_URL`, `"production"` → `DATABASE_URL`) — **not** `NODE_ENV`. SSL is disabled only when `NO_DATABASE_SSL=yes`, otherwise `{ rejectUnauthorized: false }`. Pool `max` is 20 locally, 400 otherwise (assumes a pooled prod DB, e.g. PgBouncer). The Knex CLI (`knexfile.js`) auto-selects compiled (`build/knexWrapper`) vs. `ts-node` (`src/knexWrapper`) depending on whether `build/` exists.

## Auth internals (`src/utils/JWT.ts`, `src/utils/password.ts`)

`signToken({userId, role})`/`verifyToken`/`tokenContext` wrap `jsonwebtoken`, secret from `process.env.JWT_SECRET` (throws if unset). Tokens expire after 30 days (`expiresIn: "30d"`). Passwords: bcrypt via `password.ts`, `genSalt(10)`.

## Dead code specific to this workspace

`src/types/enums.ts` (unused boilerplate, identical to the frontend's copy), `src/_generated/serverAPI.ts` (type-extraction only, see above), the `DBConfig`/`DBConfigType` placeholder in `KnexDBType.ts` (kept only so an `expressTypeResolver.ts` that no longer exists would still compile).
