import { UserSettingsUpdateBody } from "@/_generated/be_fe.zod";
import { restAPICall } from "@/utils/restAPI";
import { withUserSettingsLock } from "@/utils/userSettingsLock";

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

    const { settingKey, settingValue, deviceId } = request.body;

    if (BOOLEAN_SETTING_KEYS.has(settingKey) && !BOOLEAN_SETTING_VALUES.has(settingValue)) {
      response.status(400).json({
        message: `Invalid settingValue for ${settingKey}: expected "true" or "false"`
      });
      return;
    }

    // Locked (userConsentRecord.ts takes the same lock) so a toggle here
    // can never race that resolver's first-consent check-and-seed - without
    // it, both could decide what "the current value" is at nearly the same
    // moment, with one silently clobbering the other.
    const insertedRow = await withUserSettingsLock(userId, async (transactionObject) => {
      // Always a fresh insert, never an update-in-place - this table is an
      // append-only history log, so every change is its own row.
      const [row] = await transactionObject("user_settings_history")
        .insert({
          user_id: userId,
          setting_key: settingKey,
          setting_value: settingValue,
          device_id: deviceId
        })
        .returning(["created", "device_id"]);
      return row;
    });

    response.status(200).json({
      settingKey,
      settingValue,
      changedAt: insertedRow.created.toISOString(),
      deviceId: insertedRow.device_id
    });
  },
  {
    body: UserSettingsUpdateBody
  }
);
