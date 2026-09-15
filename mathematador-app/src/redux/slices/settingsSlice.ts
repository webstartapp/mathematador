import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { setAuth } from "@/redux/slices/userSlice";
import { UserSetting } from "@/src/_generated/model";

export interface SettingsState {
  adsConsent: boolean;
  gdprConsent: boolean;
}

// A factory (matching userSlice.ts's own convention), not a shared literal -
// see setAuth's extraReducer below for why this needs to produce a fresh
// object on every account switch rather than reusing one reference.
// Ads/GDPR consent default true: reaching any authenticated screen already
// implies the mandatory consent gate (#31) was passed, so there's nothing
// to re-confirm here until this account explicitly changes one of these
// settings for the first time (no history row exists for it yet). Sound
// is deliberately not tracked here - it's a device preference (like
// userSlice's musicEnabled), not account data, see useOleSound.ts.
const createInitialState = (): SettingsState => ({
  adsConsent: true,
  gdprConsent: true,
});

const initialState: SettingsState = createInitialState();

const parseBooleanSettingValue = (settingValue: string): boolean =>
  settingValue === "true";

const applySetting = (state: SettingsState, setting: UserSetting): void => {
  const isEnabled = parseBooleanSettingValue(setting.settingValue);
  if (setting.settingKey === "ads_consent") {
    state.adsConsent = isEnabled;
  } else if (setting.settingKey === "gdpr_consent") {
    state.gdprConsent = isEnabled;
  }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAdsConsent(state, action: PayloadAction<boolean>) {
      state.adsConsent = action.payload;
    },
    setGdprConsent(state, action: PayloadAction<boolean>) {
      state.gdprConsent = action.payload;
    },
    // Applies the server's latest-per-key values on top of whatever's
    // currently in state - safe to merge-only (rather than reset-then-
    // apply) because setAuth's extraReducer below already resets every
    // one of these fields to its true default at login, before this ever
    // has a chance to run.
    syncCurrentSettings(state, action: PayloadAction<UserSetting[]>) {
      action.payload.forEach((setting) => applySetting(state, setting));
    },
  },
  extraReducers: (builder) => {
    // These settings are account-scoped (unlike userSlice's musicEnabled/
    // soundEnabled, deliberate per-device exceptions spared by this same
    // reset) - without this, logging into a second account on the same
    // device/browser would silently inherit the first account's
    // locally-persisted values for any setting the second account has
    // never itself changed, until the server sync happened to overwrite
    // it (and never for a key neither account has ever touched).
    builder.addCase(setAuth, () => createInitialState());
  },
});

export const { setAdsConsent, setGdprConsent, syncCurrentSettings } =
  settingsSlice.actions;
export default settingsSlice.reducer;
