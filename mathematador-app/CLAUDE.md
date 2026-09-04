# mathematador-app — Frontend Guide

React Native + Expo (SDK 56) client. Router: Expo Router provides a thin outer shell (`app/_layout.tsx`, routes `index` + `+not-found`, plus `app/info/[slug].tsx` and `app/admin/index.tsx`); the *real* game navigation is a hand-coded React Navigation stack inside `app/index.tsx`. That inner stack is wrapped in its own `NavigationContainer` via React Navigation's `NavigationIndependentTree` pattern (`expo-router/build/react-navigation/core` and `/native`) — without this isolation, the inner stack shares Expo Router's single linking system by default and React Navigation's default path serialization writes every screen name into the browser URL (confirmed live while building issue #33: Home → SelectOperation actually changed the address bar). With the isolation in place, gameplay always stays at `/` no matter how deep the in-game navigation goes, while `/info/[slug]` and `/admin` remain real, distinct, bookmarkable URLs. State: Redux Toolkit + `redux-persist`/AsyncStorage, offline-first (see `agents/instructions.md` §2).

See the [root `CLAUDE.md`](../CLAUDE.md) first for monorepo-wide conventions, dev commands, and known gotchas — this file only covers what's specific to this workspace.

## Screen flow & navigation

`RootStackParamList` (`src/types/Navigation.ts`) declares 11 routes, but only **7 are actually registered** in `app/index.tsx`: `Home`, `SelectOperation`, `ChalengeSelect`, `ChallengeResult`, `Challenge`, `Tienda`, `Gauntlet`. `Level`, `Statistics`, `Profile`, and `DailyCorrida` are declared but dead — nothing navigates to them (Daily Challenge is real, but reached by launching the `Challenge` screen with `operationId: "daily_challenge"` from `GauntletScreen.tsx`, not via a `DailyCorrida` route).

Two parallel user flows both end up at the same `ChallengeGameScreen`:
- **Practice loop**: `HomeScreen` → `OperationSelectionScreen` → `ChalengeSelectScreen` → `Challenge`. Exercises come from `helpers/getChalengeByLevel.ts` (procedural, local, no `.result` set).
- **Coliseo hub**: `HomeScreen` → `GauntletScreen` (`"Gauntlet"` route) → `Challenge`, for both the Gauntlet and Daily Challenge cards. Calls `challengeStartNew()` server-side with an offline fallback (`generateOfflineExercises`) if that fails. **Currently broken** — see root gotchas.

## Redux (`src/redux/`)

- **`userSlice.ts`** is the real state owner: `level`/`xp`/`coins`, `operationProgress[]`, `minigameProgress[]`, cosmetics (`purchasedCosmetics`, `equippedCape/Suit/Flare`). No `id` field — this is why auth token re-attachment never works (see root gotchas). Key reducers: `completeChalange` (advances progress, regenerates next local challenge), `syncProgress` (merges a server `GameProgress` response in wholesale — used after any successful API call), `buyCosmetic`/`equipCosmetic` (local-only fallback when the server call fails).
- **`gameSlice.ts`** — dead. Not read/dispatched by any live screen.
- **`navigationSlice.ts`** — tiny, holds `backToParams` for the custom header's back button.
- **`store.ts`**: `persistReducer` whitelist is `["user", "game", "navigation"]` — everything is persisted, no non-persisted slice exists. Storage is AsyncStorage on native, a no-op stub under SSR/`typeof window === "undefined"`.

## API client & auth (`src/_generated/`, `src/utils/api-client.ts`)

- `src/_generated/api.ts` is Orval output — plain async fetchers **and** unused `use*` react-query hooks (every screen calls the plain fetcher directly, e.g. `cosmeticsGetAll()`, not `useCosmeticsGetAll()`; `QueryClientProvider` in `_layout.tsx` is set up but currently pointless).
- Every fetcher routes through `customInstance` (`utils/api-client.ts`), the Orval mutator, which wraps axios.
- Auth token flow: after any `/user/login`/`/user/register` response, the `Authorization` response header is read and persisted to `AsyncStorage["auth_token"]`. On subsequent requests, `getPersistedViewerId()` reads the persisted `user` slice looking for an `id` field to decide whether to attach the stored token — but `userSlice` never has one (see above), so this always resolves `undefined` and the token is deleted/never attached. **Practical effect: treat all authenticated calls as if they will 401**, and make sure new authenticated flows have an offline/local fallback like `GauntletScreen.tsx`/`TiendaScreen.tsx` already do.
- No `LoginScreen`/`RegisterScreen` exists. If you're asked to build one, you'll also need to add an `id` field to `UserState` and populate it on login/register success, or the token plumbing above still won't work end-to-end.

## Minigames (`src/components/minigames/`)

`configs/minigames.ts` is the registry `ChallengeGameScreen.tsx` looks components up in by `id`. Today it has exactly one entry, `SingleLineMinigame` (id **`"SingleLineMinigame"`** — see the root gotchas for why this string mismatches the rest of the system and breaks Gauntlet/Daily). `docs/game_structure.md` documents three more as schema-planned-but-unbuilt: `dragAndDrop`, `crossNumbers`, `memory` — none of these have a component registered here, so don't assume they're selectable in the running app.

`SingleLineMinigame.tsx` composes `Exercise.tsx` (renders the equation + answer slots) and `MinigameKeyboard.tsx`/`DraggableKeyboard*.tsx` (digit input — both drag-to-drop *and* tap-to-select-then-tap-to-place are supported as of the Toro Inspiration work, `helpers/useDigitPlacement.ts`). `ChallengeGameScreen.tsx` wraps the active minigame with the Toro Cooperation panel (`ToroPanel`), the combo streak meter/popup/reward-burst (`src/components/toro/`), and the countdown timer — none of that lives inside the minigame components themselves, so a new minigame type gets Toro/combo support for free just by being registered here and honoring `challenge.onAnswerSubmit`/`onIndexChange`.

## Cosmetics shop (`TiendaScreen.tsx`)

Fetches `cosmeticsGetAll()` on mount; on any failure (almost certainly triggered in practice by the broken auth above) falls back to a hardcoded `FALLBACK_COSMETICS` array that mirrors the DB seed exactly. Buy/equip call `cosmeticsBuy`/`cosmeticsEquip` and merge the response via `syncProgress`; on failure they fall back to local-only `buyCosmetic`/`equipCosmetic` reducers with no server persistence. If you change the cosmetics schema, update both the DB seed (`server/src/migrations/20260615204201_cosmetics_and_progression.js`) and `FALLBACK_COSMETICS` together or the two will drift.

## Dead code specific to this workspace

See the root `CLAUDE.md`'s "Dead / vestigial code" list — most of it is frontend-specific: `gameSlice.ts`, `configs/challengeExercises.ts`, `types/enums.ts`, `hooks/useTypedSelector.ts` (empty file), `HeaderModule`/`HeaderEvents.ts` (no native module ever registered), `GauntletScreen.tsx`'s hardcoded fake leaderboard, the unused `QueryClientProvider`.
