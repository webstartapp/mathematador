import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import {
  setAdsConsent,
  setGdprConsent,
  setSoundEnabled,
  syncCurrentSettings,
} from "@/redux/slices/settingsSlice";
import { AppDispatch } from "@/redux/store";
import {
  userSettingsGetCurrent,
  userSettingsUpdate,
} from "@/src/_generated/api";
import { UserSettingKey } from "@/src/_generated/model";
import { getAuthToken } from "@/utils/api-client";

const SETTING_ACTIONS = {
  sound_enabled: setSoundEnabled,
  ads_consent: setAdsConsent,
  gdpr_consent: setGdprConsent,
};

interface UserSettingsSync {
  updateSetting: (settingKey: UserSettingKey, isEnabled: boolean) => void;
}

// On mount: pull this account's current settings from the server and apply
// them over whatever's locally persisted - mirrors TiendaScreen.tsx's
// on-load fetch pattern (try the server, silently keep the existing/local
// state on failure rather than blocking or erroring the calling screen).
export const useSyncUserSettings = (): UserSettingsSync => {
  const dispatch = useDispatch<AppDispatch>();
  // Guards against the mount-time GET resolving *after* the caller has
  // already toggled a setting (e.g. a slow network) - without this, the
  // stale server response would clobber the newer optimistic local value.
  const hasLocalUpdateRef = useRef(false);
  // Chains every write onto the previous one so rapid successive toggles
  // reach the server - and get inserted as history rows - in call order,
  // rather than as concurrent requests that can complete out of order.
  const pendingWriteRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isCancelled = false;
    userSettingsGetCurrent()
      .then((response) => {
        if (!isCancelled && !hasLocalUpdateRef.current && response?.data) {
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

  const updateSetting = useCallback(
    (settingKey: UserSettingKey, isEnabled: boolean): void => {
      // Optimistic local update regardless of the server call's outcome -
      // same shape as buyCosmetic/equipCosmetic's local-fallback reducers,
      // so a toggle never appears to silently fail for an offline user.
      hasLocalUpdateRef.current = true;
      dispatch(SETTING_ACTIONS[settingKey](isEnabled));
      // Captured now, synchronously with the toggle, rather than re-read
      // whenever this write reaches the front of the queue - pins the
      // eventual network request to the account active at the moment of
      // the toggle. Queued behind an earlier write, this call might not
      // reach the network until after a different account has since
      // logged in; without pinning, customInstance would attach whatever
      // token is live *then*, silently appending this stale toggle to the
      // wrong account's history.
      // .catch() here (not just on the eventual userSettingsUpdate call
      // below) matters: an uncaught rejection would leave pendingWriteRef
      // permanently rejected, and every later write chained via .then()
      // onto a rejected promise skips its body entirely - one failed
      // token read would otherwise silently stop all future writes.
      const pinnedAuthToken = getAuthToken().catch(() => null);
      pendingWriteRef.current = pendingWriteRef.current.then(async () => {
        const authToken = await pinnedAuthToken;
        if (!authToken) {
          return;
        }
        await userSettingsUpdate(
          {
            settingKey,
            settingValue: isEnabled ? "true" : "false",
          },
          { headers: { Authorization: `Bearer ${authToken}` } },
        ).catch(() => {
          // Local state already reflects the change; only server-side
          // history is missing this write until a later call succeeds.
        });
      });
    },
    [dispatch],
  );

  return { updateSetting };
};
