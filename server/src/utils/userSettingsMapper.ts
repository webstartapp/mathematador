import { UserSettingKey } from "@/_generated/be_fe.zod";
import { UserSetting } from "@/_generated/model";
import { UserSettingsHistoryRow } from "@/types/KnexDBType";

// Only the columns callers actually .select() - a Pick, not the full row
// type, since knex's return type narrows to exactly the selected columns.
type SettingsHistoryRowProjection = Pick<
  UserSettingsHistoryRow,
  "setting_key" | "setting_value" | "created" | "device_id"
>;

// setting_key is stored as a plain string column, but UserSetting.settingKey
// is the generated literal-union type - safeParse (not a type assertion,
// which this repo's lint config bans) is what actually narrows it. A row
// whose key isn't a currently-known setting (e.g. a retired one from a
// future migration) is dropped rather than surfaced as a broken entry.
export const mapSettingsHistoryRows = (rows: SettingsHistoryRowProjection[]): UserSetting[] => {
  const formattedSettings: UserSetting[] = [];
  for (const settingRow of rows) {
    const parsedKey = UserSettingKey.safeParse(settingRow.setting_key);
    if (parsedKey.success) {
      formattedSettings.push({
        settingKey: parsedKey.data,
        settingValue: settingRow.setting_value,
        changedAt: settingRow.created.toISOString(),
        deviceId: settingRow.device_id
      });
    }
  }
  return formattedSettings;
};
