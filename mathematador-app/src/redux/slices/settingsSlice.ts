import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { UserSetting } from "@/src/_generated/model";

export interface SettingsState {
  soundEnabled: boolean;
  adsConsent: boolean;
  gdprConsent: boolean;
  history: UserSetting[];
}

// Ads/GDPR consent default true: reaching any authenticated screen already
// implies the mandatory consent gate (#31) was passed, so there's nothing
// to re-confirm here until this account explicitly changes one of these
// settings for the first time (no history row exists for it yet).
const initialState: SettingsState = {
  soundEnabled: true,
  adsConsent: true,
  gdprConsent: true,
  history: [],
};

const parseBooleanSettingValue = (settingValue: string): boolean =>
  settingValue === "true";

const applySetting = (state: SettingsState, setting: UserSetting): void => {
  const isEnabled = parseBooleanSettingValue(setting.settingValue);
  if (setting.settingKey === "sound_enabled") {
    state.soundEnabled = isEnabled;
  } else if (setting.settingKey === "ads_consent") {
    state.adsConsent = isEnabled;
  } else if (setting.settingKey === "gdpr_consent") {
    state.gdprConsent = isEnabled;
  }
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },
    setAdsConsent(state, action: PayloadAction<boolean>) {
      state.adsConsent = action.payload;
    },
    setGdprConsent(state, action: PayloadAction<boolean>) {
      state.gdprConsent = action.payload;
    },
    // Applies the server's latest-per-key values on top of whatever's
    // currently in state - a key this account has never changed simply
    // isn't in the payload, leaving its default/persisted value alone.
    syncCurrentSettings(state, action: PayloadAction<UserSetting[]>) {
      action.payload.forEach((setting) => applySetting(state, setting));
    },
    syncSettingsHistory(state, action: PayloadAction<UserSetting[]>) {
      state.history = action.payload;
    },
  },
});

export const {
  setSoundEnabled,
  setAdsConsent,
  setGdprConsent,
  syncCurrentSettings,
  syncSettingsHistory,
} = settingsSlice.actions;
export default settingsSlice.reducer;
