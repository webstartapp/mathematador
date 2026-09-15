import { UserSettingKey } from "@/src/_generated/model";

// Shared by SettingsScreen and SettingsHistoryScreen so a label can't drift
// out of sync between the toggle screen and the history view.
export const SETTING_KEY_LABELS: Record<UserSettingKey, string> = {
  ads_consent: "Ads Consent",
  gdpr_consent: "GDPR Consent",
};

// changedAt is always a valid ISO instant produced server-side by
// Date.toISOString() (see userSettingsMapper.ts) - no fallback needed for
// an unparseable value.
export const formatSettingChangedAt = (changedAt: string): string =>
  new Date(changedAt).toLocaleString();

export const formatSettingValue = (settingValue: string): string =>
  settingValue === "true" ? "Enabled" : "Disabled";
