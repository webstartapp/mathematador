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

const DEVICE_ID_DISPLAY_LENGTH = 8;

// "This device" when the entry matches the device viewing history (the
// common case, and the most useful answer to "did I do this?"); otherwise
// a shortened id - the full uuid is meant for the server-side audit trail,
// not for a human reading this list, but enough characters to tell two
// other devices apart from each other. Taken from the END of the id, not
// the start: consent.ts's fallback generator (used when crypto.randomUUID
// is unavailable) produces ids shaped `device-<timestamp>-<random>`, so
// every such id shares the same literal "device-" prefix and near-identical
// leading timestamp digits - slicing from the front would show the same
// characters for every device. The trailing characters (random for both
// the crypto.randomUUID and fallback formats) actually distinguish them.
export const formatDeviceId = (
  entryDeviceId: string,
  currentDeviceId: string | null,
): string =>
  entryDeviceId === currentDeviceId
    ? "This device"
    : `Device ${entryDeviceId.slice(-DEVICE_ID_DISPLAY_LENGTH)}`;
