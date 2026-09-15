import { UserSettingsUpdateBody } from "@/_generated/be_fe.zod";
import knex from "@/knexWrapper";
import { restAPICall } from "@/utils/restAPI";

// Both keys tracked today are booleans - validated per-key (not by
// constraining the shared settingValue schema to a "true"/"false" enum)
// so a future non-boolean setting doesn't need this schema changed.
const BOOLEAN_SETTING_KEYS = new Set(["ads_consent", "gdpr_consent"]);
const BOOLEAN_SETTING_VALUES = new Set(["true", "false"]);

export const userSettingsUpdate = restAPICall(
  "mathematador",
  "userSettingsUpdate",
  async (request, response): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      response.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { settingKey, settingValue } = request.body;

    if (BOOLEAN_SETTING_KEYS.has(settingKey) && !BOOLEAN_SETTING_VALUES.has(settingValue)) {
      response.status(400).json({
        message: `Invalid settingValue for ${settingKey}: expected "true" or "false"`
      });
      return;
    }

    // Always a fresh insert, never an update-in-place - this table is an
    // append-only history log, so every change is its own row.
    const [insertedRow] = await knex("user_settings_history")
      .insert({
        user_id: userId,
        setting_key: settingKey,
        setting_value: settingValue
      })
      .returning("created");

    response.status(200).json({
      settingKey,
      settingValue,
      changedAt: insertedRow.created.toISOString()
    });
  },
  {
    body: UserSettingsUpdateBody
  }
);
