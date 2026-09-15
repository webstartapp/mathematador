import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  setAdsConsent,
  setGdprConsent,
  syncCurrentSettings,
} from "@/redux/slices/settingsSlice";
import { AppDispatch } from "@/redux/store";
import {
  userSettingsGetCurrent,
  userSettingsUpdate,
} from "@/src/_generated/api";
import { UserSettingKey } from "@/src/_generated/model";
import { getAuthToken } from "@/utils/api-client";
import { getOrCreateDeviceId } from "@/utils/consent";

// sound_enabled isn't here - it's a device preference tracked entirely in
// userSlice (see setSoundEnabled/useOleSound.ts), not one of this account-
// scoped, server-synced settings.
const SETTING_ACTIONS = {
  ads_consent: setAdsConsent,
  gdpr_consent: setGdprConsent,
};

// Module scope, not useRef: GameStack's stack navigator keeps a pushed
// screen's predecessor mounted underneath it (e.g. Home stays mounted
// while Settings is open), so a per-component ref would let two screens
// each get their own write queue - silently defeating the serialization/
// session-pinning this state exists for. A single instance shared by
// every caller (see RefManager.ts for the same module-singleton pattern
// used elsewhere in this codebase) is what actually guarantees "one
// queue, in order, for this session" app-wide.
// Guards against the mount-time GET resolving *after* the caller has
// already toggled a setting (e.g. a slow network) - without this, the
// stale server response would clobber the newer optimistic local value.
let hasLocalUpdate = false;
// Chains every write onto the previous one so rapid successive toggles
// reach the server - and get inserted as history rows - in call order,
// rather than as concurrent requests that can complete out of order.
let pendingWrite: Promise<void> = Promise.resolve();

const updateUserSetting = (
  dispatch: AppDispatch,
  settingKey: UserSettingKey,
  isEnabled: boolean,
): void => {
  // Optimistic local update regardless of the server call's outcome - same
  // shape as buyCosmetic/equipCosmetic's local-fallback reducers, so a
  // toggle never appears to silently fail for an offline user.
  hasLocalUpdate = true;
  dispatch(SETTING_ACTIONS[settingKey](isEnabled));
  // Captured now, synchronously with the toggle, rather than re-read
  // whenever this write reaches the front of the queue - pins the
  // eventual network request to the account active at the moment of the
  // toggle. Queued behind an earlier write, this call might not reach the
  // network until after a different account has since logged in; without
  // pinning, customInstance would attach whatever token is live *then*,
  // silently appending this stale toggle to the wrong account's history.
  // .catch() here (not just on the eventual userSettingsUpdate call below)
  // matters: an uncaught rejection would leave pendingWrite permanently
  // rejected, and every later write chained via .then() onto a rejected
  // promise skips its body entirely - one failed token read would
  // otherwise silently stop all future writes.
  const pinnedAuthToken = getAuthToken().catch(() => null);
  // Same stable per-device id already used for the consent gate (#31) - so
  // a Change History entry from a settings toggle and one from the
  // original consent both trace back to the same device identifier.
  // Never optional (unlike the auth token above): a write with no device
  // id isn't a degraded-but-acceptable write, so a failure to obtain one
  // fails this write entirely instead of silently sending one anyway.
  const deviceId = getOrCreateDeviceId();
  pendingWrite = pendingWrite
    .then(async () => {
      const authToken = await pinnedAuthToken;
      if (!authToken) {
        return;
      }
      await userSettingsUpdate(
        {
          settingKey,
          settingValue: isEnabled ? "true" : "false",
          deviceId: await deviceId,
        },
        { headers: { Authorization: `Bearer ${authToken}` } },
      ).catch(() => {
        // Local state already reflects the change; only server-side history
        // is missing this write until a later call succeeds.
      });
    })
    .catch(() => {
      // A failed device-id lookup (the only thing above with no catch of its
      // own) would otherwise reject this link and permanently poison every
      // later write chained onto pendingWrite - same reasoning as the
      // auth-token .catch() above, just covering the whole link at once.
    });
};

// Lets a caller (e.g. the history screen, before fetching) wait for every
// currently-queued write to settle first - without this, viewing history
// immediately after a toggle can race the still-in-flight POST and render
// without that just-made change.
// Loops rather than a single await: a write queued WHILE this wait is
// itself in flight re-assigns the module-level pendingWrite to a new
// promise chained onto the one just captured - a single await would
// resolve as soon as that older promise settles, racing ahead of the
// newer write's still-in-flight network call. Re-reading the reference
// after each await catches any write queued during the wait, and the loop
// only stops once a full await cycle sees no new promise appear.
export const waitForPendingUserSettingsWrites = async (): Promise<void> => {
  let observedWrite: Promise<void> | null = null;
  while (observedWrite !== pendingWrite) {
    observedWrite = pendingWrite;
    await observedWrite;
  }
};

// On mount: pull this account's current settings from the server and apply
// them over whatever's locally persisted - mirrors TiendaScreen.tsx's
// on-load fetch pattern (try the server, silently keep the existing/local
// state on failure rather than blocking or erroring the calling screen).
// Called once, from HomeScreen only - see updateUserSetting's module-scope
// comment above for why this isn't safe to call from more than one
// concurrently-mounted screen.
export const useSyncUserSettings = (): void => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let isCancelled = false;
    // Waits for any write already queued at mount time before resetting
    // the flag and fetching - without this, a remount (e.g. a second
    // account logging in on the same device right after a toggle) could
    // reset hasLocalUpdate and have the GET land *before* the earlier
    // toggle's still-in-flight POST does, dispatching a stale server
    // response that clobbers the not-yet-persisted optimistic value.
    // Reset happens after the wait, not left permanently true after the
    // first-ever toggle - hasLocalUpdate only needs to track "did a toggle
    // happen since THIS GET started", not "has any toggle ever happened in
    // this browser tab's lifetime". isCancelled (below, closed over per-
    // effect-instance) still separately guards a still-in-flight previous
    // mount's GET from dispatching after a newer mount has already reset
    // this flag.
    waitForPendingUserSettingsWrites()
      .then(() => {
        // isCancelled guards this reset and the GET itself, not just the
        // final dispatch below - without it, a mount that unmounted while
        // still waiting (e.g. Home remounting again before the earlier
        // wait even settled) would reset the shared hasLocalUpdate flag and
        // fire a needless GET on behalf of an effect instance nothing
        // still cares about, potentially undoing a newer mount's own reset.
        if (isCancelled) {
          return null;
        }
        hasLocalUpdate = false;
        return userSettingsGetCurrent();
      })
      .then((response) => {
        if (!isCancelled && !hasLocalUpdate && response?.data) {
          dispatch(syncCurrentSettings(response.data));
        }
      })
      .catch(() => {
        // Keep whatever's already in the (offline-persisted) local state.
      });
    return () => {
      isCancelled = true;
    };
  }, [dispatch]);
};

// Returns a stable updateSetting function backed by the shared module-
// level write queue above - safe to call from any screen (e.g. both
// HomeScreen and a pushed SettingsScreen at once).
export const useUpdateUserSetting = (): ((
  settingKey: UserSettingKey,
  isEnabled: boolean,
) => void) => {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    (settingKey: UserSettingKey, isEnabled: boolean): void => {
      updateUserSetting(dispatch, settingKey, isEnabled);
    },
    [dispatch],
  );
};
